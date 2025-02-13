import React from 'react';
import { X, Star, ScrollText } from 'lucide-react';

const TeamComp = ({ team }) => (
  <div className="p-2.5 rounded-lg bg-black/20 border border-white/10 space-y-1.5">
    <h4 className="text-sm font-medium text-white/90">{team.name}</h4>
    <div className="flex items-center gap-1.5">
      {team.characters.map((char, index) => (
        <div key={index} className="relative group">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20">
            <img
              src={`/characters/${char.toLowerCase().replace(/\s+/g, '-')}.webp`}
              alt={char}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/characters/placeholder.webp';
              }}
            />
          </div>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 
                       rounded bg-black/90 text-xs whitespace-nowrap opacity-0 
                       group-hover:opacity-100 transition-opacity">
            {char}
          </div>
        </div>
      ))}
    </div>
    <p className="text-xs text-white/60 leading-tight">{team.description}</p>
  </div>
);

const WeaponItem = ({ weapon }) => (
  <div className="p-2.5 rounded-lg bg-black/20 border border-white/10">
    <div className="flex items-start gap-2">
      <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 shrink-0">
        <img
          src={`/weapons/${weapon.id}.webp`}
          alt={weapon.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/weapons/placeholder.webp';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-medium text-white/90 truncate">{weapon.name}</h4>
          <div className="flex items-center gap-0.5 shrink-0">
            {[...Array(weapon.rarity)].map((_, i) => (
              <Star key={i} size={10} className="fill-current text-amber-400" />
            ))}
          </div>
        </div>
        <p className="text-xs text-white/60 mt-1 leading-tight">{weapon.description}</p>
      </div>
    </div>
  </div>
);

const ArtifactSet = ({ set }) => (
  <div className="p-2.5 rounded-lg bg-black/20 border border-white/10">
    <div className="flex items-start gap-2">
      <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 shrink-0">
        <img
          src={`/artifacts/${set.id}.webp`}
          alt={set.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/artifacts/placeholder.webp';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white/90">{set.name}</h4>
        <p className="text-xs text-white/60 mt-1 leading-tight">{set.description}</p>
        {set.stats && (
          <div className="mt-1.5 space-y-0.5">
            {set.stats.map((stat, index) => (
              <div key={index} className="text-xs text-white/70 flex items-center gap-1 leading-tight">
                <div className="w-1 h-1 rounded-full bg-white/20 shrink-0" />
                <span>{stat}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const CharacterDetails = ({ character, onClose }) => {
  if (!character) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 
                flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-gradient-to-b from-gray-900/95 
                to-black/95 rounded-2xl border border-white/10 shadow-xl 
                animate-fadeIn overflow-hidden"
      >
        <div className="flex gap-6 p-6">
          {/* Left Column - Character Preview */}
          <div className="w-[280px] shrink-0">
            <div className="relative w-[280px] h-[420px] rounded-xl overflow-hidden
                       border border-white/10">
              <img
                src={character.preview}
                alt={character.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3
                           bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                <h2 className="text-xl font-genshin">{character.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {[...Array(character.rarity)].map((_, i) => (
                      <Star key={i} size={14} className="fill-current text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm text-white/60">{character.weaponType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Weapons Section */}
            {character.weapons && character.weapons.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                  Recommended Weapons
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {character.weapons.map((weapon, index) => (
                    <WeaponItem key={index} weapon={weapon} />
                  ))}
                </div>
              </div>
            )}

            {/* Teams Section */}
            {character.teams && character.teams.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                  Recommended Teams
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {character.teams.map((team, index) => (
                    <TeamComp key={index} team={team} />
                  ))}
                </div>
              </div>
            )}

            {/* Artifacts Section */}
            {character.artifacts && character.artifacts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                  Recommended Artifacts
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {character.artifacts.map((set, index) => (
                    <ArtifactSet key={index} set={set} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 
                   backdrop-blur-sm hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default CharacterDetails;