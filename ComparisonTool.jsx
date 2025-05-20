import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const ComparisonTool = ({ 
  isActive, 
  onClose, 
  selectedWeapon, 
  currentStats,
  equippedAttachments 
}) => {
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [comparedConfig, setComparedConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Load saved configs when weapon changes
  useEffect(() => {
    if (!selectedWeapon || !isActive) return;
    
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
          
          // Also try to load from localStorage
          try {
            const localConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
            const filteredLocalConfigs = localConfigs.filter(
              c => c.weaponId === selectedWeapon.id && c.isLocal
            );
            
            if (filteredLocalConfigs.length > 0) {
              setSavedConfigs([...configs, ...filteredLocalConfigs]);
            }
          } catch (localErr) {
            console.warn('Error loading local configs:', localErr);
          }
        } else {
          // Try to load from localStorage
          try {
            const localConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
            const filteredLocalConfigs = localConfigs.filter(
              c => c.weaponId === selectedWeapon.id && c.isLocal
            );
            
            if (filteredLocalConfigs.length > 0) {
              setSavedConfigs(filteredLocalConfigs);
            } else {
              setSavedConfigs([]);
            }
          } catch (localErr) {
            console.warn('Error loading local configs:', localErr);
            setSavedConfigs([]);
          }
        }
      } catch (err) {
        console.error('Error loading saved configs:', err);
        setError('Failed to load saved configurations');
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedConfigs();
  }, [selectedWeapon, isActive]);
  
  // Update compared config when selection changes
  useEffect(() => {
    if (!selectedConfigId) {
      setComparedConfig(null);
      return;
    }
    
    const selectedConfig = savedConfigs.find(config => config.id === selectedConfigId);
    setComparedConfig(selectedConfig);
  }, [selectedConfigId, savedConfigs]);
  
  // Helper function to format stat values
  const formatStatValue = (stat, value) => {
    switch (stat) {
      case 'weight':
        return `${value} kg`;
      case 'muzzleVelocity':
        return `${value} m/s`;
      case 'effectiveDistance':
        return `${value} m`;
      case 'fireRate':
        return `${value} rpm`;
      case 'durability':
        if (typeof value === 'object') {
          return `${value.current}/${value.max}`;
        }
        return value;
      default:
        return value;
    }
  };
  
  // Determine if a stat is better or worse in comparison
  const getComparisonClass = (stat, currentValue, comparedValue) => {
    if (currentValue === comparedValue) return '';
    
    // For some stats, higher is better, for others lower is better
    const higherIsBetter = ['durability', 'accuracy', 'muzzleVelocity', 
                           'sightingRange', 'ergonomics', 'effectiveDistance'];
  
    const lowerIsBetter = ['weight', 'verticalRecoil', 'horizontalRecoil'];
    
    if (higherIsBetter.includes(stat)) {
      return currentValue > comparedValue ? 'better' : 'worse';
    }
    
    if (lowerIsBetter.includes(stat)) {
      return currentValue < comparedValue ? 'better' : 'worse';
    }
    
    return '';
  };
  
  // Generate a text summary comparing the two configurations
  const generateComparisonSummary = () => {
    if (!comparedConfig || !currentStats) return '';
    
    const improvements = [];
    const downsides = [];
    
    // Compare important stats
    const statsToCompare = [
      { key: 'accuracy', name: 'accuracy' },
      { key: 'verticalRecoil', name: 'vertical recoil' },
      { key: 'horizontalRecoil', name: 'horizontal recoil' },
      { key: 'ergonomics', name: 'ergonomics' },
      { key: 'muzzleVelocity', name: 'muzzle velocity' },
      { key: 'weight', name: 'weight' }
    ];
    
    statsToCompare.forEach(({ key, name }) => {
      const currentValue = currentStats[key];
      const comparedValue = comparedConfig.stats[key];
      
      if (currentValue === comparedValue) return;
      
      // Determine if the difference is significant (more than 5%)
      const percentDiff = Math.abs(((currentValue - comparedValue) / comparedValue) * 100);
      if (percentDiff < 5) return;
      
      const higherIsBetter = ['accuracy', 'muzzleVelocity', 'ergonomics'];
      const lowerIsBetter = ['weight', 'verticalRecoil', 'horizontalRecoil'];
      
      if (higherIsBetter.includes(key)) {
        if (currentValue > comparedValue) {
          improvements.push(`better ${name}`);
        } else {
          downsides.push(`worse ${name}`);
        }
      } else if (lowerIsBetter.includes(key)) {
        if (currentValue < comparedValue) {
          improvements.push(`reduced ${name}`);
        } else {
          downsides.push(`increased ${name}`);
        }
      }
    });
    
    if (improvements.length === 0 && downsides.length === 0) {
      return 'The configurations are very similar in performance.';
    }
    
    let summary = 'Compared to the saved configuration, your current setup ';
    
    if (improvements.length > 0) {
      summary += `offers ${improvements.join(', ')}`;
      
      if (downsides.length > 0) {
        summary += ` but has ${downsides.join(', ')}.`;
      } else {
        summary += ' with no significant downsides.';
      }
    } else {
      summary += `has ${downsides.join(', ')}.`;
    }
    
    return summary;
  };
  
  if (!isActive) return null;
  
  return (
    <div className="comparison-tool active">
      <div className="comparison-header">
        <h3>COMPARISON TOOL</h3>
        <button 
          className="comparison-close"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      <div className="comparison-selector">
        <select
          value={selectedConfigId}
          onChange={(e) => setSelectedConfigId(e.target.value)}
          disabled={loading || savedConfigs.length === 0}
        >
          <option value="">Select a configuration</option>
          {savedConfigs.map(config => (
            <option key={config.id} value={config.id}>
              {config.name} {config.isLocal ? '(Local)' : ''}
            </option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <div className="loading-indicator">Loading saved configurations...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : savedConfigs.length === 0 ? (
        <div className="no-configs-message">
          No saved configurations found for comparison.
        </div>
      ) : !comparedConfig ? (
        <div className="no-configs-message">
          Select a configuration to compare.
        </div>
      ) : (
        <>
          {/* Stats comparison */}
          <div className="comparison-stats">
            {/* Display important stats side by side */}
            <div className="compare-stats-row">
              <div className="compare-stat-label">Stat</div>
              <div className="compare-stat-value">Current</div>
              <div className="compare-stat-value">Compared</div>
            </div>
            
            {['accuracy', 'verticalRecoil', 'horizontalRecoil', 'ergonomics', 
              'muzzleVelocity', 'weight', 'effectiveDistance'].map(stat => (
              <div className="compare-stats-row" key={stat}>
                <div className="compare-stat-label">
                  {stat.charAt(0).toUpperCase() + stat.slice(1).replace(/([A-Z])/g, ' $1')}
                </div>
                <div className={`compare-stat-value current ${
                  getComparisonClass(stat, currentStats[stat], comparedConfig.stats[stat])
                }`}>
                  {formatStatValue(stat, currentStats[stat])}
                </div>
                <div className="compare-stat-value compared">
                  {formatStatValue(stat, comparedConfig.stats[stat])}
                </div>
              </div>
            ))}
            
            {/* Text comparison summary */}
            <div className="comparison-result">
              {generateComparisonSummary()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparisonTool;