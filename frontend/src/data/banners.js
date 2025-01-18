// Path: src/data/banners.js

export const bannerTypes = {
    CHARACTER_EVENT: 'character-event',
    WEAPON_EVENT: 'weapon-event',
    STANDARD: 'standard'
  };
  
  export const banners = [
    {
      id: 'kazuha-3.0',
      type: bannerTypes.CHARACTER_EVENT,
      name: "Leaves in the Wind",
      character: "Kaedehara Kazuha",
      weapon: "Freedom-Sworn",
      startDate: "2025-01-16",
      endDate: "2025-02-06",
      image: "/banners/kazuha-3.0.jpg",
      fourStars: ["Rosaria", "Dori", "Razor"],
      description: "The wandering samurai returns with his signature sword!"
    },
    {
      id: 'standard',
      type: bannerTypes.STANDARD,
      name: "Wanderlust Invocation",
      isPermanent: true,
      image: "/banners/standard.jpg",
      description: "Standard wish banner with a chance to win any 5★ character from the standard pool."
    }
  ];
  
  export const getBannerById = (id) => banners.find(banner => banner.id === id);
  
  export const getCurrentBanners = () => {
    const now = new Date();
    return banners.filter(banner => {
      if (banner.isPermanent) return true;
      const start = new Date(banner.startDate);
      const end = new Date(banner.endDate);
      return now >= start && now <= end;
    });
  };
  
  export const getTimeRemaining = (banner) => {
    if (banner.isPermanent) return null;
    const now = new Date();
    const end = new Date(banner.endDate);
    const diff = end - now;
    
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    };
  };