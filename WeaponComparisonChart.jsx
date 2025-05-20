import React, { useState, useEffect } from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const WeaponComparisonChart = ({ currentWeapon, comparedWeapon, width = 500, height = 400 }) => {
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    if (!currentWeapon || !currentWeapon.stats) return;
    
    // Define which stats to show on the radar chart
    const statsToShow = [
      { key: 'accuracy', name: 'Accuracy', max: 100 },
      { key: 'verticalRecoil', name: 'V-Recoil', max: 100, invert: true },
      { key: 'horizontalRecoil', name: 'H-Recoil', max: 200, invert: true },
      { key: 'ergonomics', name: 'Ergonomics', max: 100 },
      { key: 'muzzleVelocity', name: 'Muzzle Vel.', max: 1000 },
      { key: 'weight', name: 'Weight', max: 10, invert: true }
    ];
    
    // Prepare data for radar chart
    const data = statsToShow.map(stat => {
      // For stats where lower is better, invert the value for visual clarity
      const currentValue = currentWeapon.stats[stat.key];
      const normalizedCurrent = stat.invert 
        ? (1 - currentValue / stat.max) * 100 
        : (currentValue / stat.max) * 100;
        
      const result = {
        stat: stat.name,
        current: Math.max(0, Math.min(100, normalizedCurrent))
      };
      
      // Add compared weapon if available
      if (comparedWeapon && comparedWeapon.stats) {
        const comparedValue = comparedWeapon.stats[stat.key];
        const normalizedCompared = stat.invert 
          ? (1 - comparedValue / stat.max) * 100 
          : (comparedValue / stat.max) * 100;
          
        result.compared = Math.max(0, Math.min(100, normalizedCompared));
      }
      
      return result;
    });
    
    setChartData(data);
  }, [currentWeapon, comparedWeapon]);
  
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div style={{ width, height }}>
      <h3 style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        fontFamily: 'Rajdhani, sans-serif',
        color: '#e0e0e0'
      }}>
        Weapon Performance Comparison
      </h3>
      
      <ResponsiveContainer width="100%" height="80%">
        <RadarChart data={chartData} outerRadius="80%">
          <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
          <PolarAngleAxis 
            dataKey="stat" 
            tick={{ fill: '#aaa', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: '#777', fontSize: 10 }}
            tickCount={5} 
            stroke="rgba(255, 255, 255, 0.1)"
          />
          
          <Radar
            name={currentWeapon?.name || "Current"}
            dataKey="current"
            stroke="rgba(0, 180, 255, 0.8)"
            fill="rgba(0, 180, 255, 0.4)"
            strokeWidth={2}
            dot={{ fill: "rgba(0, 180, 255, 1)", r: 4 }}
            activeDot={{ r: 6, fill: "#fff", stroke: "rgba(0, 180, 255, 1)" }}
          />
          
          {comparedWeapon && (
            <Radar
              name={comparedWeapon?.name || "Compared"}
              dataKey="compared"
              stroke="rgba(255, 180, 0, 0.8)"
              fill="rgba(255, 180, 0, 0.4)"
              strokeWidth={2}
              dot={{ fill: "rgba(255, 180, 0, 1)", r: 4 }}
              activeDot={{ r: 6, fill: "#fff", stroke: "rgba(255, 180, 0, 1)" }}
            />
          )}
          
          <Tooltip content={customTooltip} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        fontSize: '0.8rem',
        color: '#888',
        fontFamily: 'Rajdhani, sans-serif'
      }}>
        <p>*Values normalized for comparison (higher is better)</p>
      </div>
      
      <style jsx>{`
        .custom-tooltip {
          background-color: rgba(20, 20, 20, 0.9);
          border: 1px solid rgba(100, 100, 100, 0.3);
          border-radius: 4px;
          padding: 8px 12px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.8rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }
        
        .label {
          margin-bottom: 5px;
          color: #ddd;
          font-weight: 600;
          border-bottom: 1px solid rgba(100, 100, 100, 0.3);
          padding-bottom: 3px;
        }
      `}</style>
    </div>
  );
};

export default WeaponComparisonChart;