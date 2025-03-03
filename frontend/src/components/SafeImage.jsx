// Path: frontend/src/components/SafeImage.jsx
import React, { useState } from 'react';

const SafeImage = ({ 
  src, 
  alt, 
  fallbackSrc = '/images/placeholder.png',
  className = '',
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`${className} ${hasError ? 'opacity-60' : ''}`}
      onError={handleError}
      {...props}
    />
  );
};

export default SafeImage;