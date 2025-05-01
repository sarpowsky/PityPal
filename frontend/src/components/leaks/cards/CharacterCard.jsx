// Path: src/components/leaks/cards/CharacterCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Maximize } from 'lucide-react';
import SafeImage from '../../../components/SafeImage';

const CharacterCard = ({ character, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden
               hover:border-white/30 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] bg-gradient-to-b from-indigo-900/50 to-purple-900/50">
        <SafeImage
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover"
          fallbackSrc="/images/characters/placeholder.png"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <h3 className="text-sm font-medium">{character.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <img 
              src={`/elements/${character.element?.toLowerCase() || 'anemo'}.svg`}
              alt={character.element || 'Element'}
              className="w-3 h-3"
            />
            <span className="text-xs text-white/80">{character.rarity}★ {character.weapon}</span>
          </div>
        </div>
        
        {/* Maximize icon in top right */}
        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 
                      opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize size={14} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default CharacterCard;