import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef0123456789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };

// Fallback data imports for demo mode
import weaponsData from './mockData/weapons.json';
import attachmentsData from './mockData/attachments.json';
import attachmentSlotsData from './mockData/attachment-slots.json';

/**
 * FirebaseService - A utility service for managing Firebase interactions
 * with fallback to local data when Firebase is not available
 */
class FirebaseService {
  /**
   * Check if we can connect to Firebase or need to use fallback data
   * @returns {Promise<boolean>} True if Firebase connection is available
   */
  async checkConnection() {
    try {
      // Try to get a document from Firestore
      const testQuery = query(collection(db, 'weapons'), limit(1));
      await getDocs(testQuery);
      return true;
    } catch (error) {
      console.warn('Firebase connection issue. Falling back to local data.', error);
      return false;
    }
  }
  
  /**
   * Load all weapons from Firestore
   * @returns {Promise<Array>} Array of weapon objects
   */
  async getWeapons() {
    try {
      const isConnected = await this.checkConnection();
      
      if (isConnected) {
        const weaponsCollection = collection(db, 'weapons');
        const weaponsQuery = query(weaponsCollection, orderBy('name'));
        const snapshot = await getDocs(weaponsQuery);
        
        if (!snapshot.empty) {
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }
      }
      
      // Fall back to local data
      console.log('Using fallback weapons data');
      return weaponsData;
    } catch (error) {
      console.error('Error loading weapons:', error);
      return weaponsData;
    }
  }
  
  /**
   * Get a single weapon by ID
   * @param {string} weaponId The weapon ID
   * @returns {Promise<Object>} The weapon object
   */
  async getWeaponById(weaponId) {
    try {
      const isConnected = await this.checkConnection();
      
      if (isConnected) {
        const weaponRef = doc(db, 'weapons', weaponId);
        const weaponSnap = await getDoc(weaponRef);
        
        if (weaponSnap.exists()) {
          return {
            id: weaponSnap.id,
            ...weaponSnap.data()
          };
        }
      }
      
      // Fall back to local data
      return weaponsData.find(w => w.id === weaponId);
    } catch (error) {
      console.error('Error loading weapon by ID:', error);
      return weaponsData.find(w => w.id === weaponId);
    }
  }
  
  /**
   * Get all attachments for a weapon
   * @param {string} weaponId The weapon ID
   * @returns {Promise<Array>} Array of compatible attachments
   */
  async getAttachmentsForWeapon(weaponId) {
    try {
      const isConnected = await this.checkConnection();
      
      if (isConnected) {
        const attachmentsCollection = collection(db, 'attachments');
        const attachmentsQuery = query(
          attachmentsCollection,
          where('compatibleSlots', 'array-contains-any', 
            [`barrel_${weaponId}`, `muzzle_${weaponId}`, `stock_${weaponId}`, 
             `grip_${weaponId}`, `sight_${weaponId}`, `underbarrel_${weaponId}`,
             `handguard_${weaponId}`, `magazine_${weaponId}`, `mount_${weaponId}`, 
             `receiver_${weaponId}`, `bolt_${weaponId}`, `gasblock_${weaponId}`])
        );
        
        const snapshot = await getDocs(attachmentsQuery);
        
        if (!snapshot.empty) {
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }
      }
      
      // Fall back to local data
      return attachmentsData.filter(attachment => 
        attachment.compatibleSlots.some(slot => 
          slot.startsWith(weaponId.toString())
        )
      );
    } catch (error) {
      console.error('Error loading attachments for weapon:', error);
      return attachmentsData.filter(attachment => 
        attachment.compatibleSlots.some(slot => 
          slot.startsWith(weaponId.toString())
        )
      );
    }
  }
  
  /**
   * Get attachment slots for a weapon
   * @param {string} weaponId The weapon ID
   * @returns {Promise<Array>} Array of attachment slots
   */
  async getAttachmentSlots(weaponId) {
    try {
      const isConnected = await this.checkConnection();
      
      if (isConnected) {
        // Try to fetch from a separate collection if you have it
        const slotsCollection = collection(db, 'attachmentSlots');
        const slotsQuery = query(
          slotsCollection,
          where('weaponId', '==', weaponId)
        );
        
        const snapshot = await getDocs(slotsQuery);
        
        if (!snapshot.empty) {
          // Assuming each document has a slots array
          const slotsDoc = snapshot.docs[0];
          return slotsDoc.data().slots || [];
        }
        
        // Alternatively, get from the weapon document
        const weaponRef = doc(db, 'weapons', weaponId);
        const weaponSnap = await getDoc(weaponRef);
        
        if (weaponSnap.exists() && weaponSnap.data().attachmentSlots) {
          return weaponSnap.data().attachmentSlots;
        }
      }
      
      // Fall back to local data
      return attachmentSlotsData[weaponId] || [];
    } catch (error) {
      console.error('Error loading attachment slots:', error);
      return attachmentSlotsData[weaponId] || [];
    }
  }
  
  /**
   * Save a weapon configuration
   * @param {Object} config The configuration to save
   * @param {boolean} saveLocally Whether to save locally or to Firebase
   * @returns {Promise<Object>} The saved configuration with ID
   */
  async saveConfiguration(config, saveLocally = false) {
    if (saveLocally) {
      return this.saveConfigurationLocally(config);
    }
    
    try {
      const isConnected = await this.checkConnection();
      
      if (isConnected) {
        // Add timestamp and ensure proper structure
        const configToSave = {
          ...config,
          createdAt: serverTimestamp()
        };
        
        const configRef = await addDoc(collection(db, 'savedConfigs'), configToSave);
        
        return {
          id: configRef.id,
          ...configToSave,
          createdAt: new Date().toISOString() // Convert timestamp for immediate use
        };
      }
      
      // Fall back to local storage if Firebase not available
      return this.saveConfigurationLocally(config);
    } catch (error) {
      console.error('Error saving configuration:', error);
      return this.saveConfigurationLocally(config);
    }
  }
  
  /**
   * Save configuration to local storage
   * @param {Object} config The configuration to save
   * @returns {Object} The saved configuration with ID
   */
  saveConfigurationLocally(config) {
    try {
      const configData = {
        id: `local_${Date.now()}`,
        ...config,
        createdAt: new Date().toISOString(),
        isLocal: true
      };
      
      // Get existing configs from localStorage
      const existingConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
      
      // Add new config
      existingConfigs.push(configData);
      
      // Save back to localStorage
      localStorage.setItem('savedConfigs', JSON.stringify(existingConfigs));
      
      return configData;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }
  
  /**
   * Get saved configurations for a weapon
   * @param {string} weaponId The weapon ID
   * @param {boolean} includeLocal Whether to include locally saved configs
   * @returns {Promise<Array>} Array of saved configurations
   */
  async getSavedConfigurations(weaponId, includeLocal = true) {
    try {
      let configs = [];
      const isConnected = await this.checkConnection();
      
      if (isConnected) {
        // Get from Firebase
        const configsCollection = collection(db, 'savedConfigs');
        const configsQuery = query(
          configsCollection,
          where('weaponId', '==', weaponId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(configsQuery);
        
        if (!snapshot.empty) {
          configs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
          }));
        }
      }
      
      // Include local configs if requested
      if (includeLocal) {
        try {
          const localConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
          const filteredLocalConfigs = localConfigs.filter(
            c => c.weaponId === weaponId && c.isLocal
          );
          
          configs = [...configs, ...filteredLocalConfigs];
        } catch (localErr) {
          console.warn('Error loading local configs:', localErr);
        }
      }
      
      return configs;
    } catch (error) {
      console.error('Error loading saved configurations:', error);
      
      // Fall back to local storage
      try {
        const localConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
        return localConfigs.filter(c => c.weaponId === weaponId);
      } catch (localErr) {
        console.warn('Error loading local configs:', localErr);
        return [];
      }
    }
  }
  
  /**
   * Delete a saved configuration
   * @param {string} configId The configuration ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteConfiguration(configId) {
    // Check if this is a local config
    if (configId.startsWith('local_')) {
      return this.deleteLocalConfiguration(configId);
    }
    
    try {
      const isConnected = await this.checkConnection();
      
      if (isConnected) {
        await deleteDoc(doc(db, 'savedConfigs', configId));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting configuration:', error);
      return false;
    }
  }
  
  /**
   * Delete a configuration from local storage
   * @param {string} configId The configuration ID
   * @returns {boolean} Success status
   */
  deleteLocalConfiguration(configId) {
    try {
      const existingConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
      const updatedConfigs = existingConfigs.filter(config => config.id !== configId);
      localStorage.setItem('savedConfigs', JSON.stringify(updatedConfigs));
      return true;
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
      return false;
    }
  }
  
  /**
   * Upload a file to Firebase Storage
   * @param {File} file The file to upload
   * @param {string} path Storage path
   * @param {Function} progressCallback Optional callback for upload progress
   * @returns {Promise<string>} The download URL
   */
  async uploadFile(file, path, progressCallback = null) {
    try {
      const isConnected = await this.checkConnection();
      
      if (!isConnected) {
        throw new Error('Firebase not available');
      }
      
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (progressCallback) progressCallback(progress);
          },
          (error) => {
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  
  /**
   * Delete a file from Firebase Storage
   * @param {string} url The file URL
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(url) {
    try {
      const isConnected = await this.checkConnection();
      
      if (!isConnected) {
        return false;
      }
      
      // Extract file path from URL
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/');
      const fileName = parts.pop();
      const folderPath = parts.pop();
      const filePath = `${folderPath}/${fileName}`;
      
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
  
  /**
   * Save a new weapon to Firestore
   * @param {Object} weaponData The weapon data
   * @returns {Promise<Object>} The saved weapon with ID
   */
  async saveWeapon(weaponData) {
    try {
      const isConnected = await this.checkConnection();
      
      if (!isConnected) {
        throw new Error('Firebase not available');
      }
      
      const weaponRef = await addDoc(collection(db, 'weapons'), weaponData);
      
      return {
        id: weaponRef.id,
        ...weaponData
      };
    } catch (error) {
      console.error('Error saving weapon:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing weapon
   * @param {string} weaponId The weapon ID
   * @param {Object} weaponData The updated weapon data
   * @returns {Promise<boolean>} Success status
   */
  async updateWeapon(weaponId, weaponData) {
    try {
      const isConnected = await this.checkConnection();
      
      if (!isConnected) {
        throw new Error('Firebase not available');
      }
      
      const weaponRef = doc(db, 'weapons', weaponId);
      await updateDoc(weaponRef, weaponData);
      
      return true;
    } catch (error) {
      console.error('Error updating weapon:', error);
      throw error;
    }
  }
  
  /**
   * Save a new attachment to Firestore
   * @param {Object} attachmentData The attachment data
   * @returns {Promise<Object>} The saved attachment with ID
   */
  async saveAttachment(attachmentData) {
    try {
      const isConnected = await this.checkConnection();
      
      if (!isConnected) {
        throw new Error('Firebase not available');
      }
      
      const attachmentRef = await addDoc(collection(db, 'attachments'), attachmentData);
      
      return {
        id: attachmentRef.id,
        ...attachmentData
      };
    } catch (error) {
      console.error('Error saving attachment:', error);
      throw error;
    }
  }
}

// Import necessary Firestore functions
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Create a singleton instance
const firebaseService = new FirebaseService();

export default firebaseService;