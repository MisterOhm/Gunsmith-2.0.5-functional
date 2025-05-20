import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Stars, 
  Html, 
  PerspectiveCamera, 
  useProgress,
  ContactShadows
} from '@react-three/drei';
import WeaponModel from './components/WeaponModel';
import StatsPanel from './components/StatsPanel';
import AttachmentPoint from './components/AttachmentPoint';
import SavedConfigs from './components/SavedConfigs';
import ComparisonTool from './components/ComparisonTool';
import PresetConfigs from './components/PresetConfigs';
import CameraControls from './components/CameraControls';
import ExportPanel from './components/ExportPanel';
import './App.css';

// React Router imports
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './AdminPanel.css';
import AdminPanel from './admin/AdminPanel';

// Firebase imports
import { db } from './firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

// Mock data imports (used as fallback)
import weaponsData from './mockData/weapons.json';
import attachmentsData from './mockData/attachments.json';
import attachmentSlotsData from './mockData/attachment-slots.json';

// Loading indicator component
function Loader() {
  const { progress, active, item } = useProgress();
  
  return (
    <Html center>
      <div className="loader-container">
        <div className="loader-title">WEAPON MODDING</div>
        <div className="loader-subtitle">Loading Assets</div>
        <div className="loader-progress-container">
          <div className="loader-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="loader-item">{active ? item : 'Ready'}</div>
      </div>
    </Html>
  );
}

function App() {
  const [weapons, setWeapons] = useState([]);
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [availableAttachments, setAvailableAttachments] = useState([]);
  const [equippedAttachments, setEquippedAttachments] = useState({});
  const [weaponStats, setWeaponStats] = useState({});
  const [activeFilters, setActiveFilters] = useState({
    vitalParts: true,
    functionalMods: true,
    equipmentParts: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attachmentPointPositions, setAttachmentPointPositions] = useState({});
  const [activeSlot, setActiveSlot] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Enhanced state variables for improved UI/UX
  const [showComparisonTool, setShowComparisonTool] = useState(false);
  const [showPresetConfigs, setShowPresetConfigs] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([0, 0, 5]);
  const [environment, setEnvironment] = useState('city');
  const [showParticles, setShowParticles] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [modelLoadSuccess, setModelLoadSuccess] = useState(false);
  const [viewMode, setViewMode] = useState('standard'); // standard, xray, wireframe
  
  const canvasRef = useRef();
  const containerRef = useRef();
  const cameraRef = useRef();
  const orbitControlsRef = useRef();

  // Notification system
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  };

  // Load weapons from Firestore with enhanced error handling
  useEffect(() => {
    const fetchWeapons = async () => {
      try {
        setIsLoading(true);
        
        // Try to load from Firestore
        const weaponsCollection = collection(db, 'weapons');
        const weaponsQuery = query(weaponsCollection, orderBy('name'));
        const snapshot = await getDocs(weaponsQuery);
        
        if (!snapshot.empty) {
          const loadedWeapons = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setWeapons(loadedWeapons);
          if (loadedWeapons.length > 0) {
            setSelectedWeapon(loadedWeapons[0]);
          }
          addNotification('Weapons loaded from database successfully');
        } else {
          console.log('No weapons found in Firestore, using mock data');
          setWeapons(weaponsData);
          if (weaponsData.length > 0) {
            setSelectedWeapon(weaponsData[0]);
          }
          addNotification('Using demo weapon data', 'warning');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load weapons:', err);
        // Fallback to mock data
        setWeapons(weaponsData);
        if (weaponsData.length > 0) {
          setSelectedWeapon(weaponsData[0]);
        }
        setIsLoading(false);
        addNotification('Error connecting to database. Using demo data.', 'error');
      }
    };

    fetchWeapons();
  }, []);

  // Load attachments and stats when a weapon is selected
  useEffect(() => {
    if (!selectedWeapon) return;

    setIsLoading(true);
    setActiveSlot(null); // Reset active slot
    
    // In a real app, we would load this data from Firebase
    // For now, we're using the mock data
    setTimeout(() => {
      // Get all compatible attachments for this weapon
      const compatible = attachmentsData.filter(attachment => 
        attachment.compatibleSlots.some(slot => 
          slot.startsWith(selectedWeapon.id.toString())
        )
      );
      
      setAvailableAttachments(compatible);
      
      // Set the default stats for this weapon
      setWeaponStats(selectedWeapon.baseStats);
      
      // Initialize with empty attachments
      setEquippedAttachments({});
      
      // Reset model load state
      setModelLoadSuccess(false);
            
      setIsLoading(false);
      addNotification(`${selectedWeapon.name} selected`, 'info');
    }, 300);
  }, [selectedWeapon]);

  // Update stats when attachments change
  useEffect(() => {
    if (!selectedWeapon || Object.keys(equippedAttachments).length === 0) return;

    // Calculate new stats based on equipped attachments
    const calculateStats = () => {
      // Clone the base stats
      const calculatedStats = JSON.parse(JSON.stringify(selectedWeapon.baseStats));
      calculatedStats.baseStats = JSON.parse(JSON.stringify(selectedWeapon.baseStats));
      
      // Apply each attachment's stat modifiers
      Object.values(equippedAttachments).forEach(attachment => {
        if (!attachment) return;
        
        attachment.statModifiers.forEach(modifier => {
          const { stat, value } = modifier;
          
          // Handle durability specially as it's an object
          if (stat === 'durability') {
            calculatedStats.durability.max += value;
            // Ensure current doesn't exceed max
            if (calculatedStats.durability.current > calculatedStats.durability.max) {
              calculatedStats.durability.current = calculatedStats.durability.max;
            }
          } 
          // Handle other stats
          else if (calculatedStats[stat] !== undefined) {
            calculatedStats[stat] += value;
            
            // Ensure we don't go below 0 for certain stats
            const statsToKeepPositive = ['weight', 'ergonomics', 'accuracy', 'sightingRange', 
                'muzzleVelocity', 'effectiveDistance', 'fireRate'];
                
            if (statsToKeepPositive.includes(stat)) {
              calculatedStats[stat] = Math.max(0, calculatedStats[stat]);
            }
          }
        });
      });
      
      setWeaponStats(calculatedStats);
    };

    calculateStats();
  }, [equippedAttachments, selectedWeapon]);

  const handleWeaponChange = (weaponId) => {
    const weapon = weapons.find(w => w.id === weaponId);
    setSelectedWeapon(weapon);
    // Close any open panels when changing weapons
    setShowComparisonTool(false);
    setActiveSlot(null);
  };

  const handleAttachmentSelect = (slotId, attachment) => {
    if (attachment) {
      addNotification(`${attachment.name} equipped`, 'success');
    } else {
      addNotification(`Attachment removed`, 'info');
    }
    
    setEquippedAttachments(prev => ({
      ...prev,
      [slotId]: attachment
    }));
    
    // Close the active slot after selection
    setActiveSlot(null);
  };

  const handleFilterChange = (filterName, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const getAttachmentSlots = (weaponId) => {
    return attachmentSlotsData[weaponId] || [];
  };

  // This function will be called by the WeaponModel component to update position data
  const updateAttachmentPointPosition = (slotId, position, quaternion) => {
    setAttachmentPointPositions(prev => ({
      ...prev,
      [slotId]: { position, quaternion }
    }));
  };
  
  const toggleActiveSlot = (slotId) => {
    if (activeSlot === slotId) {
      setActiveSlot(null);
    } else {
      setActiveSlot(slotId);
    }
  };
  
  const getCompatibleAttachments = (slotId) => {
    return availableAttachments.filter(attachment => 
      attachment.compatibleSlots.includes(slotId)
    );
  };
  
  // Enhanced function to load saved configuration
  const handleLoadConfig = (attachments) => {
    setEquippedAttachments(attachments);
    addNotification('Configuration loaded', 'success');
  };
  
  // Enhanced function to apply preset configuration
  const handleApplyPreset = (attachments) => {
    setEquippedAttachments(attachments);
    addNotification('Preset configuration applied', 'success');
  };
  
  // Handle model load success/failure
  const handleModelLoadSuccess = () => {
    setModelLoadSuccess(true);
    addNotification('3D model loaded successfully', 'success');
  };
  
  const handleModelLoadError = (error) => {
    console.error('Error loading 3D model:', error);
    addNotification('Error loading 3D model. Using fallback.', 'error');
  };
  
  // Handle environment change
  const handleEnvironmentChange = (env) => {
    setEnvironment(env);
  };
  
  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  // Save current configuration
  const handleSaveConfiguration = () => {
    // In a real app, you would save to Firebase
    // For now, just show notification
    addNotification('Configuration saved (demo)', 'success');
  };

  // Main rendering logic
  if (isLoading && !selectedWeapon) {
    return <div className="loading">Loading weapons data</div>;
  }

  return (
    <div className="app-container" ref={containerRef}>
      {/* Header with weapon name and info */}
      <header className="app-header">
        <h1>WEAPON MODDING</h1>
        {selectedWeapon && (
          <h2>{selectedWeapon.name} {selectedWeapon.caliber}</h2>
        )}
      </header>
      
      {/* Weapon selector dropdown */}
      <div className="weapon-selector">
        <select 
          value={selectedWeapon ? selectedWeapon.id : ''}
          onChange={(e) => handleWeaponChange(e.target.value)}
        >
          {weapons.map(weapon => (
            <option key={weapon.id} value={weapon.id}>
              {weapon.name} ({weapon.caliber})
            </option>
          ))}
        </select>
      </div>
      
      {/* Enhanced view controls */}
      <div className="view-controls">
        <div className="view-control-group">
          <span>Environment:</span>
          <select value={environment} onChange={(e) => handleEnvironmentChange(e.target.value)}>
            <option value="city">City</option>
            <option value="dawn">Dawn</option>
            <option value="sunset">Sunset</option>
            <option value="night">Night</option>
            <option value="warehouse">Warehouse</option>
            <option value="forest">Forest</option>
            <option value="studio">Studio</option>
          </select>
        </div>
        <div className="view-control-group">
          <span>View Mode:</span>
          <select value={viewMode} onChange={(e) => handleViewModeChange(e.target.value)}>
            <option value="standard">Standard</option>
            <option value="xray">X-Ray</option>
            <option value="wireframe">Wireframe</option>
          </select>
        </div>
        <div className="view-control-group toggle">
          <span>Auto-Rotate:</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={autoRotate}
              onChange={() => setAutoRotate(!autoRotate)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="view-control-group toggle">
          <span>Effects:</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={showParticles}
              onChange={() => setShowParticles(!showParticles)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      {/* Preset Configs Button */}
      <button 
        className="preset-configs-button"
        onClick={() => setShowPresetConfigs(true)}
      >
        View Preset Configurations
      </button>

      {/* 3D Canvas with enhanced features */}
      <div className="weapon-canvas" ref={canvasRef}>
        <Canvas shadows>
          <Suspense fallback={<Loader />}>
            <PerspectiveCamera 
              makeDefault 
              position={cameraPosition} 
              fov={45}
              ref={cameraRef}
            />
            
            <ambientLight intensity={0.5} />
            <spotLight 
              position={[10, 10, 10]} 
              angle={0.3} 
              penumbra={1} 
              intensity={1} 
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            
            <OrbitControls 
              ref={orbitControlsRef}
              enableDamping={true}
              dampingFactor={0.05}
              rotateSpeed={0.5}
              minDistance={2}
              maxDistance={10}
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
            />
            
            <Environment preset={environment} />
            
            {selectedWeapon && (
              <WeaponModel 
                weaponId={selectedWeapon.id} 
                attachments={equippedAttachments}
                updateAttachmentPointPosition={updateAttachmentPointPosition}
                highlightedSlot={activeSlot}
                viewMode={viewMode}
                showEffects={showParticles}
                onLoadSuccess={handleModelLoadSuccess}
                onLoadError={handleModelLoadError}
              />
            )}
            
            {/* Ground plane with shadows */}
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -2, 0]} 
              receiveShadow
            >
              <planeGeometry args={[30, 30]} />
              <shadowMaterial opacity={0.2} />
            </mesh>
            
            <ContactShadows
              opacity={0.5}
              scale={10}
              blur={2}
              far={5}
              resolution={256}
              color="#000000"
              position={[0, -2, 0]}
            />
            
            {/* Background particles if enabled */}
            {showParticles && <Stars fade speed={0.5} count={1000} />}
          </Suspense>
        </Canvas>
      </div>
      
      {/* Camera Controls */}
      <CameraControls 
        cameraRef={cameraRef} 
        orbitControlsRef={orbitControlsRef} 
      />
      
      {/* Export Panel */}
      <ExportPanel 
        selectedWeapon={selectedWeapon}
        equippedAttachments={equippedAttachments}
        weaponStats={weaponStats}
      />
      
      {/* Stats Panel */}
      <div className="stats-panel">
        <StatsPanel stats={weaponStats} />
        
        {/* Toggle Comparison Button */}
        <button 
          className="save-button" 
          style={{ marginTop: '15px' }}
          onClick={() => setShowComparisonTool(!showComparisonTool)}
        >
          {showComparisonTool ? 'Hide Comparison' : 'Compare Stats'}
        </button>
      </div>
      
      {/* Saved Configs Panel */}
      <SavedConfigs 
        selectedWeapon={selectedWeapon}
        equippedAttachments={equippedAttachments}
        onLoadConfig={handleLoadConfig}
        weaponStats={weaponStats}
      />
      
      {/* Comparison Tool */}
      <ComparisonTool 
        isActive={showComparisonTool}
        onClose={() => setShowComparisonTool(false)}
        selectedWeapon={selectedWeapon}
        currentStats={weaponStats}
        equippedAttachments={equippedAttachments}
      />
      
      {/* Preset Configs Modal */}
      <PresetConfigs 
        isOpen={showPresetConfigs}
        onClose={() => setShowPresetConfigs(false)}
        selectedWeapon={selectedWeapon}
        onApplyConfig={handleApplyPreset}
      />
      
      {/* Floating attachment point UI elements */}
      <div className="attachment-points-container">
        {selectedWeapon && getAttachmentSlots(selectedWeapon.id).map(slot => (
          <AttachmentPoint 
            key={slot.id}
            slot={slot}
            attachmentPointPosition={attachmentPointPositions[slot.id]}
            canvasRef={canvasRef}
            containerRef={containerRef}
            isActive={activeSlot === slot.id}
            onToggle={() => toggleActiveSlot(slot.id)}
            equippedAttachment={equippedAttachments[slot.id]}
            compatibleAttachments={getCompatibleAttachments(slot.id)}
            onSelectAttachment={(attachment) => handleAttachmentSelect(slot.id, attachment)}
          />
        ))}
      </div>
      
      {/* Enhanced save button */}
      <div 
        className="save-button pulse-animation"
        onClick={handleSaveConfiguration}
      >
        SAVE
      </div>
      
      {/* Admin panel link */}
      <Link to="/admin" style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        color: '#999',
        textDecoration: 'none',
        fontSize: '0.8rem'
      }}>Admin Panel</Link>
      
      {/* Notification system */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${notification.type}`}
          >
            {notification.message}
            <button 
              className="notification-close" 
              onClick={() => setNotifications(prev => 
                prev.filter(n => n.id !== notification.id)
              )}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Wrap App component with Router
function AppWithRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/*" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default AppWithRouter;