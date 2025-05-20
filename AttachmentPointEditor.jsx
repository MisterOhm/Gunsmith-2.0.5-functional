import React, { useState, useEffect } from 'react';

const AttachmentPointEditor = ({ weaponId, onSave, onCancel, initialAttachmentPoints = [] }) => {
  const [attachmentPoints, setAttachmentPoints] = useState(initialAttachmentPoints);
  
  // Available attachment point types
  const attachmentTypes = [
    'barrel', 'stock', 'grip', 'sight', 'underbarrel', 
    'muzzle', 'magazine', 'receiver', 'handguard', 'mount', 'bolt', 'gasblock'
  ];
  
  useEffect(() => {
    // If no attachment points are provided, create a default set
    if (initialAttachmentPoints.length === 0) {
      const defaultPoints = [
        { id: `barrel_${weaponId}`, name: 'Barrel', position: { x: 0, y: 0, z: 1.8 } },
        { id: `muzzle_${weaponId}`, name: 'Muzzle', position: { x: 0, y: 0, z: 2.1 } },
        { id: `stock_${weaponId}`, name: 'Stock', position: { x: 0, y: 0, z: -1.5 } },
        { id: `grip_${weaponId}`, name: 'Pistol Grip', position: { x: 0, y: -0.35, z: -0.3 } },
        { id: `sight_${weaponId}`, name: 'Sight', position: { x: 0, y: 0.15, z: 0.3 } }
      ];
      setAttachmentPoints(defaultPoints);
    }
  }, [weaponId, initialAttachmentPoints]);
  
  // Add a new attachment point
  const handleAddAttachmentPoint = () => {
    // Generate a unique ID based on the current timestamp
    const timestamp = Date.now();
    const newAttachmentPoint = {
      id: `mount_${weaponId}_${timestamp}`,
      name: 'New Mount',
      position: { x: 0, y: 0, z: 0 }
    };
    
    setAttachmentPoints([...attachmentPoints, newAttachmentPoint]);
  };
  
  // Remove an attachment point
  const handleRemoveAttachmentPoint = (index) => {
    const updatedPoints = [...attachmentPoints];
    updatedPoints.splice(index, 1);
    setAttachmentPoints(updatedPoints);
  };
  
  // Update attachment point name
  const handleNameChange = (index, name) => {
    const updatedPoints = [...attachmentPoints];
    updatedPoints[index].name = name;
    setAttachmentPoints(updatedPoints);
  };
  
  // Update attachment point type (the prefix in the ID)
  const handleTypeChange = (index, type) => {
    const updatedPoints = [...attachmentPoints];
    // Parse the current ID to extract the weapon ID and any suffix
    const currentId = updatedPoints[index].id;
    const parts = currentId.split('_');
    
    // Create a new ID with the new type prefix
    let newId = `${type}_${weaponId}`;
    if (parts.length > 2) {
      // Add back any suffix that was present
      newId += `_${parts.slice(2).join('_')}`;
    }
    
    updatedPoints[index].id = newId;
    setAttachmentPoints(updatedPoints);
  };
  
  // Update position coordinates
  const handlePositionChange = (index, axis, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const updatedPoints = [...attachmentPoints];
    updatedPoints[index].position[axis] = numValue;
    setAttachmentPoints(updatedPoints);
  };
  
  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(attachmentPoints);
  };
  
  return (
    <div className="attachment-editor">
      <h3>Weapon Attachment Points</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="attachment-points-list">
          {attachmentPoints.map((point, index) => (
            <div key={index} className="attachment-point-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select 
                    value={point.id.split('_')[0]}
                    onChange={(e) => handleTypeChange(index, e.target.value)}
                  >
                    {attachmentTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Name</label>
                  <input 
                    type="text" 
                    value={point.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                  />
                </div>
                
                <button 
                  type="button" 
                  className="remove-button"
                  onClick={() => handleRemoveAttachmentPoint(index)}
                >
                  Remove
                </button>
              </div>
              
              <div className="position-inputs">
                <label>
                  X:
                  <input 
                    type="number" 
                    step="0.1"
                    value={point.position.x}
                    onChange={(e) => handlePositionChange(index, 'x', e.target.value)}
                  />
                </label>
                <label>
                  Y:
                  <input 
                    type="number" 
                    step="0.1"
                    value={point.position.y}
                    onChange={(e) => handlePositionChange(index, 'y', e.target.value)}
                  />
                </label>
                <label>
                  Z:
                  <input 
                    type="number" 
                    step="0.1"
                    value={point.position.z}
                    onChange={(e) => handlePositionChange(index, 'z', e.target.value)}
                  />
                </label>
              </div>
              
              <div className="attachment-point-preview">
                <div className="preview-label">Preview Position:</div>
                <div className="preview-visualization">
                  {/* Simple visualization of the attachment point position */}
                  <div 
                    className="preview-marker"
                    style={{
                      left: `${50 + (point.position.x * 20)}%`,
                      top: `${50 - (point.position.y * 20)}%`,
                      transform: `scale(${1 + (point.position.z / 10)})`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button 
            type="button" 
            className="add-attachment-point"
            onClick={handleAddAttachmentPoint}
          >
            Add Attachment Point
          </button>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="save-button">
            Save Attachment Points
          </button>
        </div>
      </form>
      
      <style jsx>{`
        .preview-visualization {
          position: relative;
          width: 100%;
          height: 100px;
          background-color: #222;
          border: 1px solid #444;
          border-radius: 4px;
          margin-top: 5px;
        }
        
        .preview-marker {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: rgba(0, 180, 255, 0.8);
          transform-origin: center;
          box-shadow: 0 0 5px rgba(0, 180, 255, 0.5);
        }
        
        .preview-label {
          font-size: 0.8rem;
          color: #aaa;
          margin-top: 10px;
        }
        
        .attachment-point-preview {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed #444;
        }
      `}</style>
    </div>
  );
};

export default AttachmentPointEditor;