import React, { useState, useEffect } from 'react';

const AttachmentSelector = ({ 
  availableAttachments, 
  equippedAttachments, 
  onAttachmentSelect, 
  activeFilters,
  attachmentSlots
}) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filteredAttachments, setFilteredAttachments] = useState([]);
  
  // Custom styles
  const styles = {
    container: {
      color: '#e0e0e0'
    },
    slotSection: {
      marginBottom: '20px'
    },
    sectionTitle: {
      fontSize: '1.1rem',
      marginBottom: '10px',
      borderBottom: '1px solid #444',
      paddingBottom: '5px'
    },
    slotList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    slotItem: {
      padding: '8px 10px',
      backgroundColor: '#252525',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'background-color 0.2s'
    },
    slotItemSelected: {
      backgroundColor: '#353535',
      borderLeft: '3px solid #666'
    },
    slotName: {
      fontSize: '0.9rem'
    },
    slotEquipped: {
      fontSize: '0.8rem',
      color: '#999',
      display: 'flex',
      alignItems: 'center'
    },
    slotEmpty: {
      fontSize: '0.8rem',
      color: '#666'
    },
    removeBtn: {
      marginLeft: '5px',
      backgroundColor: '#444',
      color: '#ccc',
      border: 'none',
      borderRadius: '3px',
      width: '18px',
      height: '18px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '10px',
      cursor: 'pointer'
    },
    attachmentsSection: {
      marginTop: '20px'
    },
    attachmentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px',
      marginTop: '10px'
    },
    attachmentItem: {
      backgroundColor: '#252525',
      borderRadius: '4px',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
      transition: 'transform 0.1s, background-color 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        backgroundColor: '#353535'
      }
    },
    attachmentItemSelected: {
      backgroundColor: '#353535',
      borderLeft: '3px solid #666'
    },
    attachmentImage: {
      width: '100%',
      height: '60px',
      backgroundColor: '#333',
      marginBottom: '8px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '3px'
    },
    attachmentName: {
      fontSize: '0.9rem',
      marginBottom: '5px'
    },
    attachmentStats: {
      fontSize: '0.7rem',
      color: '#999'
    },
    statModifier: {
      marginBottom: '2px',
      display: 'flex',
      justifyContent: 'space-between'
    },
    positiveValue: {
      color: '#4a9'
    },
    negativeValue: {
      color: '#e55'
    },
    noAttachments: {
      padding: '15px',
      textAlign: 'center',
      color: '#777',
      fontSize: '0.9rem'
    },
    noSlotSelected: {
      padding: '15px',
      textAlign: 'center',
      color: '#777',
      fontSize: '0.9rem'
    }
  };
  
  // Filter attachments based on selected slot and active filters
  useEffect(() => {
    if (!selectedSlot || !availableAttachments.length) {
      setFilteredAttachments([]);
      return;
    }
    
    // Filter attachments based on the slot and category filters
    let filtered = availableAttachments.filter(attachment => 
      attachment.compatibleSlots.includes(selectedSlot)
    );
    
    // Apply category filters
    if (!activeFilters.vitalParts) {
      filtered = filtered.filter(a => a.category !== 'vital');
    }
    
    if (!activeFilters.functionalMods) {
      filtered = filtered.filter(a => a.category !== 'functional');
    }
    
    if (!activeFilters.equipmentParts) {
      filtered = filtered.filter(a => a.category !== 'equipment');
    }
    
    setFilteredAttachments(filtered);
  }, [selectedSlot, availableAttachments, activeFilters]);
  
  // Set the first slot as selected by default when slots change
  useEffect(() => {
    if (attachmentSlots && attachmentSlots.length > 0 && !selectedSlot) {
      setSelectedSlot(attachmentSlots[0].id);
    }
  }, [attachmentSlots, selectedSlot]);
  
  // Handle slot selection
  const handleSlotSelect = (slotId) => {
    setSelectedSlot(slotId);
  };
  
  // Handle attachment selection
  const handleAttachmentSelect = (attachment) => {
    if (!selectedSlot) return;
    
    // If the same attachment is clicked again, remove it (toggle behavior)
    if (equippedAttachments[selectedSlot]?.id === attachment.id) {
      onAttachmentSelect(selectedSlot, null);
    } else {
      onAttachmentSelect(selectedSlot, attachment);
    }
  };
  
  // Handle removing an attachment
  const handleRemoveAttachment = (e, slotId) => {
    e.stopPropagation();
    onAttachmentSelect(slotId, null);
  };
  
  // Format stat name
  const formatStatName = (stat) => {
    switch (stat) {
      case 'muzzleVelocity':
        return 'Muzzle Velocity';
      case 'verticalRecoil':
        return 'Vertical Recoil';
      case 'horizontalRecoil':
        return 'Horizontal Recoil';
      case 'effectiveDistance':
        return 'Effective Distance';
      case 'sightingRange':
        return 'Sighting Range';
      case 'ergonomics':
        return 'Ergonomics';
      case 'durability':
        return 'Durability';
      default:
        return stat.charAt(0).toUpperCase() + stat.slice(1);
    }
  };
  
  // Format stat value
  const formatStatValue = (stat, value) => {
    if (stat === 'weight') {
      return `${value > 0 ? '+' : ''}${value} kg`;
    }
    return value > 0 ? `+${value}` : value;
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.slotSection}>
        <h3 style={styles.sectionTitle}>Attachment Slots</h3>
        <div style={styles.slotList}>
          {attachmentSlots.map(slot => (
            <div 
              key={slot.id}
              style={{
                ...styles.slotItem,
                ...(selectedSlot === slot.id ? styles.slotItemSelected : {})
              }}
              onClick={() => handleSlotSelect(slot.id)}
            >
              <div style={styles.slotName}>{slot.name}</div>
              {equippedAttachments[slot.id] ? (
                <div style={styles.slotEquipped}>
                  {equippedAttachments[slot.id].name}
                  <button 
                    style={styles.removeBtn}
                    onClick={(e) => handleRemoveAttachment(e, slot.id)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={styles.slotEmpty}>NONE</div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div style={styles.attachmentsSection}>
        <h3 style={styles.sectionTitle}>Available Attachments</h3>
        {selectedSlot ? (
          <div style={styles.attachmentGrid}>
            {filteredAttachments.length > 0 ? (
              filteredAttachments.map(attachment => (
                <div 
                  key={attachment.id}
                  style={{
                    ...styles.attachmentItem,
                    ...(equippedAttachments[selectedSlot]?.id === attachment.id 
                      ? styles.attachmentItemSelected 
                      : {})
                  }}
                  onClick={() => handleAttachmentSelect(attachment)}
                >
                  <div style={styles.attachmentImage}>
                    {/* Placeholder for attachment image */}
                    {attachment.type.charAt(0).toUpperCase() + attachment.type.slice(1)}
                  </div>
                  <div style={styles.attachmentName}>{attachment.name}</div>
                  <div style={styles.attachmentStats}>
                    {attachment.statModifiers.map((modifier, index) => (
                      <div key={index} style={styles.statModifier}>
                        <span>{formatStatName(modifier.stat)}</span>
                        <span style={modifier.value > 0 ? styles.positiveValue : styles.negativeValue}>
                          {formatStatValue(modifier.stat, modifier.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.noAttachments}>
                No compatible attachments found for this slot.
              </div>
            )}
          </div>
        ) : (
          <div style={styles.noSlotSelected}>
            Select an attachment slot to see compatible attachments.
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentSelector;