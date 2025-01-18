// Path: frontend/src/data/characters.js
export const characters = [
    {
      id: 1,
      name: "Kaedehara Kazuha",
      element: "Anemo",
      weaponType: "Sword",
      rarity: 5,
      baseStats: {
        atk: 297,
        def: 807,
        hp: 13348
      },
      ascensionMaterials: [
        {
          name: "Vayuda Turquoise",
          type: "Gem",
          image: "/materials/vayuda-turquoise.png"
        },
        // Add more materials
      ],
      build: {
        artifacts: [
          "Viridescent Venerer (4pc)",
          "Wanderer's Troupe (2pc) + Viridescent Venerer (2pc)"
        ],
        weapons: [
          "Freedom-Sworn",
          "Iron Sting",
          "Sacrificial Sword"
        ]
      },
      teams: [
        {
          name: "International",
          characters: ["Kazuha", "Xiangling", "Bennett", "Tartaglia"],
          description: "High damage vaporize team with strong AoE capabilities"
        }
      ],
      image: "/characters/kazuha.png",
      splashArt: "/characters/kazuha-splash.png"
    }
    // Add more characters
  ];
  
  // Helper functions for character data
  export const getCharactersByElement = (element) => {
    return characters.filter(char => char.element.toLowerCase() === element.toLowerCase());
  };
  
  export const getCharacterById = (id) => {
    return characters.find(char => char.id === id);
  };