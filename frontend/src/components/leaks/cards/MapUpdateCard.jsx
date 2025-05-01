// Path: src/components/leaks/cards/MapUpdateCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Maximize } from 'lucide-react';
import SafeImage from '../../../components/SafeImage';

const MapUpdateCard = ({ update, index, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 h-full
               hover:border-white/30 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <h4 className="text-sm font-medium mb-2">{update.title}</h4>
      <p className="text-xs text-white/70 mb-3">{update.description}</p>
      {update.image && (
        <div className="relative rounded-lg overflow-hidden">
          <SafeImage
            src={update.image}
            alt={update.title}
            className="w-full h-48 object-cover"
            fallbackSrc="/images/maps/placeholder.png"
          />
          
          {/* Maximize icon in top right */}
          <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 
                        opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize size={14} className="text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MapUpdateCard;