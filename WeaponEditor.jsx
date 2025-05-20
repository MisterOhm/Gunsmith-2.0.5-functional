import React, { useState } from 'react';
import ModelUploader from '../../components/ModelUploader';

const WeaponEditor = ({ weapon, onSave, onCancel, disabled }) => {
  const [formData, setFormData] = useState({
    name: weapon.name || '',
    caliber: weapon.caliber || '',
    description: weapon.description || '',
    baseStats: weapon.baseStats || {
      durability: {
        max: 100,
        current: 100
      },
      weight: 3.0,
      ergonomics: 60,
      accuracy: 75,
      sightingRange: 500,
      verticalRecoil: 70,
      horizontalRecoil: 150,
      muzzleVelocity: 850,
      effectiveDistance: 500,
      fireRate: 800,
      firingModes: ['Single Fire', 'Full Auto'],
      caliber: ''
    }
  });
  
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [firingModes, setFiringModes] = useState(
    weapon.baseStats?.firingModes || ['Single Fire', 'Full Auto']
  );
  
  const [modelPath, setModelPath] = useState(weapon.modelPath || weapon.baseModelPath || '');
  
  // Update caliber in baseStats when the main caliber field changes
  const handleCaliberChange = (value) => {
    setFormData({
      ...formData,
      caliber: value,
      baseStats: {
        ...formData.baseStats,
        caliber: value
      }
    });
  };
  
  // Handle stat changes for numeric values
  const handleStatChange = (stat, value) => {
    // Convert to number and validate
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) return;
    
    // Update the stat
    setFormData({
      ...formData,
      baseStats: {
        ...formData.baseStats,
        [stat]: numValue
      }
    });
  };
  
  // Handle firing mode changes
  const handleFiringModeChange = (index, value) => {
    const updatedModes = [...firingModes];
    updatedModes[index] = value;
    setFiringModes(updatedModes);
    
    setFormData({
      ...formData,
      baseStats: {
        ...formData.baseStats,
        firingModes: updatedModes
      }
    });
  };
  
  const addFiringMode = () => {
    const updatedModes = [...firingModes, 'Single Fire'];
    setFiringModes(updatedModes);
    
    setFormData({
      ...formData,
      baseStats: {
        ...formData.baseStats,
        firingModes: updatedModes
      }
    });
  };
  
  const removeFiringMode = (index) => {
    const updatedModes = firingModes.filter((_, i) => i !== index);
    setFiringModes(updatedModes);
    
    setFormData({
      ...formData,
      baseStats: {
        ...formData.baseStats,
        firingModes: updatedModes
      }
    });
  };
  
  // Handle durability changes (max and current)
  const handleDurabilityChange = (field, value) => {
    const numValue = parseInt(value);
    
    if (isNaN(numValue)) return;
    
    setFormData({
      ...formData,
      baseStats: {
        ...formData.baseStats,
        durability: {
          ...formData.baseStats.durability,
          [field]: numValue
        }
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare the complete weapon data
    const weaponData = {
      ...formData,
      id: weapon.id, // Preserve the ID if it exists
      imageUrl: weapon.imageUrl, // Preserve existing image URL
      modelPath: modelPath // Use the updated model path
    };
    
    onSave(weaponData, null, thumbnailFile);
  };
  
  // Handle model upload completion
  const handleModelUploaded = (newModelPath) => {
    setModelPath(newModelPath);
    
    // Update form data with new model path
    setFormData({
      ...formData,
      modelPath: newModelPath
    });
  };
  
  return (
    <form className="weapon-editor" onSubmit={handleSubmit}>
      <h3>{weapon.id ? 'Edit Weapon' : 'Add New Weapon'}</h3>
      
      <div className="form-columns">
        <div className="form-column">
          <div className="form-group">
            <label>Weapon Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={disabled}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Caliber</label>
            <input 
              type="text" 
              value={formData.caliber} 
              onChange={(e) => handleCaliberChange(e.target.value)}
              disabled={disabled}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              disabled={disabled}
              rows={4}
            />
          </div>
          
          <div className="upload-section">
            <h4>Thumbnail Image</h4>
            <div className="file-upload">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setThumbnailFile(e.target.files[0])}
                disabled={disabled}
              />
              <p className="help-text">Recommended size: 256x256px</p>
              {weapon.imageUrl && (
                <div className="file-preview">
                  <img 
                    src={weapon.imageUrl} 
                    alt="Current thumbnail" 
                    width="100" 
                    height="100"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* 3D Model Uploader */}
            <ModelUploader 
              itemId={weapon.id || 'new-weapon'} 
              itemType="weapon"
              onModelUploaded={handleModelUploaded}
              currentModelPath={modelPath}
            />
          </div>
        </div>
        
        <div className="form-column">
          <h4>Base Stats</h4>
          
          <div className="form-group">
            <label>Durability</label>
            <div className="form-row">
              <div className="form-group">
                <label>Current</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.baseStats.durability.current} 
                  onChange={(e) => handleDurabilityChange('current', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="form-group">
                <label>Max</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.baseStats.durability.max} 
                  onChange={(e) => handleDurabilityChange('max', e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Weight (kg)</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                value={formData.baseStats.weight} 
                onChange={(e) => handleStatChange('weight', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div className="form-group">
              <label>Ergonomics</label>
              <input 
                type="number" 
                min="0"
                value={formData.baseStats.ergonomics} 
                onChange={(e) => handleStatChange('ergonomics', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Accuracy</label>
              <input 
                type="number" 
                min="0"
                max="100"
                value={formData.baseStats.accuracy} 
                onChange={(e) => handleStatChange('accuracy', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div className="form-group">
              <label>Sighting Range (m)</label>
              <input 
                type="number" 
                min="0"
                value={formData.baseStats.sightingRange} 
                onChange={(e) => handleStatChange('sightingRange', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Vertical Recoil</label>
              <input 
                type="number" 
                min="0"
                value={formData.baseStats.verticalRecoil} 
                onChange={(e) => handleStatChange('verticalRecoil', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div className="form-group">
              <label>Horizontal Recoil</label>
              <input 
                type="number" 
                min="0"
                value={formData.baseStats.horizontalRecoil} 
                onChange={(e) => handleStatChange('horizontalRecoil', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Muzzle Velocity (m/s)</label>
              <input 
                type="number" 
                min="0"
                value={formData.baseStats.muzzleVelocity} 
                onChange={(e) => handleStatChange('muzzleVelocity', e.target.value)}
                disabled={disabled}
              />
            </div>
            <div className="form-group">
              <label>Effective Distance (m)</label>
              <input 
                type="number" 
                min="0"
                value={formData.baseStats.effectiveDistance} 
                onChange={(e) => handleStatChange('effectiveDistance', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Fire Rate (rpm)</label>
            <input 
              type="number" 
              min="0"
              value={formData.baseStats.fireRate} 
              onChange={(e) => handleStatChange('fireRate', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="form-group">
            <label>Firing Modes</label>
            {firingModes.map((mode, index) => (
              <div key={index} className="form-row" style={{ marginBottom: '8px' }}>
                <input 
                  type="text" 
                  value={mode} 
                  onChange={(e) => handleFiringModeChange(index, e.target.value)}
                  disabled={disabled}
                  style={{ flex: '1' }}
                />
                <button 
                  type="button" 
                  className="remove-button"
                  onClick={() => removeFiringMode(index)}
                  disabled={disabled || firingModes.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="add-attachment-point"
              onClick={addFiringMode}
              disabled={disabled}
              style={{ marginTop: '8px' }}
            >
              Add Firing Mode
            </button>
          </div>
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          type="button" 
          className="cancel-button" 
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="save-button"
          disabled={disabled}
        >
          {weapon.id ? 'Update Weapon' : 'Add Weapon'}
        </button>
      </div>
    </form>
  );
};

export default WeaponEditor;