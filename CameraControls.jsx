import React from 'react';

const CameraControls = ({ cameraRef, orbitControlsRef }) => {
  // Function to rotate the camera 90 degrees around the Y axis
  const rotateLeft = () => {
    if (orbitControlsRef.current) {
      const currentAzimuthalAngle = orbitControlsRef.current.getAzimuthalAngle();
      orbitControlsRef.current.setAzimuthalAngle(currentAzimuthalAngle - Math.PI / 2);
      orbitControlsRef.current.update();
    }
  };
  
  // Function to rotate the camera 90 degrees to the right
  const rotateRight = () => {
    if (orbitControlsRef.current) {
      const currentAzimuthalAngle = orbitControlsRef.current.getAzimuthalAngle();
      orbitControlsRef.current.setAzimuthalAngle(currentAzimuthalAngle + Math.PI / 2);
      orbitControlsRef.current.update();
    }
  };
  
  // Function to zoom in
  const zoomIn = () => {
    if (orbitControlsRef.current) {
      const currentDistance = orbitControlsRef.current.getDistance();
      const newDistance = Math.max(2, currentDistance * 0.8); // Prevent zooming too close
      orbitControlsRef.current.dollyTo(newDistance, true);
    }
  };
  
  // Function to zoom out
  const zoomOut = () => {
    if (orbitControlsRef.current) {
      const currentDistance = orbitControlsRef.current.getDistance();
      const newDistance = Math.min(10, currentDistance * 1.2); // Prevent zooming too far
      orbitControlsRef.current.dollyTo(newDistance, true);
    }
  };
  
  // Function to reset the camera to the default position
  const resetCamera = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset();
    }
  };
  
  return (
    <div className="camera-controls">
      <button className="camera-control-button" onClick={rotateLeft} title="Rotate Left">
        ↶
      </button>
      <button className="camera-control-button" onClick={rotateRight} title="Rotate Right">
        ↷
      </button>
      <button className="camera-control-button" onClick={zoomIn} title="Zoom In">
        +
      </button>
      <button className="camera-control-button" onClick={zoomOut} title="Zoom Out">
        -
      </button>
      <button className="camera-control-button reset" onClick={resetCamera} title="Reset Camera">
        RST
      </button>
    </div>
  );
};

export default CameraControls;