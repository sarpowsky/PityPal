// src/data/banners.js

export const bannerTypes = {
  CHARACTER: 'character',
  WEAPON: 'weapon',
  STANDARD: 'standard'
};

export const banners = [
  {
    id: "arlecchino-5.3",
    type: "bannerTypes.CHARACTER",
    name: "The Heart's Ashen Shadow",
    character: "Arlecchino",
    startDate: "2025-01-21T18:00:00+01:00",
    endDate: "2025-02-11T14:59:59+01:00",
    image: "/banners/arlecchino.png",
    fourStars: ["Rosaria", "Chevreuse", "Lan Yan"],
    isFeatured: true
  },
  {
    id: "clorinde-5.3",
    type: "bannerTypes.CHARACTER",
    name: "Illuminating Lightning",
    character: "Clorinde",
    startDate: "2025-01-21T18:00:00+01:00",
    endDate: "2025-02-11T14:59:59+01:00",
    image: "/banners/clorinde.png",
    fourStars: ["Rosaria", "Chevreuse", "Lan Yan"],
    isFeatured: true
  },
  {
    id: "weapon-5.3-phase2",
    type: "bannerTypes.WEAPON",
    name: "Epitome Invocation",
    weapons: ["Crimson Moon's Semblance", "Absolution"],
    startDate: "2025-01-21T18:00:00+01:00",
    endDate: "2025-02-11T14:59:59+01:00",
    image: "/banners/weapon.png",
    fourStars: ["Sacrificial Bow", "The Widsith", "Lion's Roar", "Dragon's Bane", "Rainslasher"],
    isFeatured: true
  },
  {
    id: 'wanderlust',
    type: bannerTypes.STANDARD,
    name: "Wanderlust Invocation",
    image: "/banners/wanderlust.jpg",
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