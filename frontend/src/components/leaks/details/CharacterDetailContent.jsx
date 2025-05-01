// Path: src/components/leaks/details/CharacterDetailContent.jsx
import React from 'react';
import SafeImage from '../../../components/SafeImage';

const CharacterDetailContent = ({ character }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Image and basic info */}
      <div className="space-y-4">
        <div className="relative max-h-80 rounded-lg overflow-hidden bg-gradient-to-b from-indigo-900/50 to-purple-900/50">
          <SafeImage
            src={character.image}
            alt={character.name}
            className="w-full h-full object-contain"
            fallbackSrc="/images/characters/placeholder.png"
          />
        </div>
        
        <div className="p-4 rounded-lg bg-black/30 border border-white/10">
          <h3 className="font-genshin text-xl mb-2 flex items-center gap-2">
            <span>{character.name}</span>
            <div className="flex items-center">
              {[...Array(character.rarity)].map((_, i) => (
                <span key={i} className="text-amber-400">★</span>
              ))}
            </div>
          </h3>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <img 
                src={`/elements/${character.element?.toLowerCase() || 'anemo'}.svg`}
                alt={character.element || 'Element'}
                className="w-5 h-5"
              />
              <span>{character.element}</span>
            </div>
            
            <div className="text-white/80">
              <span>{character.weapon}</span>
            </div>
          </div>
          
          <p className="text-white/70 text-sm">{character.description}</p>
        </div>
      </div>
      
      {/* Abilities and materials */}
      <div className="space-y-4">
        {character.abilities && (
          <div className="p-4 rounded-lg bg-black/30 border border-white/10">
            <h3 className="font-medium mb-3">Talents</h3>
            
            <div className="space-y-3">
              <div className="p-2 rounded-lg bg-black/20 border border-white/10">
                <div className="font-medium text-sm text-indigo-400">Normal Attack</div>
                <div className="text-sm">{character.abilities.normal}</div>
              </div>
              
              <div className="p-2 rounded-lg bg-black/20 border border-white/10">
                <div className="font-medium text-sm text-indigo-400">Elemental Skill</div>
                <div className="text-sm">{character.abilities.skill}</div>
              </div>
              
              <div className="p-2 rounded-lg bg-black/20 border border-white/10">
                <div className="font-medium text-sm text-indigo-400">Elemental Burst</div>
                <div className="text-sm">{character.abilities.burst}</div>
              </div>
              
              {character.abilities.passive && (
                <div className="p-2 rounded-lg bg-black/20 border border-white/10">
                  <div className="font-medium text-sm text-indigo-400">Passive Talents</div>
                  <ul className="text-sm mt-1 space-y-1">
                    {character.abilities.passive.map((passive, idx) => (
                      <li key={idx} className="list-disc list-inside text-white/80">{passive}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        {character.materials && (
          <div className="p-4 rounded-lg bg-black/30 border border-white/10">
            <h3 className="font-medium mb-3">Ascension Materials</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 rounded-lg bg-black/20 border border-white/10">
                <div className="font-medium text-sm text-amber-400">Boss Material</div>
                <div className="text-sm">{character.materials.boss}</div>
              </div>
              
              <div className="p-2 rounded-lg bg-black/20 border border-white/10">
                <div className="font-medium text-sm text-green-400">Local Specialty</div>
                <div className="text-sm">{character.materials.local}</div>
              </div>
              
              <div className="p-2 rounded-lg bg-black/20 border border-white/10">
                <div className="font-medium text-sm text-purple-400">Talent Books</div>
                <div className="text-sm">{character.materials.books}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterDetailContent;