// src/data/events.js
export const eventTypes = {
    MAIN: 'main',
    SIDE: 'side',
    WEB: 'web',
    LOGIN: 'login'
  };
  
  export const events = [
    {
      id: 'lantern-rite-2025',
      type: eventTypes.MAIN,
      name: "Springtime Charms",
      description: "Celebrate Liyue's biggest festival with new mini-games and rewards!",
      startDate: "2025-01-24T10:00:00+01:00", // Adjusted
      endDate: "2025-02-09T03:59:59+01:00",   // Adjusted
      image: "/events/springtime-charms.png",
      rewards: [
        "Primogems x1600",
        "Intertwined Fate x10",
        "Xiangling's 'New Year's Cheer' outfit",
        "Free 4-star Liyue character"
      ]
    },
    {
      id: 'fortunes-coming',
      type: eventTypes.SIDE,
      name: "Fortune's Coming",
      description: "Daily login event offering Intertwined Fates and other rewards.",
      startDate: "2025-01-22T04:00:00+01:00", // Adjusted
      endDate: "2025-02-11T14:59:59+01:00",
      image: "/events/fortunes-coming.png",
      rewards: [
        "Intertwined Fate x10",
        "Mora",
        "Mystic Enhancement Ore"
      ]
    },
    {
      id: 'overflowing-abundance',
      type: eventTypes.SIDE,
      name: "Overflowing Abundance",
      description: "Double rewards from Talent Level-Up and Weapon Material Domains.",
      startDate: "2025-02-03T04:00:00+01:00", // Adjusted
      endDate: "2025-02-10T03:59:59+01:00",   // Adjusted
      image: "/events/overflowing-abundance.png",
      rewards: [
        "2x Talent Materials",
        "2x Weapon Ascension Materials"
      ]
    }
  ];

  
  export const getCurrentEvents = () => {
    const now = new Date();
    return events.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      return now >= start && now <= end;
    });
  };
  
  export const getEventById = (id) => events.find(event => event.id === id);
  
  export const getTimeRemaining = (event) => {
    const now = new Date();
    const end = new Date(event.endDate);
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