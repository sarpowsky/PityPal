// src/data/characters/index.js
import { kazuha } from './kazuha';
import { raiden } from './raiden';

// Debug log to check if characters are being imported
console.log('Imported characters:', { kazuha, raiden });

export const characters = [
  kazuha,
  raiden,
].filter(Boolean); // Filter out any undefined entries

export const getCharactersByElement = (element) => {
  return characters.filter(char => char.element.toLowerCase() === element.toLowerCase());
};

export const getCharacterById = (id) => {
  return characters.find(char => char.id === id);
};