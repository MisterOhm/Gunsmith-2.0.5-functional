import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Enhanced AttachmentPoint component that maintains the original interface
 * but adds improved positioning, animations, and interaction
 */
const AttachmentPoint = ({ 
  slot, 
  attachmentPointPosition, 
  canvasRef, 
  containerRef,
  isActive,
  onToggle,
  equippedAttachment,
  compatibleAttachments,
  onSelectAttachment
}) => {
  const [screenPosition, setScreenPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef();
  
  // Calculate screen position for the UI element based on 3D position
  useEffect(() => {
    if (!attachmentPointPosition || !canvasRef.current || !containerRef.current) {
      setIsVisible(false);
      return;
    }
    
    const updatePosition = () => {
      // Get the canvas and container bounds
      const canvasBounds = canvasRef.current.getBoundingClientRect();
      const containerBounds = containerRef.current.getBoundingClientRect();
      
      // Extract 3D position from the attachmentPointPosition
      const { position } = attachmentPointPosition;
      
      // Create a vector from the 3D position
      const vector = new THREE.Vector3(position.x, position.y, position.z);
      
      // Create a temporary camera to project the point to screen space
      // We're simulating what the actual Three.js camera is doing
      const tempCamera = new THREE.PerspectiveCamera(45, canvasBounds.width / canvasBounds.height, 0.1, 1000);
      tempCamera.position.set(0, 0, 5); // Approximate camera position
      
      // Project 3D point to screen space
      vector.project(tempCamera);
      
      // Convert to screen coordinates
      const screenX = ((vector.x + 1) / 2) * canvasBounds.width + canvasBounds.left;
      const screenY = (-(vector.y - 1) / 2) * canvasBounds.height + canvasBounds.top;
      
      // Calculate offset based on slot type for better positioning
      const slotType = slot.id.split('_')[0];
      let offsetX = 0;
      let offsetY = 0;
      
      switch(slotType) {
        case 'barrel':
          offsetX = 120;
          break;
        case 'muzzle':
          offsetX = 160;
          break;
        case 'stock':
          offsetX = -120;
          break;
        case 'grip':
          offsetY = 40;
          break;
        case 'sight':
          offsetY = -40;
          break;
        case 'underbarrel':
          offsetY = 30;
          break;
        case 'mount':
          offsetY = -30;
          break;
        case 'magazine':
          offsetY = 50;
          break;
        case 'receiver':
          offsetY = -20;
          break;
        default:
          break;
      }
      
      // Apply offsets
      const finalX = screenX + offsetX;
      const finalY = screenY + offsetY;
      
      // Check if the position is on screen
      const isInBounds = 
        finalX > 0 && 
        finalX < window.innerWidth && 
        finalY > 0 && 
        finalY < window.innerHeight;
      
      setScreenPosition({
        x: finalX,
        y: finalY
      });
      
      setIsVisible(isInBounds);
    };
    
    // Run immediately
    updatePosition();
    
    // Also set up resize and scroll listeners
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    // Update position periodically to handle any camera movement
    const intervalId = setInterval(updatePosition, 100);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      clearInterval(intervalId);
    };
  }, [attachmentPointPosition, canvasRef, containerRef, slot.id]);
  
  // When active state changes, trigger animation
  useEffect(() => {
    if (isActive) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isActive]);
  
  // Calculate the connecting line
  const lineStyle = () => {
    if (!buttonRef.current) return {};
    
    const buttonBounds = buttonRef.current.getBoundingClientRect();
    const buttonCenter = {
      x: buttonBounds.left + buttonBounds.width / 2,
      y: buttonBounds.top + buttonBounds.height / 2
    };
    
    // Connector line from attachment point to button
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const attachmentPoint = {
      x: canvasBounds.left + screenPosition.x,
      y: canvasBounds.top + screenPosition.y
    };
    
    // Calculate angle and length
    const dx = buttonCenter.x - attachmentPoint.x;
    const dy = buttonCenter.y - attachmentPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    return {
      width: `${length}px`,
      transform: `rotate(${angle}deg)`,
      left: `${attachmentPoint.x}px`,
      top: `${attachmentPoint.y}px`,
      transition: 'all 0.2s ease'
    };
  };
  
  // Helper function to format stat values
  const formatStatValue = (value) => {
    return value > 0 ? `+${value}` : value;
  };
  
  // Determine if a stat modification is positive or negative
  const getStatClass = (stat, value) => {
    // For some stats, higher is better, for others lower is better
    const higherIsBetter = ['durability', 'accuracy', 'muzzleVelocity', 
                          'sightingRange', 'ergonomics', 'effectiveDistance'];
  
    const lowerIsBetter = ['weight', 'verticalRecoil', 'horizontalRecoil'];
    
    if (higherIsBetter.includes(stat)) {
      return value > 0 ? 'stat-up' : 'stat-down';
    }
    
    if (lowerIsBetter.includes(stat)) {
      return value < 0 ? 'stat-up' : 'stat-down';
    }
    
    return '';
  };
  
  // Generate a summary of attachment stat changes
  const getAttachmentStatsSummary = (attachment) => {
    if (!attachment || !attachment.statModifiers) return null;
    
    // Get the top 2 most significant stat changes
    const sortedStats = [...attachment.statModifiers]
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 2);
    
    return sortedStats.map((stat, index) => (
      <div 
        key={index} 
        className={`attachment-stat-badge ${getStatClass(stat.stat, stat.value)}`}
      >
        {stat.stat.slice(0, 3).toUpperCase()}: {formatStatValue(stat.value)}
      </div>
    ));
  };
  
  return (
    <>
      {/* SVG connector line */}
      {isVisible && (
        <div 
          className="attachment-point-connector" 
          style={lineStyle()}
        />
      )}
      
      {/* Attachment point UI */}
      <div 
        className={`attachment-point-ui ${isActive ? 'active' : ''}`}
        style={{
          position: 'absolute',
          left: `${screenPosition.x}px`,
          top: `${screenPosition.y}px`,
          transform: `translate(-50%, -50%) ${isAnimating ? 'scale(1.05)' : 'scale(1)'}`,
          display: isVisible ? 'block' : 'none',
          zIndex: isActive ? 110 : 100,
          transition: 'all 0.2s ease'
        }}
        ref={buttonRef}
      >
        <div 
          className={`attachment-point-button ${isActive ? 'active' : ''}`}
          onClick={onToggle}
        >
          <div className="attachment-point-icon">
            {slot.name.charAt(0)}
          </div>
          <div className="attachment-point-name">
            {equippedAttachment ? equippedAttachment.name : `${slot.name}`}
          </div>
        </div>
        
        {/* Attachment options panel - only shown when active */}
        {isActive && (
          <div className="attachment-options-panel">
            {/* "None" option */}
            <div 
              className={`attachment-option ${!equippedAttachment ? 'selected' : ''}`}
              onClick={() => onSelectAttachment(null)}
            >
              <div className="attachment-option-image">
                None
              </div>
              <div className="attachment-option-details">
                <div className="attachment-option-name">No Attachment</div>
                <div className="attachment-option-stats">Default</div>
              </div>
            </div>
            
            {/* Available attachments */}
            {compatibleAttachments.map(attachment => (
              <div 
                key={attachment.id}
                className={`attachment-option ${equippedAttachment?.id === attachment.id ? 'selected' : ''}`}
                onClick={() => onSelectAttachment(attachment)}
              >
                <div className="attachment-option-image">
                  {attachment.type.charAt(0).toUpperCase() + attachment.type.slice(1, 3)}
                </div>
                <div className="attachment-option-details">
                  <div className="attachment-option-name">{attachment.name}</div>
                  <div className="attachment-option-stats">
                    {getAttachmentStatsSummary(attachment)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .attachment-point-connector {
          position: absolute;
          background-color: ${isActive ? 'rgba(0, 180, 255, 0.8)' : 'rgba(100, 100, 100, 0.5)'};
          height: 2px;
          transform-origin: left center;
          pointer-events: none;
          box-shadow: ${isActive ? '0 0 5px rgba(0, 180, 255, 0.5)' : 'none'};
        }
        
        .attachment-point-button {
          background-color: rgba(20, 20, 20, 0.85);
          border: 1px solid rgba(100, 100, 100, 0.4);
          border-radius: 6px;
          padding: 8px 12px;
          min-width: 120px;
          cursor: pointer;
          display: flex;
          align-items: center;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.85rem;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          transition: all 0.2s ease;
        }
        
        .attachment-point-button:hover {
          border-color: rgba(0, 180, 255, 0.7);
          background-color: rgba(40, 40, 40, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
        }
        
        .attachment-point-button.active {
          border-color: rgba(0, 180, 255, 1);
          background-color: rgba(40, 40, 40, 0.95);
          transform: translateY(-2px);
          box-shadow: 0 0 12px rgba(0, 180, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.6);
        }
        
        .attachment-point-icon {
          width: 24px;
          height: 24px;
          background-color: rgba(60, 60, 60, 0.7);
          border-radius: 4px;
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: #ccc;
        }
        
        .attachment-point-name {
          flex-grow: 1;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .attachment-options-panel {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          min-width: 180px;
          background-color: rgba(20, 20, 20, 0.95);
          border: 1px solid rgba(100, 100, 100, 0.4);
          border-radius: 6px;
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .attachment-option {
          padding: 10px;
          display: flex;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid rgba(70, 70, 70, 0.2);
          transition: background-color 0.2s;
        }
        
        .attachment-option:last-child {
          border-bottom: none;
        }
        
        .attachment-option:hover {
          background-color: rgba(50, 50, 50, 0.8);
        }
        
        .attachment-option.selected {
          background-color: rgba(0, 180, 255, 0.15);
          border-left: 3px solid rgba(0, 180, 255, 0.8);
        }
        
        .attachment-option-image {
          width: 36px;
          height: 36px;
          background-color: #333;
          border-radius: 4px;
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          color: #aaa;
        }
        
        .attachment-option-details {
          flex-grow: 1;
        }
        
        .attachment-option-name {
          font-size: 0.9rem;
          margin-bottom: 3px;
          color: #eee;
        }
        
        .attachment-option-stats {
          font-size: 0.7rem;
          color: #888;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        
        .attachment-stat-badge {
          padding: 2px 4px;
          border-radius: 2px;
          font-size: 0.65rem;
          background-color: rgba(60, 60, 60, 0.7);
          color: #ccc;
        }
        
        .attachment-stat-badge.stat-up {
          background-color: rgba(0, 100, 50, 0.3);
          color: rgba(100, 240, 100, 0.9);
        }
        
        .attachment-stat-badge.stat-down {
          background-color: rgba(100, 30, 30, 0.3);
          color: rgba(240, 100, 100, 0.9);
        }
        
        .attachment-point-ui.active {
          z-index: 110;
        }
      `}</style>
    </>
  );
};

export default AttachmentPoint;