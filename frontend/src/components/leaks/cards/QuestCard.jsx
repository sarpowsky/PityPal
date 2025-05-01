// Path: src/components/leaks/cards/QuestCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Maximize } from 'lucide-react';

const QuestCard = ({ quest, index, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10
               hover:border-white/30 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/20 shrink-0">
          <BookOpen size={18} className="text-indigo-400" />
        </div>
        
        <div>
          <h4 className="text-sm font-medium">{quest.title}</h4>
          {quest.questType && quest.chapter && (
            <div className="flex items-center gap-1 mt-1 text-xs text-white/80">
              <span>{quest.questType}</span>
              <span>•</span>
              <span>{quest.chapter}</span>
            </div>
          )}
        </div>
        
        {/* Maximize icon */}
        <div className="p-1.5 rounded-full bg-black/50 ml-auto
                      opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize size={14} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default QuestCard;