import React, { useState, useRef } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * Model Uploader component for admin panel
 * Allows uploading and previewing 3D models
 */
const ModelUploader = ({ itemId, itemType, onModelUploaded, currentModelPath }) => {
  const [modelFile, setModelFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentModelPath || null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is a valid 3D model format
    const validExtensions = ['.glb', '.gltf'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      setError('Please select a valid 3D model file (.glb or .gltf)');
      return;
    }

    setModelFile(file);
    setError(null);
    
    // Create a temporary URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setShowPreview(true);
    
    // Clean up the URL when the component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Handle model upload
  const handleUpload = async () => {
    if (!modelFile) return;

    setIsUploading(true);
    
    try {
      // Create a storage reference
      const storageFolder = itemType === 'weapon' ? 'weapons' : 'attachments';
      const storagePath = `models/${storageFolder}/${itemId}_${Date.now()}_${modelFile.name}`;
      const storageRef = ref(storage, storagePath);
      
      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, modelFile);
      
      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          setError(`Upload failed: ${error.message}`);
          setIsUploading(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Try to update the database record with the model path
          // Only if we're not in demo mode with a "new" item
          if (itemId && !itemId.startsWith('new-')) {
            try {
              const collectionName = itemType === 'weapon' ? 'weapons' : 'attachments';
              const itemRef = doc(db, collectionName, itemId);
              
              await updateDoc(itemRef, {
                modelPath: downloadURL,
                modelFileName: modelFile.name,
                modelUploadDate: new Date().toISOString()
              });
            } catch (dbError) {
              console.warn("Could not update database record, but upload succeeded:", dbError);
              // Continue as the upload was successful
            }
          }
          
          // Notify parent component
          if (onModelUploaded) {
            onModelUploaded(downloadURL);
          }
          
          setUploadProgress(100);
          setIsUploading(false);
          setModelFile(null);
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      );
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      setIsUploading(false);
    }
  };

  return (
    <div className="model-uploader">
      <h4>3D Model Upload</h4>
      
      <div className="upload-section">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".glb,.gltf"
          disabled={isUploading}
        />
        
        <p className="help-text">
          Accepted formats: GLB, GLTF. Max file size: 10MB.
          <br />
          For best results, optimize your models in Blender before uploading.
        </p>
        
        {currentModelPath && !modelFile && (
          <div className="current-model">
            <p>Current model: <b>{currentModelPath.split('/').pop() || currentModelPath}</b></p>
            <button 
              type="button"
              className="preview-button" 
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        )}
        
        {error && <div className="upload-error">{error}</div>}
        
        {isUploading && (
          <div className="upload-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            />
            <span className="progress-text">{Math.round(uploadProgress)}%</span>
          </div>
        )}
        
        {modelFile && (
          <div className="selected-file">
            <p>Selected file: <b>{modelFile.name}</b></p>
            <div className="upload-actions">
              <button 
                type="button"
                className="upload-button" 
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Model'}
              </button>
              <button 
                type="button"
                className="cancel-button" 
                onClick={() => {
                  setModelFile(null);
                  setPreviewUrl(currentModelPath);
                  setShowPreview(false);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="preview-button" 
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Simple 3D Model Preview */}
      {showPreview && previewUrl && (
        <div className="model-preview">
          <div className="preview-container">
            <div className="preview-placeholder">
              <p>Model: {previewUrl.split('/').pop() || previewUrl}</p>
              <p className="preview-note">Preview available after upload</p>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .model-uploader {
          margin-top: 20px;
        }
        
        .upload-section {
          margin-top: 10px;
        }
        
        .help-text {
          font-size: 0.8rem;
          color: #888;
          margin-top: 5px;
        }
        
        .upload-error {
          color: #ff4444;
          margin-top: 10px;
          padding: 10px;
          background-color: rgba(255, 68, 68, 0.1);
          border-radius: 4px;
        }
        
        .upload-progress {
          margin-top: 15px;
          background-color: #f0f0f0;
          border-radius: 4px;
          height: 20px;
          position: relative;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background-color: #00b4ff;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          line-height: 20px;
          text-align: center;
          color: white;
          font-size: 0.8rem;
          text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        }
        
        .selected-file {
          margin-top: 15px;
          padding: 10px;
          background-color: #f7f7f7;
          border-radius: 4px;
        }
        
        .current-model {
          margin-top: 10px;
          padding: 10px;
          background-color: #f7f7f7;
          border-radius: 4px;
        }
        
        .upload-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        .upload-button, .cancel-button, .preview-button {
          padding: 8px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }
        
        .upload-button {
          background-color: #00b4ff;
          color: white;
        }
        
        .upload-button:hover {
          background-color: #0099e6;
        }
        
        .cancel-button {
          background-color: #f0f0f0;
          color: #333;
        }
        
        .cancel-button:hover {
          background-color: #e0e0e0;
        }
        
        .preview-button {
          background-color: #555;
          color: white;
        }
        
        .preview-button:hover {
          background-color: #444;
        }
        
        .model-preview {
          margin-top: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .preview-container {
          width: 100%;
          height: 150px;
          background-color: #f7f7f7;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .preview-placeholder {
          text-align: center;
          color: #777;
        }
        
        .preview-note {
          font-size: 0.8rem;
          color: #999;
          margin-top: 5px;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ModelUploader;