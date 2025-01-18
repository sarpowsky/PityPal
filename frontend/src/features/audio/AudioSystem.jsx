/* Path: frontend/src/features/audio/AudioSystem.jsx */
import React, { createContext, useContext, useState } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [muted, setMuted] = useState(false);

  const playAudio = (soundId) => {
    if (muted) return;
    // Audio implementation will go here
    console.log('Playing sound:', soundId);
  };

  return (
    <AudioContext.Provider value={{ playAudio, muted, setMuted }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);