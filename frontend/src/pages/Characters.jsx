import React, { useState } from 'react';
import { Search, Filter, Star, Sword, Shield, Heart } from 'lucide-react';

const FilterButton = ({ active, label, count }) => (
  <button
    className={`px-4 py-2 rounded-xl transition-all duration-300
              ${active 
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-purple-500/50' 
                : 'bg-white/5 hover:bg-white/10 border-white/10'}
              border backdrop-blur-sm`}
  >
    <span className={active ? 'text-white' : 'text-white/60'}>{label}</span>
    {count > 0 && (
      <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-xs">
        {count}
      </span>
    )}
  </button>
);

const CharacterCard = ({ character, index, onClick }) => {
  const rarityGradient = character.rarity === 5 
    ? 'from-amber-400/20 to-yellow-500/20' 
    : 'from-purple-400/20 to-violet-500/20';

  return (
    <div 
      className="group relative animate-fadeIn cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onClick(character)}
    >
      <div className={`relative rounded-xl overflow-hidden aspect-[4/5]
                    bg-gradient-to-br ${rarityGradient} backdrop-blur-sm
                    border border-white/10 transition-all duration-300
                    group-hover:scale-105 group-hover:border-white/20`}>
        {/* Character Image */}
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Character Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1 mb-1">
            {[...Array(character.rarity)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                className="fill-current text-amber-400" 
              />
            ))}
          </div>
          <h3 className="text-sm font-genshin leading-tight mb-1">
            {character.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <div className="flex items-center gap-1">
              <img 
                src={`/elements/${character.element.toLowerCase()}.svg`}
                alt={character.element}
                className="w-3 h-3"
              />
              <span>{character.element}</span>
            </div>
            <span>•</span>
            <span>{character.weaponType}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {[
            { icon: Sword, value: character.baseAtk },
            { icon: Shield, value: character.baseDef },
            { icon: Heart, value: character.baseHp }
          ].map(({ icon: Icon, value }, i) => (
            <div key={i} className="p-1.5 rounded-lg bg-black/30 backdrop-blur-sm
                                text-xs flex items-center gap-1">
              <Icon size={12} />
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Characters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState('all');
  const [characters] = useState([
    {
      id: 1,
      name: "Kaedehara Kazuha",
      element: "Anemo",
      weaponType: "Sword",
      rarity: 5,
      baseAtk: 297,
      baseDef: 807,
      baseHp: 13348,
      image: "/characters/kazuha.jpg"
    }
    // Add more characters...
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="space-y-6">
        <h1 className="text-2xl font-genshin bg-gradient-to-r from-indigo-300 
                     via-purple-300 to-pink-300 text-transparent bg-clip-text">
          Characters
        </h1>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" 
              size={18} 
            />
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
          <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 
                         border border-white/10 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        {/* Element Filters */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Pyro', 'Hydro', 'Anemo', 'Electro', 'Dendro', 'Cryo', 'Geo'].map(element => (
            <FilterButton
              key={element}
              active={selectedElement === element.toLowerCase()}
              label={element}
              count={characters.filter(c => 
                element === 'All' ? true : c.element === element
              ).length}
            />
          ))}
        </div>
      </header>

      {/* Character Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {characters.map((character, index) => (
          <CharacterCard
            key={character.id}
            character={character}
            index={index}
            onClick={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default Characters;