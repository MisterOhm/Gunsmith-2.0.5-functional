import React, { useState, useEffect } from 'react';

const PresetConfigs = ({ isOpen, onClose, selectedWeapon, onApplyConfig }) => {
  const [presets, setPresets] = useState([]);
  
  // Load presets based on selected weapon
  useEffect(() => {
    if (!selectedWeapon) return;
    
    // In a real application, these would likely come from an API
    // Here we're defining them statically for demonstration
    const getPresetsForWeapon = (weaponId) => {
      const allPresets = {
        // HK 416A5 presets
        "1": [
          {
            id: "preset_1_1",
            name: "CQB Specialist",
            description: "Optimized for close quarters battle with reduced recoil and improved ergonomics",
            imageUrl: "https://via.placeholder.com/200x120?text=CQB+Loadout",
            attachments: {
              "barrel_1": {
                "id": "a3",
                "name": "Extended Barrel",
                "type": "barrel",
                "category": "vital",
                "statModifiers": [
                  { "stat": "muzzleVelocity", "value": 75 },
                  { "stat": "effectiveDistance", "value": 100 },
                  { "stat": "accuracy", "value": 8 },
                  { "stat": "weight", "value": 0.8 },
                  { "stat": "ergonomics", "value": -5 }
                ]
              },
              "muzzle_1": {
                "id": "a11",
                "name": "Compensator",
                "type": "muzzle",
                "category": "functional",
                "statModifiers": [
                  { "stat": "verticalRecoil", "value": -15 },
                  { "stat": "horizontalRecoil", "value": -10 },
                  { "stat": "weight", "value": 0.2 }
                ]
              },
              "grip_1": {
                "id": "a2",
                "name": "Tactical Grip",
                "type": "grip",
                "category": "functional",
                "statModifiers": [
                  { "stat": "ergonomics", "value": 10 },
                  { "stat": "verticalRecoil", "value": -5 }
                ]
              },
              "underbarrel_1": {
                "id": "a6",
                "name": "Foregrip",
                "type": "underbarrel",
                "category": "functional",
                "statModifiers": [
                  { "stat": "verticalRecoil", "value": -8 },
                  { "stat": "horizontalRecoil", "value": -5 },
                  { "stat": "ergonomics", "value": 6 }
                ]
              }
            },
            featuredStats: [
              { stat: "verticalRecoil", value: -28, isPositive: true },
              { stat: "horizontalRecoil", value: -15, isPositive: true },
              { stat: "ergonomics", value: 11, isPositive: true }
            ]
          },
          {
            id: "preset_1_2",
            name: "DMR Configuration",
            description: "Long range precision setup with improved accuracy and effective range",
            imageUrl: "https://via.placeholder.com/200x120?text=DMR+Setup",
            attachments: {
              "barrel_1": {
                "id": "a3",
                "name": "Extended Barrel",
                "type": "barrel",
                "category": "vital",
                "statModifiers": [
                  { "stat": "muzzleVelocity", "value": 75 },
                  { "stat": "effectiveDistance", "value": 100 },
                  { "stat": "accuracy", "value": 8 },
                  { "stat": "weight", "value": 0.8 },
                  { "stat": "ergonomics", "value": -5 }
                ]
              },
              "muzzle_1": {
                "id": "a9",
                "name": "Flash Hider",
                "type": "muzzle",
                "category": "functional",
                "statModifiers": [
                  { "stat": "verticalRecoil", "value": -5 },
                  { "stat": "weight", "value": 0.1 }
                ]
              },
              "sight_1": {
                "id": "a10",
                "name": "ACOG Scope",
                "type": "sight",
                "category": "equipment",
                "statModifiers": [
                  { "stat": "sightingRange", "value": 150 },
                  { "stat": "ergonomics", "value": -5 },
                  { "stat": "weight", "value": 0.5 }
                ]
              },
              "stock_1": {
                "id": "a5",
                "name": "Tactical Stock",
                "type": "stock",
                "category": "vital",
                "statModifiers": [
                  { "stat": "ergonomics", "value": 8 },
                  { "stat": "verticalRecoil", "value": -12 },
                  { "stat": "horizontalRecoil", "value": -8 },
                  { "stat": "weight", "value": 0.2 }
                ]
              }
            },
            featuredStats: [
              { stat: "accuracy", value: 8, isPositive: true },
              { stat: "effectiveDistance", value: 100, isPositive: true },
              { stat: "sightingRange", value: 150, isPositive: true }
            ]
          },
          {
            id: "preset_1_3",
            name: "Stealth Operator",
            description: "Suppressed configuration for covert operations",
            imageUrl: "https://via.placeholder.com/200x120?text=Stealth+Setup",
            attachments: {
              "muzzle_1": {
                "id": "a1",
                "name": "Suppressor",
                "type": "muzzle",
                "category": "functional",
                "statModifiers": [
                  { "stat": "muzzleVelocity", "value": -15 },
                  { "stat": "verticalRecoil", "value": -10 },
                  { "stat": "horizontalRecoil", "value": -5 },
                  { "stat": "weight", "value": 0.5 }
                ]
              },
              "sight_1": {
                "id": "a4",
                "name": "Holographic Sight",
                "type": "sight",
                "category": "equipment",
                "statModifiers": [
                  { "stat": "sightingRange", "value": 50 },
                  { "stat": "ergonomics", "value": -2 },
                  { "stat": "weight", "value": 0.3 }
                ]
              },
              "grip_1": {
                "id": "a2",
                "name": "Tactical Grip",
                "type": "grip",
                "category": "functional",
                "statModifiers": [
                  { "stat": "ergonomics", "value": 10 },
                  { "stat": "verticalRecoil", "value": -5 }
                ]
              },
              "underbarrel_1": {
                "id": "a6",
                "name": "Foregrip",
                "type": "underbarrel",
                "category": "functional",
                "statModifiers": [
                  { "stat": "verticalRecoil", "value": -8 },
                  { "stat": "horizontalRecoil", "value": -5 },
                  { "stat": "ergonomics", "value": 6 }
                ]
              }
            },
            featuredStats: [
              { stat: "noise", value: -70, isPositive: true },
              { stat: "verticalRecoil", value: -23, isPositive: true },
              { stat: "ergonomics", value: 14, isPositive: true }
            ]
          }
        ],
        // AK-74M presets
        "2": [
          {
            id: "preset_2_1",
            name: "Modern Tactical",
            description: "Modernized AK platform with Western-style accessories",
            imageUrl: "https://via.placeholder.com/200x120?text=Tactical+AK",
            attachments: {
              "handguard_2": {
                "id": "a7",
                "name": "Rail Handguard",
                "type": "handguard",
                "category": "vital",
                "statModifiers": [
                  { "stat": "ergonomics", "value": 5 },
                  { "stat": "weight", "value": 0.4 }
                ]
              },
              "sight_2": {
                "id": "a4",
                "name": "Holographic Sight",
                "type": "sight",
                "category": "equipment",
                "statModifiers": [
                  { "stat": "sightingRange", "value": 50 },
                  { "stat": "ergonomics", "value": -2 },
                  { "stat": "weight", "value": 0.3 }
                ]
              },
              "muzzle_2": {
                "id": "a11",
                "name": "Compensator",
                "type": "muzzle",
                "category": "functional",
                "statModifiers": [
                  { "stat": "verticalRecoil", "value": -15 },
                  { "stat": "horizontalRecoil", "value": -10 },
                  { "stat": "weight", "value": 0.2 }
                ]
              }
            },
            featuredStats: [
              { stat: "verticalRecoil", value: -15, isPositive: true },
              { stat: "horizontalRecoil", value: -10, isPositive: true },
              { stat: "ergonomics", value: 3, isPositive: true }
            ]
          },
          {
            id: "preset_2_2",
            name: "Classic Sniper",
            description: "Traditional marksman setup with improved accuracy",
            imageUrl: "https://via.placeholder.com/200x120?text=Sniper+AK",
            attachments: {
              "muzzle_2": {
                "id": "a9",
                "name": "Flash Hider",
                "type": "muzzle",
                "category": "functional",
                "statModifiers": [
                  { "stat": "verticalRecoil", "value": -5 },
                  { "stat": "weight", "value": 0.1 }
                ]
              },
              "sight_2": {
                "id": "a10",
                "name": "ACOG Scope",
                "type": "sight",
                "category": "equipment",
                "statModifiers": [
                  { "stat": "sightingRange", "value": 150 },
                  { "stat": "ergonomics", "value": -5 },
                  { "stat": "weight", "value": 0.5 }
                ]
              }
            },
            featuredStats: [
              { stat: "sightingRange", value: 150, isPositive: true },
              { stat: "verticalRecoil", value: -5, isPositive: true },
              { stat: "weight", value: 0.6, isPositive: false }
            ]
          }
        ],
        // M4A1 presets
        "3": [
          {
            id: "preset_3_1",
            name: "Lightweight Assault",
            description: "Reduced weight configuration for maximum mobility",
            imageUrl: "https://via.placeholder.com/200x120?text=Lightweight+M4",
            attachments: {
              "handguard_3": {
                "id": "a7",
                "name": "Rail Handguard",
                "type": "handguard",
                "category": "vital",
                "statModifiers": [
                  { "stat": "ergonomics", "value": 5 },
                  { "stat": "weight", "value": 0.4 }
                ]
              },
              "sight_3": {
                "id": "a4",
                "name": "Holographic Sight",
                "type": "sight",
                "category": "equipment",
                "statModifiers": [
                  { "stat": "sightingRange", "value": 50 },
                  { "stat": "ergonomics", "value": -2 },
                  { "stat": "weight", "value": 0.3 }
                ]
              }
            },
            featuredStats: [
              { stat: "ergonomics", value: 3, isPositive: true },
              { stat: "sightingRange", value: 50, isPositive: true },
              { stat: "weight", value: 0.7, isPositive: false }
            ]
          },
          {
            id: "preset_3_2",
            name: "All-Purpose Tactical",
            description: "Balanced configuration suitable for most situations",
            imageUrl: "https://via.placeholder.com/200x120?text=Tactical+M4",
            attachments: {
              "barrel_3": {
                "id": "a3",
                "name": "Extended Barrel",
                "type": "barrel",
                "category": "vital",
                "statModifiers": [
                  { "stat": "muzzleVelocity", "value": 75 },
                  { "stat": "effectiveDistance", "value": 100 },
                  { "stat": "accuracy", "value": 8 },
                  { "stat": "weight", "value": 0.8 },
                  { "stat": "ergonomics", "value": -5 }
                ]
              },
              "muzzle_3": {
                "id": "a11",
                "name": "Compensator",
                "type": "muzzle",
                "category": "functional",
                "statModifiers": [
                  { "stat": "verticalRecoil", "value": -15 },
                  { "stat": "horizontalRecoil", "value": -10 },
                  { "stat": "weight", "value": 0.2 }
                ]
              },
              "sight_3": {
                "id": "a4",
                "name": "Holographic Sight",
                "type": "sight",
                "category": "equipment",
                "statModifiers": [
                  { "stat": "sightingRange", "value": 50 },
                  { "stat": "ergonomics", "value": -2 },
                  { "stat": "weight", "value": 0.3 }
                ]
              },
              "grip_3": {
                "id": "a2",
                "name": "Tactical Grip",
                "type": "grip",
                "category": "functional",
                "statModifiers": [
                  { "stat": "ergonomics", "value": 10 },
                  { "stat": "verticalRecoil", "value": -5 }
                ]
              }
            },
            featuredStats: [
              { stat: "accuracy", value: 8, isPositive: true },
              { stat: "verticalRecoil", value: -20, isPositive: true },
              { stat: "effectiveDistance", value: 100, isPositive: true }
            ]
          }
        ]
      };
      
      return allPresets[weaponId] || [];
    };
    
    setPresets(getPresetsForWeapon(selectedWeapon.id));
  }, [selectedWeapon]);
  
  const handleApplyPreset = (preset) => {
    onApplyConfig(preset.attachments);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="preset-configs-modal" onClick={onClose}>
      <div className="preset-configs-content" onClick={e => e.stopPropagation()}>
        <div className="preset-configs-header">
          <h2>Preset Configurations</h2>
          <button className="preset-configs-close" onClick={onClose}>×</button>
        </div>
        
        {presets.length === 0 ? (
          <div className="no-configs-message">
            No preset configurations available for this weapon.
          </div>
        ) : (
          <div className="preset-configs-list">
            {presets.map(preset => (
              <div 
                key={preset.id} 
                className="preset-config-card"
                onClick={() => handleApplyPreset(preset)}
              >
                <div className="preset-config-image">
                  <img src={preset.imageUrl} alt={preset.name} />
                </div>
                <div className="preset-config-details">
                  <div className="preset-config-name">{preset.name}</div>
                  <div className="preset-config-type">{preset.description}</div>
                  <div className="preset-config-stats">
                    {preset.featuredStats.map((stat, index) => (
                      <div 
                        key={index} 
                        className={`preset-config-stat ${stat.isPositive ? 'positive' : 'negative'}`}
                      >
                        {stat.stat}: {stat.value > 0 ? '+' : ''}{stat.value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresetConfigs;