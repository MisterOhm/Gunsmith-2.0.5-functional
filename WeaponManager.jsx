import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WeaponEditor from './WeaponEditor';
import { db, storage } from '../../firebase';
import { 
  collection, getDocs, doc, addDoc, updateDoc, deleteDoc, 
  query, orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Fallback to mock data if needed
import weaponsData from '../../mockData/weapons.json';

function WeaponManager() {
  const [weapons, setWeapons] = useState([]);
  const [editingWeapon, setEditingWeapon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  
  // Load weapons from Firestore
  useEffect(() => {
    const loadWeapons = async () => {
      try {
        setLoading(true);
        const weaponsCollection = collection(db, 'weapons');
        const weaponsQuery = query(weaponsCollection, orderBy('name'));
        const snapshot = await getDocs(weaponsQuery);
        
        if (snapshot.empty) {
          // If no weapons in Firestore, use mock data
          setWeapons(weaponsData);
          // Optionally seed Firestore with mock data
          for (const weapon of weaponsData) {
            await addDoc(collection(db, 'weapons'), weapon);
          }
        } else {
          const loadedWeapons = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setWeapons(loadedWeapons);
        }
      } catch (err) {
        console.error('Error loading weapons:', err);
        setError('Failed to load weapons. Check console for details.');
        // Fallback to mock data
        setWeapons(weaponsData);
      } finally {
        setLoading(false);
      }
    };
    
    loadWeapons();
  }, []);
  
  const handleSaveWeapon = async (weaponData, modelFile, thumbnailFile) => {
    try {
      setLoading(true);
      let updatedWeaponData = { ...weaponData };
      
      // Upload files to Firebase Storage if provided
      if (modelFile) {
        const modelPath = `models/${Date.now()}_${modelFile.name}`;
        const modelRef = ref(storage, modelPath);
        await uploadBytes(modelRef, modelFile);
        const modelUrl = await getDownloadURL(modelRef);
        updatedWeaponData.baseModelPath = modelUrl;
        
        // Add loading status to indicate optimization is happening
        updatedWeaponData.modelOptimizationStatus = 'processing';
      }
      
      if (thumbnailFile) {
        const imagePath = `images/${Date.now()}_${thumbnailFile.name}`;
        const imageRef = ref(storage, imagePath);
        await uploadBytes(imageRef, thumbnailFile);
        const imageUrl = await getDownloadURL(imageRef);
        updatedWeaponData.imageUrl = imageUrl;
      }
      
      // Editing existing weapon
      if (weaponData.id && weaponData.id.length > 10) { // Firestore IDs are long
        const weaponRef = doc(db, 'weapons', weaponData.id);
        
        // Preserve existing file paths if not uploading new files
        if (!modelFile && weaponData.baseModelPath) {
          updatedWeaponData.baseModelPath = weaponData.baseModelPath;
        }
        
        if (!thumbnailFile && weaponData.imageUrl) {
          updatedWeaponData.imageUrl = weaponData.imageUrl;
        }
        
        // Remove the id field before updating
        const { id, ...dataToUpdate } = updatedWeaponData;
        
        await updateDoc(weaponRef, dataToUpdate);
        
        // Update local state
        setWeapons(weapons.map(w => 
          w.id === weaponData.id ? { id: weaponData.id, ...dataToUpdate } : w
        ));
        
        // Show success message
        if (modelFile) {
          setSuccessMessage({
            text: "3D model uploaded and weapon updated successfully!",
            showReturnButton: true
          });
        } else {
          setSuccessMessage({
            text: "Weapon updated successfully!",
            showReturnButton: false
          });
        }
      } 
      // Adding a new weapon
      else {
        const docRef = await addDoc(collection(db, 'weapons'), updatedWeaponData);
        // Update local state with the new ID from Firestore
        const newWeapon = { id: docRef.id, ...updatedWeaponData };
        setWeapons([...weapons, newWeapon]);
        
        // Show success message
        if (modelFile) {
          setSuccessMessage({
            text: "New weapon with 3D model created successfully!",
            showReturnButton: true
          });
        } else {
          setSuccessMessage({
            text: "New weapon created successfully!",
            showReturnButton: false
          });
        }
      }
      
      // Exit edit mode
      setEditingWeapon(null);
    } catch (err) {
      console.error('Error saving weapon:', err);
      setError('Failed to save weapon. Check console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteWeapon = async (weaponId) => {
    if (!window.confirm('Are you sure you want to delete this weapon?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Find the weapon to get file paths
      const weapon = weapons.find(w => w.id === weaponId);
      
      // Delete the document from Firestore
      await deleteDoc(doc(db, 'weapons', weaponId));
      
      // Delete associated files from Storage
      if (weapon.baseModelPath) {
        try {
          // Extract file path from URL (this depends on your Firebase storage structure)
          const modelUrl = new URL(weapon.baseModelPath);
          const modelPath = decodeURIComponent(modelUrl.pathname.split('/o/')[1]);
          if (modelPath) {
            await deleteObject(ref(storage, modelPath));
          }
        } catch (err) {
          console.warn('Error deleting model file:', err);
        }
      }
      
      if (weapon.imageUrl) {
        try {
          // Extract file path from URL
          const imageUrl = new URL(weapon.imageUrl);
          const imagePath = decodeURIComponent(imageUrl.pathname.split('/o/')[1]);
          if (imagePath) {
            await deleteObject(ref(storage, imagePath));
          }
        } catch (err) {
          console.warn('Error deleting image file:', err);
        }
      }
      
      // Update local state
      setWeapons(weapons.filter(w => w.id !== weaponId));
      
      // Show success message
      setSuccessMessage({
        text: "Weapon deleted successfully!",
        showReturnButton: false
      });
    } catch (err) {
      console.error('Error deleting weapon:', err);
      setError('Failed to delete weapon. Check console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="weapon-manager">
      {/* Success message overlay */}
      {successMessage && (
        <div className="success-message">
          <div className="success-text">{successMessage.text}</div>
          {successMessage.showReturnButton && (
            <button 
              className="view-model-button"
              onClick={() => navigate('/')}
            >
              View Model in Main UI
            </button>
          )}
          <button 
            className="close-message"
            onClick={() => setSuccessMessage(null)}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
          <button 
            className="close-message"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="section-header">
        <h2>Weapon Management</h2>
        <button 
          className="add-button" 
          onClick={() => setEditingWeapon({})}
          disabled={loading}
        >
          Add New Weapon
        </button>
      </div>
      
      {loading && weapons.length === 0 && (
        <div className="loading-indicator">Loading weapons...</div>
      )}
      
      {loading && weapons.length > 0 && (
        <div className="loading-indicator">Processing...</div>
      )}
      
      {editingWeapon ? (
        <WeaponEditor 
          weapon={editingWeapon} 
          onSave={handleSaveWeapon}
          onCancel={() => setEditingWeapon(null)}
          disabled={loading}
        />
      ) : (
        <div className="weapons-list">
          {weapons.length === 0 ? (
            <p>No weapons found. Click "Add New Weapon" to create one.</p>
          ) : (
            weapons.map(weapon => (
              <div className="weapon-item" key={weapon.id}>
                <img 
                  src={weapon.imageUrl || 'https://via.placeholder.com/80?text=No+Image'} 
                  alt={weapon.name} 
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                  }}
                />
                <div className="weapon-info">
                  <h3>{weapon.name}</h3>
                  <p>{weapon.caliber}</p>
                  {weapon.baseModelPath && (
                    <span className="model-indicator">3D Model ✓</span>
                  )}
                </div>
                <div className="weapon-actions">
                  <button 
                    onClick={() => setEditingWeapon(weapon)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete"
                    onClick={() => handleDeleteWeapon(weapon.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default WeaponManager;