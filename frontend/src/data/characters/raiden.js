// src/data/characters/raiden.js
export const raiden = {
    id: 'raiden',
    name: 'Raiden Shogun',
    element: 'Electro',
    weaponType: 'Polearm',
    rarity: 5,
    preview: '/characters/raiden/preview.gif',
    
    teams: [
      {
        name: 'Raiden National',
        characters: ['Raiden', 'Xiangling', 'Xingqiu', 'Bennett'],
        description: 'High damage team utilizing Raiden\'s burst to battery the team'
      },
      {
        name: 'Raiden Hypercarry',
        characters: ['Raiden', 'Sara', 'Kazuha', 'Bennett'],
        description: 'Focused on maximizing Raiden\'s burst damage'
      },
      {
        name: 'Eula Superconduct',
        characters: ['Raiden', 'Eula', 'Rosaria', 'Bennett'],
        description: 'Physical DPS team with Superconduct reactions'
      },
      {
        name: 'Raiden Double Hydro',
        characters: ['Raiden', 'Yelan', 'Xingqiu', 'Kazuha'],
        description: 'High single-target damage with strong energy generation'
      }
    ],
  
    artifacts: [
      {
        id: 'emblem',
        name: 'Emblem of Severed Fate (4pc)',
        description: 'Best in slot for both support and DPS Raiden, provides Energy Recharge and Burst DMG',
        stats: [
          'ER% or ATK% Sands (aim for 250-270% ER)',
          'ATK% or Electro DMG Goblet',
          'Crit Rate/DMG Circlet',
          'Focus on Crit Rate/DMG, ATK%, ER% substats'
        ]
      },
      {
        id: 'thundering-noblesse',
        name: 'Thundering Fury (2pc) + Noblesse Oblige (2pc)',
        description: 'Alternative build for pure burst damage',
        stats: [
          'ATK% Sands',
          'Electro DMG Goblet',
          'Crit Rate/DMG Circlet',
          'Look for ER% in substats (200-220% target)'
        ]
      }
    ]
  };