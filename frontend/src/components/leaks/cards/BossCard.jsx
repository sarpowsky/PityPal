// Path: src/components/leaks/cards/BossCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Maximize, Skull } from 'lucide-react';
import SafeImage from '../../../components/SafeImage';

const BossCard = ({ boss, index, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden
               hover:border-white/30 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-32">
        <SafeImage
          src={boss.image}
          alt={boss.name}
          className="w-full h-full object-cover"
          fallbackSrc="/images/bosses/placeholder.png"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <h3 className="text-sm font-medium">{boss.name}</h3>
          {boss.type && (
            <div className="flex items-center gap-1 mt-1 text-xs text-white/80">
              <Skull size={12} />
              <span>{boss.type}</span>
            </div>
          )}
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

export default BossCard;