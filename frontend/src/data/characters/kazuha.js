// src/data/characters/kazuha.js
export const kazuha = {
    id: 'kazuha',
    name: 'Kaedehara Kazuha',
    element: 'Anemo',
    weaponType: 'Sword',
    rarity: 5,
    weapons: [
      {
        id: 'freedom-sworn',
        name: 'Freedom-Sworn',
        rarity: 5,
        description: 'Best in slot for support build, provides team-wide buffs',
        stats: ['High base ATK', 'EM substat']
      },
      {
        id: 'iron-sting',
        name: 'Iron Sting',
        rarity: 4,
        description: 'F2P option, craftable weapon with EM substat',
        stats: ['Good base ATK', 'EM substat']
      },
      {
        id: 'sacrificial-sword',
        name: 'Sacrificial Sword',
        rarity: 4,
        description: 'Good option for better skill uptime',
        stats: ['ER% substat', 'Skill reset passive']
      }
    ],
    preview: '/characters/kazuha/preview.webp',
    icon: '/characters/kazuha/icon.webp',
    
    teams: [
      {
        name: 'International',
        characters: ['Kazuha', 'Xiangling', 'Bennett', 'Tartaglia'],
        description: 'High damage vaporize team with strong AoE capabilities'
      },
      {
        name: 'Freeze Comp',
        characters: ['Ayaka', 'Kazuha', 'Kokomi', 'Shenhe'],
        description: 'Perma-freeze team with high burst damage'
      },
      {
        name: 'Mono Pyro',
        characters: ['Kazuha', 'Xiangling', 'Bennett', 'Dehya'],
        description: 'Pure Pyro damage team with strong buffs'
      },
      {
        name: 'Taser',
        characters: ['Kazuha', 'Fischl', 'Xingqiu', 'Beidou'],
        description: 'Electro-charged focused team with high AoE damage'
      }
    ],
  
    artifacts: [
      {
        id: 'viridescent',
        name: 'Viridescent Venerer (4pc)',
        description: 'Best in slot for support Kazuha, provides elemental resistance shred and damage bonus',
        stats: [
          'EM/EM/EM for maximum elemental buff',
          'ER% substats (160-180% ER recommended)',
          'Crit Rate/DMG if using personal damage build'
        ]
      },
      {
        id: 'wanderers',
        name: 'Wanderer\'s Troupe (2pc) + VV (2pc)',
        description: 'Alternative build focusing on personal damage',
        stats: [
          'ATK%/Anemo DMG/Crit',
          'Crit Rate/DMG substats prioritized',
          'EM and ER% as secondary stats'
        ]
      }
    ]
  };