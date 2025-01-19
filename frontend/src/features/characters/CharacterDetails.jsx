// src/features/characters/CharacterDetails.jsx
import React, { useState, useEffect } from 'react';
import { X, Star, Sword, Shield, Heart, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { elementIcons } from '../../data/assets';

const StatBlock = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
    <div className="p-1.5 rounded-lg bg-white/10">
      <Icon size={16} />
    </div>
    <div>
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  </div>
);

const MaterialItem = ({ material }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
      <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20">
        {!imageError ? (
          <img 
            src={material.image} 
            alt={material.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-white/10 flex items-center justify-center">
            <AlertTriangle size={16} className="text-white/40" />
          </div>
        )}
      </div>
      <div>
        <div className="text-sm">{material.name}</div>
        <div className="text-xs text-white/60">{material.type}</div>
      </div>
    </div>
  );
};

const TeamComp = ({ team }) => (
  <div className="rounded-lg bg-white/5 p-3">
    <h4 className="text-sm font-medium mb-2">{team.name}</h4>
    <div className="flex items-center gap-2 mb-2">
      {team.characters.map((char, index) => (
        <div key={index} className="w-8 h-8 rounded-lg bg-black/20 overflow-hidden">
          <img 
            src={`/characters/${char.toLowerCase()}.png`} 
            alt={char}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/characters/placeholder.png';
            }}
          />
        </div>
      ))}
    </div>
    <p className="text-xs text-white/60">{team.description}</p>
  </div>
);

const CharacterDetails = ({ character, onClose }) => {
  const { state } = useApp();
  const [loading, setLoading] = useState(true);
  const [characterData, setCharacterData] = useState(null);

  useEffect(() => {
    const loadCharacterData = async () => {
      try {
        setLoading(true);
        // Find character in wish history for constellation count
        const wishes = state.wishes.history.filter(w => w.name === character.name);
        const constellations = wishes.length;
        
        setCharacterData({
          ...character,
          constellations,
          wishes: wishes.slice(0, 3) // Last 3 wishes
        });
      } catch (error) {
        console.error('Failed to load character data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (character) {
      loadCharacterData();
    }
  }, [character, state.wishes.history]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 
                    flex items-center justify-center">
        <div className="w-full max-w-4xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-white/5 rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-white/5 rounded-lg" />
              <div className="h-24 bg-white/5 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!characterData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 
                  flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-gray-900/95 
                    to-black/95 rounded-2xl border border-white/10 shadow-xl 
                    animate-fadeIn overflow-hidden">
        {/* Header */}
        <div className="relative h-48">
          <img 
            src={characterData.splashArt || characterData.image} 
            alt={characterData.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/characters/placeholder-splash.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 
                       via-transparent to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 
                     backdrop-blur-sm hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-4 left-4">
            <h2 className="text-2xl font-genshin">{characterData.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <img 
                src={elementIcons[characterData.element.toLowerCase()]}
                alt={characterData.element}
                className="w-5 h-5"
              />
              <div className="flex items-center gap-1">
                {[...Array(characterData.rarity)].map((_, i) => (
                  <Star key={i} size={16} className="fill-current text-amber-400" />
                ))}
              </div>
              {characterData.constellations > 0 && (
                <div className="px-2 py-0.5 rounded-full bg-purple-500/20 text-xs">
                  C{characterData.constellations}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-medium text-white/60 uppercase 
                           tracking-wider mb-3">
                  Base Stats
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <StatBlock 
                    icon={Sword} 
                    label="Base ATK" 
                    value={characterData.baseStats.atk} 
                  />
                  <StatBlock 
                    icon={Shield} 
                    label="Base DEF" 
                    value={characterData.baseStats.def} 
                  />
                  <StatBlock 
                    icon={Heart} 
                    label="Base HP" 
                    value={characterData.baseStats.hp} 
                  />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-medium text-white/60 uppercase 
                           tracking-wider mb-3">
                  Ascension Materials
                </h3>
                <div className="space-y-2">
                  {characterData.ascensionMaterials.map((material, index) => (
                    <MaterialItem key={index} material={material} />
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-medium text-white/60 uppercase 
                           tracking-wider mb-3">
                  Recommended Build
                </h3>
                <div className="rounded-lg bg-white/5 p-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Artifacts</h4>
                    <ul className="space-y-1 text-sm text-white/80">
                      {characterData.build.artifacts.map((artifact, index) => (
                        <li key={index}>{artifact}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Weapons</h4>
                    <ul className="space-y-1 text-sm text-white/80">
                      {characterData.build.weapons.map((weapon, index) => (
                        <li key={index}>{weapon}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {characterData.teams && (
                <section>
                  <h3 className="text-sm font-medium text-white/60 uppercase 
                             tracking-wider mb-3">
                    Team Compositions
                  </h3>
                  <div className="space-y-2">
                    {characterData.teams.map((team, index) => (
                      <TeamComp key={index} team={team} />
                    ))}
                  </div>
                </section>
              )}

              {characterData.wishes.length > 0 && (
                <section>
                  <h3 className="text-sm font-medium text-white/60 uppercase 
                             tracking-wider mb-3">
                    Recent Pulls
                  </h3>
                  <div className="space-y-2">
                    {characterData.wishes.map((wish) => (
                      <div key={wish.id} 
                           className="flex items-center justify-between p-2 
                                    rounded-lg bg-white/5 text-sm">
                        <span>
                          {new Date(wish.time).toLocaleDateString()}
                        </span>
                        <span className="text-white/60">
                          Pity #{wish.pity || '?'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetails;