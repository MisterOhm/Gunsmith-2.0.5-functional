import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const SavedConfigs = ({ 
  selectedWeapon, 
  equippedAttachments, 
  onLoadConfig,
  weaponStats 
}) => {
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [configName, setConfigName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Load saved configs when weapon changes
  useEffect(() => {
    if (!selectedWeapon) return;
    
    const loadSavedConfigs = async () => {
      try {
        setLoading(true);
        
        // Query Firestore for saved configs matching this weapon
        const configsCollection = collection(db, 'savedConfigs');
        const configsQuery = query(configsCollection, where('weaponId', '==', selectedWeapon.id));
        const snapshot = await getDocs(configsQuery);
        
        if (!snapshot.empty) {
          const configs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSavedConfigs(configs);
        } else {
          setSavedConfigs([]);
        }
      } catch (err) {
        console.error('Error loading saved configs:', err);
        setError('Failed to load saved configurations');
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedConfigs();
  }, [selectedWeapon]);
  
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!configName.trim()) return;
    
    try {
      setLoading(true);
      
      // Save the current configuration to Firestore
      const configData = {
        name: configName.trim(),
        weaponId: selectedWeapon.id,
        weaponName: selectedWeapon.name,
        attachments: equippedAttachments,
        stats: weaponStats,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'savedConfigs'), configData);
      const newConfig = { id: docRef.id, ...configData };
      
      // Update local state
      setSavedConfigs([...savedConfigs, newConfig]);
      setConfigName('');
      setShowSaveForm(false);
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving configuration:', err);
      setError('Failed to save configuration');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteConfig = async (configId) => {
    if (!window.confirm('Are you sure you want to delete this saved configuration?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'savedConfigs', configId));
      
      // Update local state
      setSavedConfigs(savedConfigs.filter(config => config.id !== configId));
    } catch (err) {
      console.error('Error deleting configuration:', err);
      setError('Failed to delete configuration');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoadConfig = (config) => {
    onLoadConfig(config.attachments);
  };
  
  // If there's an error with Firestore, use localStorage as a fallback
  const saveConfigLocally = () => {
    try {
      const configData = {
        id: `local_${Date.now()}`,
        name: configName.trim(),
        weaponId: selectedWeapon.id,
        weaponName: selectedWeapon.name,
        attachments: equippedAttachments,
        stats: weaponStats,
        createdAt: new Date().toISOString(),
        isLocal: true
      };
      
      // Get existing configs from localStorage
      const existingConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
      
      // Add new config
      existingConfigs.push(configData);
      
      // Save back to localStorage
      localStorage.setItem('savedConfigs', JSON.stringify(existingConfigs));
      
      // Update local state
      setSavedConfigs([...savedConfigs, configData]);
      setConfigName('');
      setShowSaveForm(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving to localStorage:', err);
      setError('Failed to save configuration locally');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  return (
    <div className="saved-configs-panel">
      <div className="saved-configs-header">
        <h3>SAVED CONFIGURATIONS</h3>
        <button 
          className="save-config-button"
          onClick={() => setShowSaveForm(prev => !prev)}
          disabled={loading}
        >
          {showSaveForm ? 'Cancel' : 'Save Current'}
        </button>
      </div>
      
      {showSaveForm && (
        <form className="save-config-form" onSubmit={handleSaveConfig}>
          <input
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="Configuration name"
            required
            disabled={loading}
          />
          <div className="save-config-actions">
            <button 
              type="submit" 
              disabled={loading || !configName.trim()}
            >
              Save
            </button>
            <button 
              type="button" 
              onClick={saveConfigLocally}
              disabled={loading || !configName.trim()}
              className="save-local-button"
            >
              Save Locally
            </button>
          </div>
        </form>
      )}
      
      {error && <div className="error-message">{error}</div>}
      {saveSuccess && <div className="success-message">Configuration saved successfully!</div>}
      
      <div className="saved-configs-list">
        {loading && savedConfigs.length === 0 ? (
          <div className="loading-indicator">Loading saved configurations...</div>
        ) : savedConfigs.length === 0 ? (
          <div className="no-configs-message">No saved configurations found for this weapon.</div>
        ) : (
          savedConfigs.map(config => (
            <div key={config.id} className="saved-config-item">
              <div className="config-info">
                <div className="config-name">{config.name}</div>
                <div className="config-date">
                  {new Date(config.createdAt).toLocaleDateString()}
                </div>
                {config.isLocal && <div className="local-indicator">Local</div>}
              </div>
              <div className="config-actions">
                <button 
                  onClick={() => handleLoadConfig(config)}
                  disabled={loading}
                >
                  Load
                </button>
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteConfig(config.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedConfigs;