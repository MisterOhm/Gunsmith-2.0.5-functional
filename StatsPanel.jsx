import React from 'react';

const StatsPanel = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div>
        <h3>Weapon Stats</h3>
        <div className="stats-loading">Loading weapon statistics...</div>
      </div>
    );
  }

  // Format stat value based on its type
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
      case 'firingModes':
        return Array.isArray(value) ? value.join(', ') : value;
      case 'durability':
        return `${value.current}/${value.max}`;
      default:
        return value;
    }
  };

  // Calculate the percentage for stat bars
  const getStatPercentage = (stat, value) => {
    // Define max values for each stat type to normalize the bar length
    const maxValues = {
      durability: 100,
      weight: 10,
      ergonomics: 100,
      accuracy: 100,
      sightingRange: 1000,
      verticalRecoil: 200,
      horizontalRecoil: 400,
      muzzleVelocity: 1000,
      effectiveDistance: 1000,
      fireRate: 1200
    };

    const max = maxValues[stat] || 100;
    let percentage;
    
    if (stat === 'durability' && typeof value === 'object') {
      percentage = (value.current / value.max) * 100;
    } else {
      percentage = (value / max) * 100;
    }
    
    // Cap at 100%
    return Math.min(percentage, 100);
  };

  // Determine if a stat change is positive (green) or negative (red)
  const getStatChangeClass = (stat, value, baseValue) => {
    if (!baseValue || value === baseValue) return '';
    
    // For some stats, higher is better, for others lower is better
    const higherIsBetter = ['durability', 'accuracy', 'muzzleVelocity', 
                            'sightingRange', 'ergonomics', 'effectiveDistance'];
    
    const lowerIsBetter = ['weight', 'verticalRecoil', 'horizontalRecoil'];
    
    if (higherIsBetter.includes(stat)) {
      return value > baseValue ? 'positive-change' : 'negative-change';
    }
    
    if (lowerIsBetter.includes(stat)) {
      return value < baseValue ? 'positive-change' : 'negative-change';
    }
    
    return '';
  };

  // Define the order and grouping of stats
  const statGroups = [
    {
      name: 'Performance',
      stats: ['accuracy', 'muzzleVelocity', 'effectiveDistance', 'fireRate']
    },
    {
      name: 'Control',
      stats: ['verticalRecoil', 'horizontalRecoil', 'ergonomics', 'weight']
    },
    {
      name: 'Technical',
      stats: ['durability', 'sightingRange', 'firingModes', 'caliber']
    }
  ];

  return (
    <div>
      <h3>WEAPON STATS</h3>
      
      {statGroups.map(group => (
        <div key={group.name} className="stat-group">
          <div className="stat-group-title">{group.name}</div>
          
          {group.stats.map(statKey => {
            // Skip if this stat doesn't exist in the data
            if (!(statKey in stats)) return null;
            
            const value = stats[statKey];
            const baseValue = stats.baseStats ? stats.baseStats[statKey] : null;
            const changeClass = getStatChangeClass(statKey, value, baseValue);
            
            // Calculate percentage for the stat bar
            const percentage = 
              typeof value === 'number' 
                ? getStatPercentage(statKey, value)
                : statKey === 'durability' && typeof value === 'object'
                  ? getStatPercentage(statKey, value)
                  : null;
            
            // Format the stat name for display
            const formattedName = statKey
              .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
              .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
            
            // For firingModes and caliber, just show the value without a bar
            if (statKey === 'firingModes' || statKey === 'caliber') {
              return (
                <div key={statKey} className="stat-row">
                  <div className="stat-label">{formattedName}</div>
                  <div className={`stat-value ${changeClass}`}>
                    {formatStatValue(statKey, value)}
                  </div>
                </div>
              );
            }
            
            return (
              <div key={statKey} className="stat-row">
                <div className="stat-label">{formattedName}</div>
                <div>
                  {percentage !== null ? (
                    <div className="stat-bar-container">
                      <div 
                        className={`stat-bar ${changeClass}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  ) : null}
                  <div className={`stat-value ${changeClass}`}>
                    {formatStatValue(statKey, value)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default StatsPanel;