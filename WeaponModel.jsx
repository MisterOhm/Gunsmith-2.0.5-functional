import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Center, Text } from '@react-three/drei';
import * as THREE from 'three';

// Fallback model when 3D model isn't available
const FallbackWeaponModel = ({ weaponId, highlightedSlot }) => {
  const colors = {
    '1': '#555555',
    '2': '#776655',
    '3': '#556677'
  };
  
  const weaponColor = colors[weaponId] || '#555555';
  const weaponName = weaponId === '1' ? 'HK 416A5' : 
                    weaponId === '2' ? 'AK-74M' : 
                    weaponId === '3' ? 'M4A1' : 'Unknown Weapon';
  
  return (
    <group>
      {/* Main body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.1, 2]} />
        <meshStandardMaterial 
          color={weaponColor} 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Barrel */}
      <mesh castShadow receiveShadow position={[0, 0, 1.2]}>
        <boxGeometry args={[0.08, 0.08, 1.2]} />
        <meshStandardMaterial 
          color={weaponColor} 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Stock */}
      <mesh castShadow receiveShadow position={[0, 0, -1]}>
        <boxGeometry args={[0.3, 0.1, 0.8]} />
        <meshStandardMaterial 
          color={weaponColor} 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Weapon name */}
      <Text
        position={[0, 0.12, 0]}
        color="white"
        fontSize={0.08}
        anchorX="center"
        anchorY="middle"
        material-toneMapped={false}
        renderOrder={1}
      >
        {weaponName}
      </Text>
    </group>
  );
};

// Simplified attachment model component 
const SimpleAttachmentModel = ({ slotId, attachment, weaponId }) => {
  // Get attachment position based on slot ID and weapon type
  function getAttachmentPosition() {
    const slotType = slotId.split('_')[0];
    const weaponSpecificPositions = {
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
      '2': {
        barrel: [0, 0, 1.7],
        muzzle: [0, 0, 2.0],
        stock: [0, 0, -1.4],
        grip: [0, -0.3, -0.25],
        sight: [0, 0.18, 0.2],
        underbarrel: [0, -0.2, 0.7],
        handguard: [0, 0, 0.6],
        magazine: [0, -0.45, 0.15],
        mount: [0, 0.15, 0.5],
        receiver: [0, 0.05, -0.2]
      },
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
        receiver: [0, 0.06, -0.25]
      }
    };
    
    const positions = weaponSpecificPositions[weaponId] || weaponSpecificPositions['1'];
    return positions[slotType] || [0, 0, 0];
  }
  
  function getAttachmentColor(type) {
    switch(type) {
      case 'muzzle': return '#888888';
      case 'barrel': return '#777777';
      case 'stock': return '#666666';
      case 'grip': return '#999999';
      case 'sight': return '#333333';
      case 'underbarrel': return '#AAAAAA';
      case 'handguard': return '#444444';
      case 'magazine': return '#555555';
      default: return '#777777';
    }
  }
  
  function getAttachmentSize(type) {
    switch(type) {
      case 'muzzle': return [0.12, 0.12, 0.3];
      case 'barrel': return [0.1, 0.1, 0.6];
      case 'stock': return [0.3, 0.12, 0.7];
      case 'grip': return [0.1, 0.2, 0.1];
      case 'sight': return [0.2, 0.12, 0.15];
      case 'underbarrel': return [0.1, 0.15, 0.3];
      case 'handguard': return [0.2, 0.15, 0.5];
      case 'magazine': return [0.12, 0.5, 0.2];
      default: return [0.1, 0.1, 0.1];
    }
  }
  
  const position = getAttachmentPosition();
  const color = getAttachmentColor(attachment.type);
  const size = getAttachmentSize(attachment.type);
  
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Special effects for certain attachment types */}
      {attachment.type === 'sight' && (
        <mesh position={[0, 0.07, 0]} castShadow>
          <boxGeometry args={[0.12, 0.02, 0.04]} />
          <meshStandardMaterial 
            color="#111111" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#ff3333"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
};

// Main WeaponModel component
const WeaponModel = ({ 
  weaponId, 
  attachments = {}, 
  updateAttachmentPointPosition, 
  highlightedSlot,
  viewMode = 'standard',
  showEffects = true,
  onLoadSuccess = null,
  onLoadError = null
}) => {
  const groupRef = useRef();
  const [rotationSpeed] = useState(0.0005);
  const [loadError, setLoadError] = useState(true); // Set to true to force using fallback model
  const [attachmentRefs] = useState({});
  
  // Setup attachment points
  useEffect(() => {
    if (updateAttachmentPointPosition) {
      // Define attachment points based on weapon ID
      const attachmentPoints = [
        { slotId: `barrel_${weaponId}`, position: [0, 0, 1.8] },
        { slotId: `muzzle_${weaponId}`, position: [0, 0, 2.1] },
        { slotId: `stock_${weaponId}`, position: [0, 0, -1.5] },
        { slotId: `grip_${weaponId}`, position: [0, -0.35, -0.3] },
        { slotId: `sight_${weaponId}`, position: [0, 0.15, 0.3] },
        { slotId: `underbarrel_${weaponId}`, position: [0, -0.15, 0.8] },
        { slotId: `handguard_${weaponId}`, position: [0, 0, 0.7] },
        { slotId: `magazine_${weaponId}`, position: [0, -0.5, 0.2] },
        { slotId: `mount_${weaponId}`, position: [0, 0.15, 0.6] },
        { slotId: `receiver_${weaponId}`, position: [0, 0.05, -0.3] }
      ];
      
      // Update position data for each attachment point
      attachmentPoints.forEach(point => {
        const position = new THREE.Vector3(...point.position);
        const quaternion = new THREE.Quaternion();
        updateAttachmentPointPosition(point.slotId, { position, quaternion });
      });
    }
  }, [weaponId, updateAttachmentPointPosition]);
  
  // Rotation animation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <ambientLight intensity={0.5} />
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={1} 
        castShadow
      />
      
      {/* Dynamic accent lights */}
      {showEffects && (
        <>
          <spotLight
            position={[3, 3, 3]}
            angle={0.3}
            penumbra={0.8}
            intensity={1.5}
            color="#00b4ff"
            distance={10}
            castShadow
          />
          <spotLight
            position={[-3, 2, -3]}
            angle={0.5}
            penumbra={0.5}
            intensity={1}
            color="#ffaa00"
            distance={10}
            castShadow
          />
        </>
      )}
      
      <Center>
        <FallbackWeaponModel 
          weaponId={weaponId} 
          highlightedSlot={highlightedSlot}
        />
      </Center>
      
      {/* Render attached attachments */}
      {Object.entries(attachments).map(([slotId, attachment]) => {
        if (!attachment) return null;
        
        return (
          <SimpleAttachmentModel 
            key={slotId}
            slotId={slotId}
            attachment={attachment}
            weaponId={weaponId}
          />
        );
      })}
    </group>
  );
};

export default WeaponModel;