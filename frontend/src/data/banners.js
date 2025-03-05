// src/data/banners.js

export const bannerTypes = {
  CHARACTER: 'character',
  WEAPON: 'weapon',
  STANDARD: 'standard'
};

export const banners = [
  {
    id: "yumemizuki-5.4",
    type: "bannerTypes.CHARACTER",
    name: "Travelers' Tales: Anthology Chapter",
    character: "Yumemizuki Mizuki",
    startDate: "2025-02-12T18:00:00+01:00",
    endDate: "2025-03-04T14:59:59+01:00",
    image: "/banners/yumemizuki.png",
    fourStars: ["Gorou", "Xiangling", "Sayu"],
    isFeatured: true
  },
  {
    id: "sigewinne-5.4",
    type: "bannerTypes.CHARACTER",
    name: "Travelers' Tales: Anthology Chapter (Rerun)",
    character: "Sigewinne",
    startDate: "2025-02-12T18:00:00+01:00",
    endDate: "2025-03-04T14:59:59+01:00",
    image: "/banners/sigewinne.png",
    fourStars: ["Gorou", "Xiangling", "Sayu"],
    isFeatured: true
  },
  {
    id: "furina-5.4",
    type: "bannerTypes.CHARACTER",
    name: "Chanson of Many Waters",
    character: "Furina",
    startDate: "2025-03-04T18:00:00+01:00",
    endDate: "2025-03-25T14:59:59+01:00",
    image: "/banners/furina.png",
    fourStars: ["Charlotte", "Chongyun", "Mika"],
    isFeatured: true
  },
  {
    id: "wriothesley-5.4",
    type: "bannerTypes.CHARACTER",
    name: "Tempestuous Destiny",
    character: "Wriothesley",
    startDate: "2025-03-04T18:00:00+01:00",
    endDate: "2025-03-25T14:59:59+01:00",
    image: "/banners/wriothesley.png",
    fourStars: ["Charlotte", "Chongyun", "Mika"],
    isFeatured: true
  },
  {
    id: "weapon-5.4-phase2",
    type: "bannerTypes.WEAPON",
    name: "Epitome Invocation",
    weapons: ["Sunny Morning Sleep-In"],
    startDate: "2025-03-04T18:00:00+01:00",
    endDate: "2025-03-25T14:59:59+01:00",
    image: "/banners/weapon-5.4.png",
    fourStars: ["Sacrificial Bow", "The Widsith", "Lion's Roar", "Dragon's Bane", "Rainslasher"],
    isFeatured: true
  },
  {
    id: 'wanderlust',
    type: bannerTypes.STANDARD,
    name: "Wanderlust Invocation",
    image: "/banners/wanderlust.png",
    isPermanent: true
  }
];

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

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    total: diff,
    days,
    hours,
    minutes,
    seconds
  };
};

export const getRemainingTime = (endDate) => {
  const now = new Date().getTime();
  const end = new Date(endDate).getTime();
  const distance = end - now;

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000)
  };
};