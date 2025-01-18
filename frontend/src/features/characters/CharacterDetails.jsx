/* Path: frontend/src/features/characters/CharacterDetails.jsx */
import React from 'react';
import { X, Star, Sword, Shield, Zap } from 'lucide-react';

const StatBlock = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
    <div className="p-1.5 rounded-lg bg-white/10">
      <Icon size={16} />
    </div>
    <div className="flex-1">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  </div>
);

const MaterialItem = ({ item }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
    <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
    <div className="flex-1">
      <div className="text-sm">{item.name}</div>
      <div className="text-xs text-white/60">{item.type}</div>
    </div>
    <div className="text-sm font-medium text-white/80">{item.amount}×</div>
  </div>
);

const CharacterDetails = ({ character, onClose }) => {
  if (!character) return null;

  return (
    <div className="relative w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl
                  bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-md
                  border border-white/10 shadow-xl animate-fadeIn">
      {/* Header with character splash art */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
        <img 
          src={character.splashArt || character.image} 
          alt={character.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm
                   hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Character name and rarity */}
        <div className="absolute bottom-4 left-4">
          <h2 className="text-2xl font-genshin">{character.name}</h2>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(character.rarity)].map((_, i) => (
              <Star key={i} size={16} className="fill-current text-amber-400" />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[calc(80vh-12rem)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Stats */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Stats</h3>
              <div className="grid grid-cols-2 gap-2">
                <StatBlock icon={Sword} label="Base ATK" value="342" />
                <StatBlock icon={Shield} label="Base DEF" value="791" />
                <StatBlock icon={Zap} label="Energy Cost" value="60" />
                <StatBlock icon={Sword} label="Crit Rate" value="5%" />
              </div>
            </section>

            {/* Ascension Materials */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                Ascension Materials
              </h3>
              <div className="space-y-2">
                {character.ascensionMaterials?.map((material, index) => (
                  <MaterialItem key={index} item={material} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Build */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                Recommended Build
              </h3>
              <div className="rounded-lg bg-white/5 p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Artifacts</h4>
                  <ul className="space-y-1 text-sm text-white/80">
                    {character.build?.artifacts.map((artifact, index) => (
                      <li key={index}>{artifact}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Weapons</h4>
                  <ul className="space-y-1 text-sm text-white/80">
                    {character.build?.weapons.map((weapon, index) => (
                      <li key={index}>{weapon}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Team Suggestions */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                Team Compositions
              </h3>
              <div className="space-y-2">
                {character.teams?.map((team, index) => (
                  <div key={index} className="rounded-lg bg-white/5 p-3">
                    <div className="flex items-center gap-2">
                      {team.characters.map((char, charIndex) => (
                        <img 
                          key={charIndex}
                          src={char.image} 
                          alt={char.name}
                          className="w-10 h-10 rounded-lg object-cover"
                          title={char.name}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-white/60 mt-2">{team.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetails;