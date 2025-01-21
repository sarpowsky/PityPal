// Path: frontend/src/pages/Characters.jsx
import React, { useState } from 'react';
import { Search, Filter, Star, Sword, Shield, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { characters } from '../data/characters';
import { elementIcons, rarityBackgrounds } from '../data/assets';
import CharacterDetails from '../features/characters/CharacterDetails';

const FilterButton = ({ active, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-sm transition-all
              ${active 
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-purple-500/50' 
                : 'bg-white/5 hover:bg-white/10 border-white/10'}
              border backdrop-blur-sm`}
  >
    <span className={active ? 'text-white' : 'text-white/60'}>{label}</span>
    {count > 0 && (
      <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/10 text-xs">
        {count}
      </span>
    )}
  </button>
);

const CharacterCard = ({ character, index, onClick }) => {
  const rarityGradient = rarityBackgrounds[character.rarity];

  return (
    <div 
      className="group relative animate-fadeIn cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onClick(character)}
    >
      <div className={`relative rounded-lg overflow-hidden aspect-square
                    bg-gradient-to-br ${rarityGradient} backdrop-blur-sm
                    border border-white/10 transition-all duration-300
                    group-hover:scale-105 group-hover:border-white/20`}>
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="flex items-center gap-1">
            {[...Array(character.rarity)].map((_, i) => (
              <Star key={i} size={10} className="fill-current text-amber-400" />
            ))}
          </div>
          <h3 className="text-xs font-medium leading-tight truncate mt-0.5">
            {character.name}
          </h3>
        </div>

        {/* Element Icon */}
        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full
                    bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <img 
            src={elementIcons[character.element.toLowerCase()]}
            alt={character.element}
            className="w-4 h-4"
          />
        </div>

        {/* Weapon Type */}
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded 
                     bg-black/30 backdrop-blur-sm text-[10px]">
          {character.weaponType}
        </div>
      </div>
    </div>
  );
};

const Characters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState('all');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const { state } = useApp();

  const filteredCharacters = characters.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesElement = selectedElement === 'all' || 
                          char.element.toLowerCase() === selectedElement.toLowerCase();
    return matchesSearch && matchesElement;
  });

  const elements = ['All', 'Pyro', 'Hydro', 'Anemo', 'Electro', 'Dendro', 'Cryo', 'Geo'];

  return (
    <div className="min-h-screen pb-32">
      <div className="space-y-4 animate-fadeIn">
        <header className="space-y-4">
          <h1 className="text-2xl font-genshin bg-gradient-to-r from-indigo-300 
                       via-purple-300 to-pink-300 text-transparent bg-clip-text">
            Characters
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 max-w-md relative">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" 
                size={16} 
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search characters..."
                className="w-full pl-9 pr-4 py-2 rounded-lg
                       bg-white/5 backdrop-blur-sm border border-white/10
                       text-sm text-white placeholder-white/40
                       focus:outline-none focus:border-white/20
                       transition-colors"
              />
            </div>
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 
                           border border-white/10 transition-colors">
              <Filter size={18} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {elements.map(element => (
              <FilterButton
                key={element}
                active={selectedElement === element.toLowerCase()}
                label={element}
                count={characters.filter(c => 
                  element === 'All' ? true : c.element === element
                ).length}
                onClick={() => setSelectedElement(element.toLowerCase())}
              />
            ))}
          </div>
        </header>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
          {filteredCharacters.map((character, index) => (
            <CharacterCard
              key={character.id}
              character={character}
              index={index}
              onClick={() => setSelectedCharacter(character)}
            />
          ))}
        </div>

        {selectedCharacter && (
          <CharacterDetails 
            character={selectedCharacter} 
            onClose={() => setSelectedCharacter(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default Characters;