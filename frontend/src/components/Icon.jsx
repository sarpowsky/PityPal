// src/components/Icon.jsx
import React from 'react';

const Icon = ({ name, size = 24, className = '', ...props }) => {
  return (
    <img
      src={`/icons/${name}.png`}
      alt={name}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        display: 'block'
      }}
      className={className}
      {...props}
    />
  );
};

export default Icon;