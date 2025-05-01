// Path: src/components/leaks/details/QuestDetailContent.jsx
import React from 'react';
import { BookOpen } from 'lucide-react';
import SafeImage from '../../../components/SafeImage';

const QuestDetailContent = ({ quest }) => {
  return (
    <div className="space-y-4">
      {quest.image && (
        <div className="relative h-48 rounded-lg overflow-hidden">
          <SafeImage
            src={quest.image}
            alt={quest.title}
            className="w-full h-full object-cover"
            fallbackSrc="/images/quests/placeholder.png"
          />
        </div>
      )}
      
      <div className="p-4 rounded-lg bg-black/30 border border-white/10">
        <h3 className="font-genshin text-xl mb-2">{quest.title}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          {quest.questType && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
              <BookOpen size={16} className="text-indigo-400" />
              <span>{quest.questType}</span>
            </div>
          )}
          
          {quest.chapter && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <BookOpen size={16} className="text-purple-400" />
              <span>{quest.chapter}</span>
            </div>
          )}
        </div>
        
        {quest.description && (
          <p className="text-white/70">{quest.description}</p>
        )}
      </div>
    </div>
  );
};

export default QuestDetailContent;