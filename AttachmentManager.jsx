import React, { useState, useEffect } from 'react';
import WeaponEditor from './WeaponEditor';

// Import mock data for initial weapons
import weaponsData from '../../mockData/weapons.json';

function WeaponManager() {
  const [weapons, setWeapons] = useState([]);
  const [editingWeapon, setEditingWeapon] = useState(null);
  
  // Load initial weapons from mock data
  useEffect(() => {
    setWeapons(weaponsData);
  }, []);
  
  const handleSaveWeapon = (weaponData) => {
    // If editing an existing weapon
    if (weaponData.id) {
      setWeapons(weapons.map(w => 
        w.id === weaponData.id ? weaponData : w
      ));
    } 
    // If adding a new weapon
    else {
      // Generate a new ID (would normally be done by the backend)
      const newId = (Math.max(...weapons.map(w => parseInt(w.id)), 0) + 1).toString();
      setWeapons([...weapons, { ...weaponData, id: newId }]);
    }
    
    // Exit edit mode
    setEditingWeapon(null);
  };
  
  const handleDeleteWeapon = (weaponId) => {
    if (window.confirm('Are you sure you want to delete this weapon?')) {
      setWeapons(weapons.filter(w => w.id !== weaponId));
    }
  };
  
  return (
    <div className="weapon-manager">
      <div className="section-header">
        <h2>Weapon Management</h2>
        <button className="add-button" onClick={() => setEditingWeapon({})}>
          Add New Weapon
        </button>
      </div>
      
      {editingWeapon ? (
        <WeaponEditor 
          weapon={editingWeapon} 
          onSave={handleSaveWeapon}
          onCancel={() => setEditingWeapon(null)}
        />
      ) : (
        <div className="weapons-list">
          {weapons.length === 0 ? (
            <p>No weapons found. Click "Add New Weapon" to create one.</p>
          ) : (
            weapons.map(weapon => (
              <div className="weapon-item" key={weapon.id}>
                <img 
                  src={weapon.imageUrl || 'https://via.placeholder.com/80'} 
                  alt={weapon.name} 
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80';
                  }}
                />
                <div className="weapon-info">
                  <h3>{weapon.name}</h3>
                  <p>{weapon.caliber}</p>
                </div>
                <div className="weapon-actions">
                  <button onClick={() => setEditingWeapon(weapon)}>Edit</button>
                  <button 
                    className="delete"
                    onClick={() => handleDeleteWeapon(weapon.id)}
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