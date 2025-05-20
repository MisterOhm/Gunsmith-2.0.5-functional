import React from 'react';

const CategoryFilters = ({ filters, onFilterChange }) => {
  // Custom styles for the component
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      margin: '15px 0',
      gap: '20px'
    },
    filterItem: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer'
    },
    checkbox: {
      marginRight: '8px',
      appearance: 'none',
      width: '16px',
      height: '16px',
      border: '1px solid #666',
      borderRadius: '3px',
      backgroundColor: '#222',
      position: 'relative',
      cursor: 'pointer'
    },
    checkedBox: {
      backgroundColor: '#444',
      '&::after': {
        content: "''",
        position: 'absolute',
        width: '10px',
        height: '10px',
        top: '2px',
        left: '2px',
        backgroundColor: '#aaa',
        borderRadius: '2px'
      }
    },
    label: {
      fontSize: '0.9rem',
      color: '#ccc'
    }
  };

  const handleFilterClick = (filterName) => {
    onFilterChange(filterName, !filters[filterName]);
  };

  return (
    <div style={styles.container} className="category-filters">
      <div 
        style={styles.filterItem} 
        className="filter-item"
        onClick={() => handleFilterClick('vitalParts')}
      >
        <input 
          type="checkbox" 
          checked={filters.vitalParts} 
          onChange={() => {}} // Handled by the onClick on the parent div
          style={{
            ...styles.checkbox,
            ...(filters.vitalParts ? styles.checkedBox : {})
          }}
          className="filter-checkbox"
        />
        <span style={styles.label}>Vital parts</span>
      </div>
      
      <div 
        style={styles.filterItem} 
        className="filter-item"
        onClick={() => handleFilterClick('functionalMods')}
      >
        <input 
          type="checkbox" 
          checked={filters.functionalMods} 
          onChange={() => {}} // Handled by the onClick on the parent div
          style={{
            ...styles.checkbox,
            ...(filters.functionalMods ? styles.checkedBox : {})
          }}
          className="filter-checkbox"
        />
        <span style={styles.label}>Functional mods</span>
      </div>
      
      <div 
        style={styles.filterItem} 
        className="filter-item"
        onClick={() => handleFilterClick('equipmentParts')}
      >
        <input 
          type="checkbox" 
          checked={filters.equipmentParts} 
          onChange={() => {}} // Handled by the onClick on the parent div
          style={{
            ...styles.checkbox,
            ...(filters.equipmentParts ? styles.checkedBox : {})
          }}
          className="filter-checkbox"
        />
        <span style={styles.label}>Equipment parts</span>
      </div>
    </div>
  );
};

export default CategoryFilters;