// Path: frontend/src/services/wishSimulatorService.js

/**
 * A service for simulating wishes with accurate rates and pity mechanics
 */

// Base rates for different banner types
const RATES = {
  character: {
    base5StarRate: 0.006, // 0.6%
    base4StarRate: 0.051, // 5.1%
    softPity5Start: 74,
    hardPity5: 90,
    softPity4Start: 8,
    hardPity4: 10,
    featuredChance5Star: 0.5, // 50% chance for featured 5★
    featuredChance4Star: 0.5,  // 50% chance for featured 4★
    capturingRadianceChance: 0.1 // 10% chance after losing 50/50
  },
  weapon: {
    base5StarRate: 0.007, // 0.7%
    base4StarRate: 0.060, // 6.0%
    softPity5Start: 63,
    hardPity5: 80,
    softPity4Start: 7,
    hardPity4: 10,
    featuredChance5Star: 0.75, // 75% chance for featured 5★
    featuredChance4Star: 0.75  // 75% chance for featured 4★
  },
  standard: {
    base5StarRate: 0.006, // 0.6%
    base4StarRate: 0.051, // 5.1%
    softPity5Start: 74,
    hardPity5: 90,
    softPity4Start: 8,
    hardPity4: 10
  }
};

// Standard 5★ characters in the permanent pool
const STANDARD_5_STARS = [
{ name: "Diluc", type: "Character", rarity: 5, element: "Pyro" },
{ name: "Jean", type: "Character", rarity: 5, element: "Anemo" },
{ name: "Keqing", type: "Character", rarity: 5, element: "Electro" },
{ name: "Mona", type: "Character", rarity: 5, element: "Hydro" },
{ name: "Qiqi", type: "Character", rarity: 5, element: "Cryo" },
{ name: "Tighnari", type: "Character", rarity: 5, element: "Dendro" },
{ name: "Dehya", type: "Character", rarity: 5, element: "Pyro" }
];

// Standard 4★ characters
const STANDARD_4_STARS = [
{ name: "4★ Character", type: "Character", rarity: 4 }
];

// Standard 4★ weapons
const STANDARD_4_WEAPONS = [
{ name: "4★ Weapon", type: "Weapon", rarity: 4 }
];

// Standard 3★ weapons
const STANDARD_3_WEAPONS = [
{ name: "3★ Weapon", type: "Weapon", rarity: 3 }
];

// Standard 5★ weapons
const STANDARD_5_WEAPONS = [
{ name: "5★ Weapon", type: "Weapon", rarity: 5 }
];

/**
* Get the appropriate rate config for a banner type
*/
function getBannerRates(bannerType) {
  if (bannerType.startsWith('character')) {
    return RATES.character;
  } else if (bannerType === 'weapon') {
    return RATES.weapon;
  } else {
    return RATES.standard;
  }
}

/**
* Calculate the probability of getting a 5★ based on current pity
*/
function calculate5StarProbability(pity, bannerType) {
  const rates = getBannerRates(bannerType);

  // Hard pity
  if (pity >= rates.hardPity5) {
    return 1.0;
  }

  // Soft pity - increases rate significantly
  if (pity >= rates.softPity5Start) {
    // Each pull in soft pity zone increases rate by about 7%
    const softPityPulls = pity - rates.softPity5Start + 1;
    const softPityBoost = softPityPulls * 0.07;
    return Math.min(rates.base5StarRate + softPityBoost, 1.0);
  }

  // Base rate
  return rates.base5StarRate;
}

/**
* Calculate the probability of getting a 4★ based on current 4★ pity
*/
function calculate4StarProbability(pity4, bannerType) {
  const rates = getBannerRates(bannerType);

  // Hard pity for 4★
  if (pity4 >= rates.hardPity4) {
    return 1.0;
  }

  // Soft pity for 4★
  if (pity4 >= rates.softPity4Start) {
    const softPityPulls = pity4 - rates.softPity4Start + 1;
    const softPityBoost = softPityPulls * 0.2;
    return Math.min(rates.base4StarRate + softPityBoost, 1.0);
  }

  // Base rate
  return rates.base4StarRate;
}

/**
* Simulate a single wish
*/
function simulateWish(simulationState, banner) {
  const {
    pity5,
    pity4,
    guaranteed5Star,
    guaranteed4Star,
    bannerType
  } = simulationState;

  const rates = getBannerRates(bannerType);

  // Calculate probabilities
  const prob5Star = calculate5StarProbability(pity5, bannerType);
  const prob4Star = calculate4StarProbability(pity4, bannerType);

  // Roll for rarity
  const random = Math.random();
  let result;
  let isLostFiftyFifty = false;
  let isCapturingRadiance = false;

  // Updates to pity counters
  let newPity5 = pity5 + 1;
  let newPity4 = pity4 + 1;
  let newGuaranteed5Star = guaranteed5Star;
  let newGuaranteed4Star = guaranteed4Star;

  // FIXED LOGIC: Check for 4★ hard pity first (guaranteed at exactly 10 pulls)
  if (pity4 >= rates.hardPity4 - 1) { // -1 because we're already incrementing pity
    // Give a 4★
    newPity4 = 0; // Reset 4★ pity
    
    // For character and weapon banners, check if it's featured or standard
    if (bannerType.startsWith('character') || bannerType === 'weapon') {
      if (guaranteed4Star || Math.random() < rates.featuredChance4Star) {
        // Featured 4★
        const featured4Stars = banner.featured4Stars;
        const selected = featured4Stars && featured4Stars.length > 0 
          ? featured4Stars[Math.floor(Math.random() * featured4Stars.length)]
          : STANDARD_4_STARS[0]; // Fallback if no featured 4★ defined
        result = {
          ...selected,
          id: `sim-${Date.now()}-${Math.random()}`
        };
        newGuaranteed4Star = false;
      } else {
        // Standard 4★ (50/50 character vs weapon)
        const pool = Math.random() < 0.5 ? STANDARD_4_STARS : STANDARD_4_WEAPONS;
        const randomStandard = pool[Math.floor(Math.random() * pool.length)];
        result = {
          ...randomStandard,
          id: `sim-${Date.now()}-${Math.random()}`
        };
        newGuaranteed4Star = true;
      }
    } else {
      // Standard banner - 50/50 character vs weapon
      const pool = Math.random() < 0.5 ? STANDARD_4_STARS : STANDARD_4_WEAPONS;
      const randomStandard = pool[Math.floor(Math.random() * pool.length)];
      result = {
        ...randomStandard,
        id: `sim-${Date.now()}-${Math.random()}`
      };
    }
  }
  // Check for 5★
  else if (random < prob5Star) {
    // Reset 5★ pity
    newPity5 = 0;
    
    // For character and weapon banners, check if it's featured or standard
    if (bannerType.startsWith('character')) {
      // Check if guaranteed or win 50/50
      if (guaranteed5Star || Math.random() < rates.featuredChance5Star) {
        // Featured 5★ character
        result = {
          ...banner.featured5Star,
          id: `sim-${Date.now()}-${Math.random()}`
        };
        newGuaranteed5Star = false;
      } else {
        // Lost 50/50, check for Capturing Radiance (10% chance)
        if (Math.random() < rates.capturingRadianceChance) {
          // Capturing Radiance triggered - get featured character anyway
          result = {
            ...banner.featured5Star,
            id: `sim-${Date.now()}-${Math.random()}`,
            isCapturingRadiance: true // Flag for special animation
          };
          newGuaranteed5Star = false;
          isCapturingRadiance = true;
        } else {
          // Truly lost 50/50, get standard 5★ character
          const randomStandard = STANDARD_5_STARS[Math.floor(Math.random() * STANDARD_5_STARS.length)];
          result = {
            ...randomStandard,
            id: `sim-${Date.now()}-${Math.random()}`
          };
          newGuaranteed5Star = true; // Next 5★ is guaranteed to be featured
          isLostFiftyFifty = true;
        }
      }
    } else if (bannerType === 'weapon') {
      // Weapon banner logic - 75% for featured
      if (guaranteed5Star || Math.random() < rates.featuredChance5Star) {
        // Featured 5★ weapon - randomly select one of the two
        const featuredWeapons = banner.featured5Star;
        const selected = featuredWeapons[Math.floor(Math.random() * featuredWeapons.length)];
        result = {
          ...selected,
          id: `sim-${Date.now()}-${Math.random()}`
        };
        newGuaranteed5Star = false;
      } else {
        // Standard 5★ weapon
        const randomStandard = STANDARD_5_WEAPONS[Math.floor(Math.random() * STANDARD_5_WEAPONS.length)];
        result = {
          ...randomStandard,
          id: `sim-${Date.now()}-${Math.random()}`
        };
        newGuaranteed5Star = true;
        isLostFiftyFifty = true;
      }
    } else {
      // Standard banner - 50/50 character vs weapon
      const pool = Math.random() < 0.5 ? STANDARD_5_STARS : STANDARD_5_WEAPONS;
      const randomStandard = pool[Math.floor(Math.random() * pool.length)];
      result = {
        ...randomStandard,
        id: `sim-${Date.now()}-${Math.random()}`
      };
    }
  } 
  // Check for 4★ (with normal probability)
  else if (random < prob5Star + prob4Star) {
    // Reset 4★ pity
    newPity4 = 0;
    
    // For character and weapon banners, check if it's featured or standard
    if (bannerType.startsWith('character') || bannerType === 'weapon') {
      if (guaranteed4Star || Math.random() < rates.featuredChance4Star) {
        // Featured 4★
        const featured4Stars = banner.featured4Stars;
        const selected = featured4Stars && featured4Stars.length > 0 
          ? featured4Stars[Math.floor(Math.random() * featured4Stars.length)]
          : STANDARD_4_STARS[0]; // Fallback if no featured 4★ defined
        result = {
          ...selected,
          id: `sim-${Date.now()}-${Math.random()}`
        };
        newGuaranteed4Star = false;
      } else {
        // Standard 4★ (50/50 character vs weapon)
        const pool = Math.random() < 0.5 ? STANDARD_4_STARS : STANDARD_4_WEAPONS;
        const randomStandard = pool[Math.floor(Math.random() * pool.length)];
        result = {
          ...randomStandard,
          id: `sim-${Date.now()}-${Math.random()}`
        };
        newGuaranteed4Star = true;
      }
    } else {
      // Standard banner - 50/50 character vs weapon
      const pool = Math.random() < 0.5 ? STANDARD_4_STARS : STANDARD_4_WEAPONS;
      const randomStandard = pool[Math.floor(Math.random() * pool.length)];
      result = {
        ...randomStandard,
        id: `sim-${Date.now()}-${Math.random()}`
      };
    }
  }
  // 3★ result (always a weapon)
  else {
    // Select random 3★ weapon
    const random3Star = STANDARD_3_WEAPONS[Math.floor(Math.random() * STANDARD_3_WEAPONS.length)];
    result = {
      ...random3Star,
      id: `sim-${Date.now()}-${Math.random()}`
    };
  }

  // Add isLostFiftyFifty flag if needed
  if (isLostFiftyFifty) {
    result.isLostFiftyFifty = true;
  }
  
  // Add isCapturingRadiance flag if needed
  if (isCapturingRadiance) {
    result.isCapturingRadiance = true;
  }

  // Return result and updated state
  return {
    result,
    newState: {
      pity5: newPity5,
      pity4: newPity4,
      guaranteed5Star: newGuaranteed5Star,
      guaranteed4Star: newGuaranteed4Star,
      bannerType
    }
  };
}

/**
* Simulate a 10-pull
*/
function simulateTenPull(simulationState, banner) {
  const results = [];
  let currentState = { ...simulationState };

  for (let i = 0; i < 10; i++) {
    const { result, newState } = simulateWish(currentState, banner);
    results.push(result);
    currentState = newState;
  }

  return {
    results,
    newState: currentState
  };
}

/**
* Format a banner object for simulation
*/
function formatBanner(banner) {
  // For character banner
  if (banner.character) {
    return {
      id: banner.id,
      name: banner.name,
      bannerType: banner.id.includes('-2') ? 'character-2' : 'character-1', // Determine banner type from ID
      featured5Star: {
        name: banner.character,
        type: 'Character',
        rarity: 5,
        element: banner.element || 'Unknown'
      },
      featured4Stars: (banner.fourStars || []).map(name => ({
        name,
        type: 'Character',
        rarity: 4,
        element: 'Unknown' // Would need a character database to determine this
      }))
    };
  }
  // For weapon banner
  else if (banner.weapons) {
    return {
      id: banner.id,
      name: banner.name,
      bannerType: 'weapon',
      featured5Star: banner.weapons.map(name => ({
        name,
        type: 'Weapon',
        rarity: 5,
        weaponType: 'Unknown' // Would need a weapon database for this
      })),
      featured4Stars: (banner.fourStars || []).map(name => ({
        name,
        type: 'Weapon',
        rarity: 4,
        weaponType: 'Unknown'
      }))
    };
  }
  // Standard banner
  else {
    return {
      id: banner.id,
      name: banner.name,
      bannerType: 'permanent'
    };
  }
}

/**
* Initialize a new simulation state
*/
function createNewSimulationState(bannerType) {
  return {
    pity5: 0,
    pity4: 0,
    guaranteed5Star: false,
    guaranteed4Star: false,
    bannerType,
    history: []
  };
}

// Export functions
export {
  simulateWish,
  simulateTenPull,
  formatBanner,
  createNewSimulationState
};