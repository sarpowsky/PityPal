// src/components/Icon.jsx
import React from 'react';

const Icon = ({ name, size = 24, className = '', ...props }) => {
  return (
    <img
      src={`/icons/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
};

export default Icon;