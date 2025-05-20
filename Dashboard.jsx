import React from 'react';

function Dashboard() {
  const stats = {
    totalWeapons: 3,
    totalAttachments: 12,
    totalConfigurations: 5
  };
  
  return (
    <div className="admin-dashboard">
      <h2>Dashboard</h2>
      
      <div className="dashboard-overview">
        <div className="stat-card">
          <h3>Total Weapons</h3>
          <div className="value">{stats.totalWeapons}</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Attachments</h3>
          <div className="value">{stats.totalAttachments}</div>
        </div>
        
        <div className="stat-card">
          <h3>Saved Configurations</h3>
          <div className="value">{stats.totalConfigurations}</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;