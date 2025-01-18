import React from 'react';

const Background = ({ children }) => {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0">
          <img 
            src="/backgrounds/main-bg.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>
      </div>
      <div className="relative z-0">{children}</div>
    </div>
  );
};

export default Background;