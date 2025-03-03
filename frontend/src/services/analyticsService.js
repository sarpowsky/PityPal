// Path: frontend/src/services/analyticsService.js
/**
 * Service for advanced analytics calculations and data processing
 */
export const calculatePullDistribution = (wishes) => {
    if (!wishes || wishes.length === 0) return { fiveStars: [], fourStars: [] };
  
    // Group wishes by pity
    const fiveStarPities = {};
    const fourStarPities = {};
    
    // Process each banner type separately
    const bannerGroups = {};
    
    wishes.forEach(wish => {
      // Group by banner type for separate pity tracking
      const bannerKey = wish.bannerType.startsWith('character') 
        ? 'character' 
        : wish.bannerType;
        
      if (!bannerGroups[bannerKey]) {
        bannerGroups[bannerKey] = [];
      }
      
      bannerGroups[bannerKey].push(wish);
    });
    
    // Process each banner group
    Object.entries(bannerGroups).forEach(([bannerType, bannerWishes]) => {
      // Sort by time for accurate pity calculation
      bannerWishes.sort((a, b) => new Date(a.time) - new Date(b.time));
      
      let pity5 = 0;
      let pity4 = 0;
      
      bannerWishes.forEach(wish => {
        pity5++;
        pity4++;
        
        if (wish.rarity === 5) {
          // Record 5★ pity
          fiveStarPities[pity5] = (fiveStarPities[pity5] || 0) + 1;
          pity5 = 0;
        } else if (wish.rarity === 4) {
          // Record 4★ pity
          fourStarPities[pity4] = (fourStarPities[pity4] || 0) + 1;
          pity4 = 0;
        }
      });
    });
    
    // Convert to array format for charts
    const fiveStars = Object.entries(fiveStarPities)
      .map(([pity, count]) => ({ pity: parseInt(pity), count }))
      .sort((a, b) => a.pity - b.pity);
      
    const fourStars = Object.entries(fourStarPities)
      .map(([pity, count]) => ({ pity: parseInt(pity), count }))
      .sort((a, b) => a.pity - b.pity);
    
    return { fiveStars, fourStars };
  };
  
  export const calculateRateComparison = (wishes) => {
    if (!wishes || wishes.length === 0) {
      return {
        actual: { fiveStar: 0, fourStar: 0 },
        expected: { fiveStar: 0.016, fourStar: 0.13 } // Default expected rates
      };
    }
    
    // Count by rarity
    const counts = {
      total: wishes.length,
      fiveStar: wishes.filter(w => w.rarity === 5).length,
      fourStar: wishes.filter(w => w.rarity === 4).length
    };
    
    // Calculate actual rates
    const actual = {
      fiveStar: counts.fiveStar / counts.total,
      fourStar: counts.fourStar / counts.total
    };
    
    // Expected rates differ by banner type
    const characterWishes = wishes.filter(w => w.bannerType.startsWith('character'));
    const weaponWishes = wishes.filter(w => w.bannerType === 'weapon');
    const standardWishes = wishes.filter(w => w.bannerType === 'permanent');
    
    // Calculate weighted expected rates based on wish distribution
    let expectedFiveStar = 0;
    let expectedFourStar = 0;
    
    if (characterWishes.length > 0) {
      expectedFiveStar += (characterWishes.length / counts.total) * 0.016; // 1.6% for character banner
      expectedFourStar += (characterWishes.length / counts.total) * 0.13;  // 13% for character banner
    }
    
    if (weaponWishes.length > 0) {
      expectedFiveStar += (weaponWishes.length / counts.total) * 0.007;    // 0.7% for weapon banner
      expectedFourStar += (weaponWishes.length / counts.total) * 0.06;     // 6% for weapon banner
    }
    
    if (standardWishes.length > 0) {
      expectedFiveStar += (standardWishes.length / counts.total) * 0.006;  // 0.6% for standard banner
      expectedFourStar += (standardWishes.length / counts.total) * 0.051;  // 5.1% for standard banner
    }
    
    return {
      actual,
      expected: {
        fiveStar: expectedFiveStar || 0.016, // Fallback if no calculation possible
        fourStar: expectedFourStar || 0.13
      },
      counts
    };
  };
  
  export const calculateBannerTypeDistribution = (wishes) => {
    if (!wishes || wishes.length === 0) return [];
    
    const bannerCounts = {};
    
    wishes.forEach(wish => {
      const bannerKey = wish.bannerType.startsWith('character') 
        ? 'Character Event' 
        : wish.bannerType === 'weapon'
          ? 'Weapon Event'
          : wish.bannerType === 'permanent'
            ? 'Standard'
            : wish.bannerType;
            
      bannerCounts[bannerKey] = (bannerCounts[bannerKey] || 0) + 1;
    });
    
    return Object.entries(bannerCounts).map(([type, count]) => ({
      type,
      count,
      percentage: count / wishes.length
    }));
  };
  
  export const calculateItemTypeDistribution = (wishes) => {
    if (!wishes || wishes.length === 0) return [];
    
    const typeCountByRarity = {
      5: { character: 0, weapon: 0 },
      4: { character: 0, weapon: 0 }
    };
    
    wishes.forEach(wish => {
      if (wish.rarity === 5 || wish.rarity === 4) {
        const itemType = wish.type === 'Character' ? 'character' : 'weapon';
        typeCountByRarity[wish.rarity][itemType]++;
      }
    });
    
    // Format for visualization
    return [
      { rarity: 5, type: 'Character', count: typeCountByRarity[5].character },
      { rarity: 5, type: 'Weapon', count: typeCountByRarity[5].weapon },
      { rarity: 4, type: 'Character', count: typeCountByRarity[4].character },
      { rarity: 4, type: 'Weapon', count: typeCountByRarity[4].weapon }
    ];
  };