import React, { useState, useEffect } from 'react';
import ModelUploader from '../components/ModelUploader';

function AttachmentEditor({ attachment, onSave, onCancel }) {
    const [formData, setFormData] = useState(attachment || {
      name: '',
      description: '',
      type: 'barrel',
      category: 'functional',
      compatibleSlots: [],
      statModifiers: []
    });
    
    // Track 3D model path separately
    const [modelPath, setModelPath] = useState(attachment?.modelPath || '');
    
    const [thumbnailFile, setThumbnailFile] = useState(null);
    
    const attachmentTypes = [
      'barrel', 'stock', 'grip', 'sight', 'underbarrel', 
      'muzzle', 'magazine', 'receiver', 'handguard'
    ];
    
    const categories = ['vital', 'functional', 'equipment'];
    
    const handleStatModifierAdd = () => {
      setFormData(prev => ({
        ...prev,
        statModifiers: [
          ...prev.statModifiers,
          { stat: 'accuracy', value: 0 }
        ]
      }));
    };
    
    // Get all possible attachment slots from weapons
    // In a real app, you'd fetch this from your API
    const [availableSlots, setAvailableSlots] = useState([
      { id: 'barrel_1', name: 'Barrel (HK 416A5)', weaponName: 'HK 416A5' },
      { id: 'stock_1', name: 'Stock (HK 416A5)', weaponName: 'HK 416A5' },
      { id: 'muzzle_1', name: 'Muzzle (HK 416A5)', weaponName: 'HK 416A5' },
      { id: 'barrel_2', name: 'Barrel (AK-74M)', weaponName: 'AK-74M' },
      { id: 'stock_2', name: 'Stock (AK-74M)', weaponName: 'AK-74M' },
      { id: 'muzzle_2', name: 'Muzzle (AK-74M)', weaponName: 'AK-74M' },
      { id: 'barrel_3', name: 'Barrel (M4A1)', weaponName: 'M4A1' },
      { id: 'stock_3', name: 'Stock (M4A1)', weaponName: 'M4A1' },
      { id: 'muzzle_3', name: 'Muzzle (M4A1)', weaponName: 'M4A1' },
    ]);
    
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
      <form className="attachment-editor" onSubmit={(e) => {
        e.preventDefault();
        
        // Prepare final data for saving
        const finalData = {
          ...formData,
          modelPath // Include the model path
        };
        
        onSave(finalData, thumbnailFile);
      }}>
        <h3>{attachment?.id ? 'Edit Attachment' : 'Add New Attachment'}</h3>
        
        <div className="form-columns">
          <div className="form-column">
            <div className="form-group">
              <label>Attachment Name</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  {attachmentTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="upload-section">
              <h4>Thumbnail Image</h4>
              <div className="file-upload">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setThumbnailFile(e.target.files[0])} 
                />
                <p className="help-text">Recommended size: 256x256px</p>
                {attachment?.imageUrl && (
                  <div className="file-preview">
                    <img 
                      src={attachment.imageUrl} 
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
                itemId={attachment?.id || 'new-attachment'} 
                itemType="attachment"
                onModelUploaded={handleModelUploaded}
                currentModelPath={modelPath}
              />
            </div>
          </div>
          
          <div className="form-column">
            <h4>Compatible Weapon Slots</h4>
            <div className="compatible-slots">
              {availableSlots.map(slot => (
                <div className="slot-checkbox" key={slot.id}>
                  <input 
                    type="checkbox" 
                    id={`slot-${slot.id}`}
                    checked={formData.compatibleSlots?.includes(slot.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData, 
                          compatibleSlots: [...(formData.compatibleSlots || []), slot.id]
                        });
                      } else {
                        setFormData({
                          ...formData, 
                          compatibleSlots: (formData.compatibleSlots || []).filter(id => id !== slot.id)
                        });
                      }
                    }}
                  />
                  <label htmlFor={`slot-${slot.id}`}>
                    {slot.name} <span className="weapon-name">({slot.weaponName})</span>
                  </label>
                </div>
              ))}
            </div>
            
            <h4>Stat Modifiers</h4>
            <div className="stat-modifiers-list">
              {formData.statModifiers?.map((modifier, index) => (
                <div className="stat-modifier-item" key={index}>
                  <select 
                    value={modifier.stat} 
                    onChange={(e) => {
                      const newModifiers = [...formData.statModifiers];
                      newModifiers[index].stat = e.target.value;
                      setFormData({...formData, statModifiers: newModifiers});
                    }}
                  >
                    <option value="accuracy">Accuracy</option>
                    <option value="weight">Weight</option>
                    <option value="ergonomics">Ergonomics</option>
                    <option value="muzzleVelocity">Muzzle Velocity</option>
                    <option value="verticalRecoil">Vertical Recoil</option>
                    <option value="horizontalRecoil">Horizontal Recoil</option>
                    <option value="effectiveDistance">Effective Distance</option>
                    <option value="sightingRange">Sighting Range</option>
                    <option value="durability">Durability</option>
                  </select>
                  <input 
                    type="number" 
                    value={modifier.value} 
                    onChange={(e) => {
                      const newModifiers = [...formData.statModifiers];
                      newModifiers[index].value = parseInt(e.target.value);
                      setFormData({...formData, statModifiers: newModifiers});
                    }} 
                  />
                  <button 
                    type="button" 
                    className="remove-button"
                    onClick={() => {
                      setFormData({
                        ...formData, 
                        statModifiers: formData.statModifiers.filter((_, i) => i !== index)
                      });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                className="add-stat-modifier" 
                onClick={handleStatModifierAdd}
              >
                Add Stat Modifier
              </button>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="save-button">
            Save Attachment
          </button>
        </div>
      </form>
    );
  }
  
  export default AttachmentEditor;