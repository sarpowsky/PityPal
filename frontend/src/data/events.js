// src/data/events.js
export const eventTypes = {
    MAIN: 'main',
    SIDE: 'side',
    WEB: 'web',
    LOGIN: 'login'
  };
  
  export const events = [
    {
      id: "travelers-tales-5.4",
      type: "eventTypes.MAIN",
      name: "Travelers' Tales: Anthology Chapter",
      description: "Visit different regions to hear your companions' stories and earn rewards.",
      startDate: "2025-02-12T18:00:00+01:00",
      endDate: "2025-03-25T14:59:59+01:00",
      image: "/events/travelers-tales-5.4.png",
      rewards: [
        "Primogems x500",
        "Storybook Fragments",
        "Companion Gifts"
      ]
    },
    {
      id: "realm-tempered-valor-5.4",
      type: "eventTypes.MAIN",
      name: "Realm of Tempered Valor",
      description: "Clear 25 floors of combat challenges to earn exclusive rewards.",
      startDate: "2025-02-24T18:00:00+01:00",
      endDate: "2025-03-10T14:59:59+01:00",
      image: "/events/realm-tempered-valor.png",
      rewards: [
        "Event-exclusive Namecard",
        "Primogems x300",
        "Bonus EXP Materials"
      ]
    },
    {
      id: "mikawa-festival-5.4",
      type: "eventTypes.MAIN",
      name: "Enchanted Tales of the Mikawa Festival",
      description: "Participate in festive mini-games and narrative quests to celebrate the Mikawa Festival.",
      startDate: "2025-02-14T18:00:00+01:00",
      endDate: "2025-03-03T14:59:59+01:00",
      image: "/events/mikawa-festival.png",
      rewards: [
        "Primogems x400",
        "Festival Tokens",
        "Tamayuratei no Ohanashi (4-star Polearm)"
      ]
    },
    {
      id: "invasive-fish-wrangler-5.4",
      type: "eventTypes.UPCOMING",
      name: "Invasive Fish Wrangler",
      description: "Help tackle an ecological crisis by catching invasive fish in designated zones.",
      startDate: "2025-03-05T18:00:00+01:00",
      endDate: "2025-03-17T14:59:59+01:00",
      image: "/events/invasive-fish-wrangler.png",
      rewards: [
        "Primogems x200",
        "Mora",
        "Fishing Rewards"
      ]
    },
    {
      id: "reel-ad-venture-5.4",
      type: "eventTypes.UPCOMING",
      name: "Reel Ad-Venture",
      description: "Assist in a creative ad project by capturing and editing film footage.",
      startDate: "2025-03-12T18:00:00+01:00",
      endDate: "2025-03-24T14:59:59+01:00",
      image: "/events/reel-ad-venture.png",
      rewards: [
        "Primogems x150",
        "Exclusive Ad Rewards"
      ]
    },
    {
      id: "ley-line-overflow-5.4",
      type: "eventTypes.UPCOMING",
      name: "Ley Line Overflow",
      description: "Claim double rewards from leyline outcrops for a limited time.",
      startDate: "2025-03-17T18:00:00+01:00",
      endDate: "2025-03-24T14:59:59+01:00",
      image: "/events/ley-line-overflow.png",
      rewards: [
        "Double Mora",
        "Double Character EXP Materials"
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