import React, { useRef } from 'react';

const ExportPanel = ({ selectedWeapon, equippedAttachments, weaponStats }) => {
  // Function to export as image (screenshot)
  const exportImage = () => {
    // Get the canvas element - it's the first canvas element in the document
    const canvas = document.querySelector('canvas');
    
    if (!canvas) {
      console.error('Canvas not found');
      alert('Cannot capture screenshot: Canvas not found');
      return;
    }
    
    try {
      // Render the canvas to a data URL
      const dataURL = canvas.toDataURL('image/png');
      
      // Create a download link
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${selectedWeapon.name.replace(/\s+/g, '-')}_config.png`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      alert('Error capturing screenshot. See console for details.');
    }
  };
  
  // Function to export as JSON
  const exportJSON = () => {
    // Create the configuration object
    const configData = {
      weapon: {
        id: selectedWeapon.id,
        name: selectedWeapon.name,
        caliber: selectedWeapon.caliber
      },
      attachments: equippedAttachments,
      stats: weaponStats,
      exportDate: new Date().toISOString()
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(configData, null, 2);
    
    // Create a Blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedWeapon.name.replace(/\s+/g, '-')}_config.json`;
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };
  
  return (
    <div className="export-panel">
      <button className="export-button" onClick={exportImage} title="Export as Image">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path d="M4 5h13v7h2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5zm7 14l-5-5h3V9h4v5h3l-5 5z" fill="currentColor"/>
        </svg>
        Image
      </button>
      <button className="export-button" onClick={exportJSON} title="Export as JSON">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
        </svg>
        JSON
      </button>
    </div>
  );
};

export default ExportPanel;