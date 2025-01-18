/* Path: frontend/src/features/characters/CharacterGrid.jsx */
import React, { useState } from 'react';
import { Search, Star } from 'lucide-react';

const CharacterCard = ({ character, onClick }) => {
  const getRarityGradient = (rarity) => {
    switch (rarity) {
      case 5:
        return 'from-amber-300 via-yellow-300 to-amber-400';
      case 4:
        return 'from-purple-300 via-violet-400 to-purple-500';
      default:
        return 'from-blue-300 via-cyan-400 to-blue-500';
    }
  };

  return (
    <div
      onClick={() => onClick(character)}
      className="group relative cursor-pointer"
    >
      <div className="relative rounded-xl overflow-hidden aspect-square 
                    shadow-lg transition-transform duration-300 ease-out
                    group-hover:scale-105">
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Character Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            {[...Array(character.rarity)].map((_, i) => (
              <Star key={i} size={12} className="fill-current text-amber-400" />
            ))}
          </div>
          <h3 className="text-sm font-medium leading-tight">{character.name}</h3>
          <p className="text-xs text-white/70">{character.weaponType}</p>
        </div>

        {/* Element Icon */}
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full
                      bg-gradient-to-br from-black/30 to-black/50 backdrop-blur-sm
                      flex items-center justify-center">
          <img 
            src={`/elements/${character.element.toLowerCase()}.svg`}
            alt={character.element}
            className="w-5 h-5"
          />
        </div>
      </div>

      {/* Glow Effect */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                    transition-opacity duration-300 -z-10 blur-md
                    bg-gradient-to-r ${getRarityGradient(character.rarity)}`} />
    </div>
  );
};

const CharacterGrid = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [characters] = useState([
    {
      id: 1,
      name: "Kaedehara Kazuha",
      rarity: 5,
      weaponType: "Sword",
      element: "Anemo",
      image: "/characters/kazuha.jpg"
    },
    // Add more characters
  ]);

  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search characters..."
          className="w-full pl-10 pr-4 py-2 rounded-xl
                   bg-white/5 backdrop-blur-sm border border-white/10
                   text-sm text-white placeholder-white/40
                   focus:outline-none focus:border-white/20
                   transition-colors"
        />
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {filteredCharacters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            onClick={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default CharacterGrid;