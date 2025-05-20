import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WeaponManager from './components/WeaponManager';
import AttachmentManager from './components/AttachmentManager';
import Dashboard from './components/Dashboard';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate(); // This hook allows us to navigate programmatically
  
  const handleReturnToMain = () => {
    navigate('/'); // Navigate to the root path (main UI)
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-logo">Weapon Customizer Admin</div>
        <nav className="admin-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button 
            className={activeTab === 'weapons' ? 'active' : ''} 
            onClick={() => setActiveTab('weapons')}>Weapons</button>
          <button 
            className={activeTab === 'attachments' ? 'active' : ''} 
            onClick={() => setActiveTab('attachments')}>Attachments</button>
        </nav>
      </div>
      
      <div className="admin-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'weapons' && <WeaponManager />}
        {activeTab === 'attachments' && <AttachmentManager />}
      </div>
      
      {/* Floating return button */}
      <div className="floating-return-button" onClick={handleReturnToMain}>
        <span>Return to Main UI</span>
      </div>
    </div>
  );
}

export default AdminPanel;