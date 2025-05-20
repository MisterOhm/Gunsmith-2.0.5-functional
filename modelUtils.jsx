import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Utility functions for handling 3D models

/**
 * Cache for storing loaded models to avoid reloading
 */
const modelCache = new Map();

/**
 * Load a GLTF/GLB model with caching
 * @param {string} path - Path to the model file
 * @returns {Promise<THREE.Group>} - The loaded model scene
 */
export const loadModel = (path) => {
  return new Promise((resolve, reject) => {
    // Check cache first
    if (modelCache.has(path)) {
      // Return a clone of the cached model
      const cachedModel = modelCache.get(path);
      const clonedModel = cachedModel.clone();
      resolve(clonedModel);
      return;
    }

    // Load the model if not in cache
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        // Cache the result
        modelCache.set(path, gltf.scene.clone());
        resolve(gltf.scene);
      },
      (xhr) => {
        // Optional progress callback
        console.log(`${path}: ${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`);
      },
      (error) => {
        console.error('Error loading model:', error);
        reject(error);
      }
    );
  });
};

/**
 * Apply materials to a model
 * @param {THREE.Object3D} model - The model to apply materials to
 * @param {Object} materials - Materials configuration
 */
export const applyMaterialsToModel = (model, materials = {}) => {
  if (!model) return;

  const {
    defaultMaterial,
    partMaterials = {},  // Materials for specific parts by name
    typeMaterials = {},  // Materials for parts by type
  } = materials;

  model.traverse((child) => {
    if (child.isMesh) {
      // First check if there's a specific material for this part by name
      if (partMaterials[child.name]) {
        child.material = partMaterials[child.name];
      }
      // Then check if there's a material for this type of part
      else if (child.userData.type && typeMaterials[child.userData.type]) {
        child.material = typeMaterials[child.userData.type];
      }
      // Otherwise apply the default material if provided
      else if (defaultMaterial) {
        child.material = defaultMaterial;
      }
    }
  });
};

/**
 * Set up attachment points on a model
 * @param {THREE.Object3D} model - The model to set up attachment points on
 * @param {Object} attachmentPoints - Configuration for attachment points
 */
export const setupAttachmentPoints = (model, attachmentPoints = {}) => {
  if (!model || !attachmentPoints) return;

  // For each attachment point defined in the configuration
  Object.entries(attachmentPoints).forEach(([pointId, config]) => {
    const { position, rotation, parent } = config;
    
    // Create an attachment point object
    const attachmentPoint = new THREE.Object3D();
    attachmentPoint.name = `attachment_point_${pointId}`;
    
    // Set position and rotation if provided
    if (position) {
      attachmentPoint.position.set(position.x, position.y, position.z);
    }
    
    if (rotation) {
      attachmentPoint.rotation.set(rotation.x, rotation.y, rotation.z);
    }
    
    // Find the parent object to attach to
    if (parent) {
      let parentObject = null;
      
      model.traverse((child) => {
        if (child.name === parent) {
          parentObject = child;
        }
      });
      
      if (parentObject) {
        parentObject.add(attachmentPoint);
      } else {
        console.warn(`Parent object "${parent}" not found for attachment point "${pointId}"`);
        model.add(attachmentPoint);
      }
    } else {
      // If no parent specified, add to the root
      model.add(attachmentPoint);
    }
  });
};

/**
 * Find attachment points in a model
 * @param {THREE.Object3D} model - The model to find attachment points in
 * @returns {Object} - Object with attachment points by ID
 */
export const findAttachmentPoints = (model) => {
  const attachmentPoints = {};
  
  if (!model) return attachmentPoints;
  
  model.traverse((child) => {
    if (child.name && child.name.startsWith('attachment_point_')) {
      const pointId = child.name.replace('attachment_point_', '');
      attachmentPoints[pointId] = child;
    }
  });
  
  return attachmentPoints;
};

/**
 * Create standard materials for weapons and attachments
 * @returns {Object} - Object with materials
 */
export const createStandardMaterials = () => {
  return {
    metal: new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.2
    }),
    
    plastic: new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.1,
      roughness: 0.8
    }),
    
    wood: new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      metalness: 0.1,
      roughness: 0.7
    }),
    
    rubber: new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.0,
      roughness: 0.9
    }),
    
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x8888ff,
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.9,
      transparent: true
    })
  };
};

/**
 * Get default attachment point positions for a specific weapon
 * @param {string} weaponId - ID of the weapon
 * @returns {Object} - Attachment point positions
 */
export const getDefaultAttachmentPoints = (weaponId) => {
  // Default attachment point positions by weapon ID
  const defaultPositions = {
    // HK 416A5
    '1': {
      barrel: [0, 0, 1.8],
      muzzle: [0, 0, 2.1],
      stock: [0, 0, -1.5],
      grip: [0, -0.35, -0.3],
      sight: [0, 0.15, 0.3],
      underbarrel: [0, -0.15, 0.8],
      handguard: [0, 0, 0.7],
      magazine: [0, -0.5, 0.2],
      mount: [0, 0.15, 0.6],
      receiver: [0, 0.05, -0.3]
    },
    // AK-74M
    '2': {
      barrel: [0, 0, 1.7],
      muzzle: [0, 0, 2.0],
      stock: [0, 0, -1.4],
      grip: [0, -0.3, -0.25],
      sight: [0, 0.18, 0.2],
      underbarrel: [0, -0.2, 0.7],
      handguard: [0, 0, 0.6],
      magazine: [0, -0.45, 0.15],
      mount: [0, 0.2, 0.5],
      receiver: [0, 0.05, -0.2],
      gasblock: [0, 0.1, 0.9]
    },
    // M4A1
    '3': {
      barrel: [0, 0, 1.75],
      muzzle: [0, 0, 2.05],
      stock: [0, 0, -1.45],
      grip: [0, -0.33, -0.28],
      sight: [0, 0.16, 0.25],
      underbarrel: [0, -0.18, 0.75],
      handguard: [0, 0, 0.65],
      magazine: [0, -0.48, 0.18],
      mount: [0, 0.17, 0.55],
      receiver: [0, 0.06, -0.25],
      bolt: [0.15, 0, -0.2]
    }
  };
  
  return defaultPositions[weaponId] || defaultPositions['1'];
};

/**
 * Optimize a model for realtime rendering
 * @param {THREE.Object3D} model - The model to optimize
 */
export const optimizeModel = (model) => {
  if (!model) return;
  
  // Merge geometries where possible
  // This is a simple version - in a real application, you'd want a more sophisticated approach
  const mergeCandidates = new Map();
  
  model.traverse((child) => {
    if (child.isMesh) {
      // Skip meshes that shouldn't be merged (e.g., moving parts)
      if (child.userData.noMerge) return;
      
      // Use the material as the key for merging
      const materialKey = child.material.uuid;
      
      if (!mergeCandidates.has(materialKey)) {
        mergeCandidates.set(materialKey, []);
      }
      
      mergeCandidates.get(materialKey).push(child);
    }
  });
  
  // Optimize textures
  model.traverse((child) => {
    if (child.isMesh && child.material.map) {
      // Ensure textures use mipmaps
      child.material.map.minFilter = THREE.LinearMipMapLinearFilter;
      child.material.map.needsUpdate = true;
      
      // Resize large textures (example only - would need a more sophisticated approach in reality)
      // This would ideally be done in a preprocessing step, not at runtime
      if (child.material.map.image && 
          (child.material.map.image.width > 1024 || child.material.map.image.height > 1024)) {
        console.warn(`Large texture detected on ${child.name}: ${child.material.map.image.width}x${child.material.map.image.height}`);
      }
    }
  });
};

export default {
  loadModel,
  applyMaterialsToModel,
  setupAttachmentPoints,
  findAttachmentPoints,
  createStandardMaterials,
  getDefaultAttachmentPoints,
  optimizeModel
};