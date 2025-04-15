// Path: frontend/src/features/paimon/responses.js
export const RESPONSE_PATTERNS = {
  greetings: {
    patterns: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening'],
    responses: [
      "Ehehe~ Paimon's here! Need help checking your wishes?",
      "Oh, hi there Traveler! Paimon was just thinking about mora... er, helping you with wishes!",
      "Yay, someone to talk to! What should we check first? Wishes? Pity?",
      "Hey! Paimon missed you! Want to see how close you are to your next 5★?"
    ],
    formatResponse: (response, formatData) => {
      // Add context awareness based on current page
      const page = formatData.currentPage;
      if (page === 'characters') {
        return response + " Or do you want help with character builds?";
      } else if (page === 'analytics') {
        return response + " Looking at your stats, hmm?";
      } else if (page === 'simulator') {
        return response + " Want to try your luck in the simulator?";
      } else if (page === 'leaks') {
        return response + " Checking out the juicy leaks, are we?";
      }
      return response;
    }
  },
 
  pity: {
    patterns: ['pity', 'how many', 'wishes', 'pulls', '5 star', '4 star', 'next'],
    responses: [
      "Hmm, let Paimon check... You've done {pity} wishes so far! {status}",
      "Paimon's been counting carefully! That's {pity} wishes since your last 5★! {status}",
      "Oooh, exciting! You're at {pity} pity right now! {status}",
      "*checking notes* {pity} wishes... {status} Should we do some more pulls?"
    ],
    formatResponse: (response, stats) => {
      const pity = stats.pity.character.current;
      let status = "";
      
      if (pity >= 85) {
        status = "WOW! Your next pull is almost definitely going to be golden! Paimon can feel it!";
      } else if (pity >= 74) {
        status = "Soft pity is active! Paimon thinks you should definitely wish right now!";
      } else if (pity >= 65) {
        status = "Getting really close to soft pity! Just a few more wishes!";
      } else if (pity >= 45) {
        status = "We're making progress! Soft pity starts at 74, so keep going!";
      } else {
        status = "Still building up that pity... but Paimon believes your luck might be better than the numbers!";
      }
      
      if (stats.pity.character.guaranteed) {
        status += " And you're GUARANTEED to get the featured character on your next 5★! That's awesome!";
      }
      
      return response
        .replace('{pity}', pity)
        .replace('{status}', status);
    }
  },

  banners: {
    patterns: ['banner', 'wishing on', 'rate up', 'featured character', 'current banner'],
    responses: [
      "Right now we have: {banner_list}",
      "Ooh, Paimon loves the current banners! {banner_list}",
      "The current banners are: {banner_list}",
      "*excited noises* Here's what's available now: {banner_list}"
    ],
    formatResponse: (response, stats, banners) => {
      if (!banners || !Array.isArray(banners) || banners.length === 0) {
        return "Eh? Paimon doesn't see any banners right now! Check back later or refresh the app!";
      }
      
      // Filter out permanent banner when listing character banners
      const characterBanners = banners.filter(b => b.character && !b.isPermanent);
      const weaponBanners = banners.filter(b => b.weapons && !b.isPermanent);
      const permanentBanners = banners.filter(b => b.isPermanent);
      
      let bannerList = "";
      
      // Add character banners
      if (characterBanners.length > 0) {
        bannerList += "📌 Character Banners:\n";
        characterBanners.forEach(banner => {
          const daysLeft = banner.endDate ? 
            Math.ceil((new Date(banner.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 
            "??";
          
          bannerList += `• ${banner.name} featuring ${banner.character} (${daysLeft} days left)\n`;
        });
      }
      
      // Add weapon banners
      if (weaponBanners.length > 0) {
        bannerList += "\n📌 Weapon Banner:\n";
        weaponBanners.forEach(banner => {
          const daysLeft = banner.endDate ? 
            Math.ceil((new Date(banner.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 
            "??";
          
          const weaponsList = Array.isArray(banner.weapons) ? 
            banner.weapons.join(" and ") : 
            (banner.weapons || "featured weapons");
          
          bannerList += `• ${banner.name} featuring ${weaponsList} (${daysLeft} days left)\n`;
        });
      }
      
      // Add permanent banners
      if (permanentBanners.length > 0) {
        bannerList += "\n📌 Permanent Banner:\n";
        permanentBanners.forEach(banner => {
          bannerList += `• ${banner.name} (always available)\n`;
        });
      }
      
      return response.replace('{banner_list}', bannerList);
    }
  },

  stats: {
    patterns: ['stats', 'statistics', 'total', 'spent', 'numbers', 'how much'],
    responses: [
      "Let's see... You've spent {primogems} primogems! That's like... *tries to count* a lot of Sticky Honey Roast! Got {five_stars} 5★ characters from it!",
      "Wow! {total} wishes! Paimon's impressed! That's {five_stars} 5★ and {four_stars} 4★ characters and weapons!",
      "*checking the records* {total} wishes so far! {primogems} primogems! No wonder Paimon's been so busy counting!",
      "Paimon's calculations show {total} wishes! You got {five_stars} 5★ friends to play with! That's worth every primogem!"
    ],
    formatResponse: (response, stats) => {
      const data = stats.wishes.stats;
      return response
        .replace('{primogems}', (data.total_wishes * 160).toLocaleString())
        .replace('{total}', data.total_wishes.toLocaleString())
        .replace('{five_stars}', data.total_five_stars)
        .replace('{four_stars}', data.total_four_stars);
    }
  },

  guarantee: {
    patterns: ['guaranteed', '50/50', 'chance', 'probability', 'will i get', 'next character'],
    responses: [
      "For your next 5★... {status}! {details}",
      "Paimon checked the rules! {status}! {details}",
      "*flips through notes* Oh! {status}! {details}",
      "About your next 5★... {status}! {details}"
    ],
    formatResponse: (response, stats) => {
      const isGuaranteed = stats.pity.character.guaranteed;
      const status = isGuaranteed ? 
        "you're GUARANTEED to get the featured character" : 
        "it's a 50/50 chance for the featured character";
      const details = isGuaranteed ? 
        "Paimon's so excited to see who you'll get!" : 
        "Paimon will be cheering for your luck! Maybe we should get some lucky items first?";

      return response
        .replace('{status}', status)
        .replace('{details}', details);
    }
  },

  luck: {
    patterns: ['lucky', 'hope', 'wish me', 'bless', 'please'],
    responses: [
      "Paimon's sending all the luck your way! Maybe we should go to the sacred sakura tree first?",
      "Paimon knows you'll get something amazing! Just don't forget to share some mora in return, ehehe~",
      "*throws confetti* Lucky charm activated! Now your next wish will definitely be special!",
      "Good luck! Paimon thinks Lady Fortune is definitely on your side today!"
    ]
  },

  celebration: {
    patterns: ['got', 'pulled', 'won', 'finally'],
    responses: [
      "Yaaaaay! Paimon's so happy for you! See? Paimon's the best lucky charm!",
      "Wow! Amazing! Paimon knew you could do it! Should we celebrate with a feast?",
      "That's incredible! Paimon's happy dance time! *spins around*",
      "See? Paimon's calculations were right! Your luck was just waiting for the right moment!"
    ]
  },

  disappointment: {
    patterns: ['lost', 'failed', 'didn\'t get', 'sad', 'bad luck', 'qiqi'],
    responses: [
      "Aww, don't be sad! Remember, a guaranteed featured 5★ is waiting for you now!",
      "Paimon thinks your next wishes will be much luckier! The gacha gods are just saving your luck!",
      "Hey, hey! Even Qiqi is a 5★! Plus, now you're guaranteed the featured character next time!",
      "Don't worry! Paimon's seen worse luck... wait, that's not helping, is it? Your next wishes will be better for sure!"
    ]
  },

  help: {
    patterns: ['help', 'guide', 'what can', 'how do', 'confused'],
    responses: [
      "Paimon's here to help! You can ask about:\n• Your pity count (how close to 5★)\n• Banner details\n• Wish history\n• 50/50 status\n• Reminders\n• Game updates\nJust ask naturally!",
      "Need guidance? Paimon knows everything about wishes! Try asking about your pity, current banners, or wish history! Paimon will explain everything!",
      "Paimon's your best companion! Ask about your wishes, pity, or banners - Paimon will help! You can even check how many primogems you've spent (though maybe that's scary...)"
    ]
  },
  
  navigation: {
    patterns: ['where am i', 'show me', 'go to', 'take me to', 'navigate'],
    responses: [
      "Where would you like to go? Home page? Character page? Wish history? Analytics? Settings? Just tell Paimon!",
      "Paimon can help you get around! Just say where you want to go!"
    ]
  },
  
  reminders: {
    patterns: ['remind', 'notification', 'alert', 'don\'t forget'],
    responses: [
      "What would you like Paimon to remind you about? Banner endings? Approaching soft pity?",
      "Paimon can set reminders for you! Just tell me what you need to remember!"
    ],
    formatResponse: (response, _, banners) => {
      // If we have active banners, suggest them
      if (banners && banners.length > 0 && !banners[0].isPermanent) {
        return response + ` Should I remind you about ${banners[0].name} ending?`;
      }
      return response;
    }
  },
  
  characters: {
    patterns: ['character', 'build', 'artifact', 'weapon', 'team'],
    responses: [
      "Looking for character info? You can check builds and team comps in the Characters section!",
      "Need help with character builds? The Characters page has all the details!"
    ],
    formatResponse: (response, stats) => {
      // If already on characters page, give more specific guidance
      if (stats.currentPage === 'characters') {
        return "Just click on any character card to see their details, builds, and recommended teams!";
      }
      return response;
    }
  },
  
  import: {
    patterns: ['import', 'get wishes', 'url', 'fetch', 'load data'],
    responses: [
      "To import your wishes, you need to copy the URL from your in-game wish history! Need help with that?",
      "Want to import wishes? Paimon can show you how to get your wish history URL from the game!",
      "Importing wishes is easy! Just click the 'How to Import Wishes' button and follow the steps!"
    ]
  },

  // New response patterns for additional features

  leaks: {
    patterns: ['leak', 'future', 'upcoming', 'next version', 'next patch'],
    responses: [
      "Ooh, you want to know about future content? Check the Leaks page! But remember, it's all subject to change!",
      "Paimon shouldn't really talk about leaks... but between you and me, the Leaks page has some exciting stuff!",
      "Shh! Paimon's not supposed to tell you about future updates! But you can check the Leaks page yourself..."
    ],
    formatResponse: (response, stats) => {
      if (stats.currentPage === 'leaks') {
        return "Remember, everything here is from beta testing and might change! Don't get too attached to anything yet!";
      }
      return response;
    }
  },

  simulator: {
    patterns: ['simulator', 'simulate', 'practice', 'test wishes', 'fake wishes'],
    responses: [
      "Want to try wishing without spending real primogems? Use the Wish Simulator! It's super accurate!",
      "The Wish Simulator lets you test your luck without risking your precious primogems!",
      "Paimon loves the Wish Simulator! You can practice pulling until you're satisfied with your strategy!"
    ],
    formatResponse: (response, stats) => {
      if (stats.currentPage === 'simulator') {
        return "Remember, this simulator uses real game rates and mechanics! Even the soft pity system works the same!";
      }
      return response;
    }
  },

  updates: {
    patterns: ['update', 'new content', 'refresh', 'latest', 'new version'],
    responses: [
      "Wondering about updates? {update_status}",
      "About app updates... {update_status}",
      "Updates? {update_status}"
    ],
    formatResponse: (response, _, __, contentStatus) => {
      let updateStatus = "Paimon's not sure if there are any updates right now. Check the Settings page!";
      
      if (contentStatus && contentStatus.contentUpdateAvailable) {
        updateStatus = "Ooh! Paimon sees new content available! You should refresh to get the latest banners and events!";
      }
      
      return response.replace('{update_status}', updateStatus);
    }
  },

  settings: {
    patterns: ['settings', 'configure', 'preferences', 'options', 'theme'],
    responses: [
      "Need to change app settings? Go to the Settings page! You can adjust things like auto-updates and data management.",
      "The Settings page lets you configure the app just how you like it! Want Paimon to take you there?",
      "In Settings, you can export your wish data, check for updates, and adjust Paimon's personality! Just kidding about that last one, ehehe~"
    ]
  },

  capturingRadiance: {
    patterns: ['capturing radiance', 'radiance', '10%', 'special chance'],
    responses: [
      "Oh! You're asking about Capturing Radiance? That's when you lose the 50/50 but still get the featured character! It's a 10% chance!",
      "Capturing Radiance is Paimon's favorite thing! Even if you lose the 50/50, you still have a small chance (10%) to get the featured character!",
      "Did you know? When you lose the 50/50, there's still a 10% chance called 'Capturing Radiance' where you get the featured character anyway! Amazing, right?"
    ]
  },

  offline: {
    patterns: ['offline', 'no connection', 'firebase', 'data'],
    responses: [
      "Looks like you're using PityPal in offline mode! Don't worry, Paimon's still here with the cached data!",
      "No internet connection? No problem! Paimon's using the data that was saved last time you were online.",
      "Paimon notices we're in offline mode! The app is using its saved data until you reconnect."
    ]
  },

  analytics: {
    patterns: ['analytics', 'predict', 'chance', 'model', 'machine learning'],
    responses: [
      "The Analytics page has some really smart predictions about your pulls! It uses machine learning!",
      "Want to know your chances of getting a 5★? The Analytics page can predict that with fancy math!",
      "Paimon thinks the Analytics page is super useful! It can tell you exactly how many pulls until your next 5★!"
    ],
    formatResponse: (response, stats) => {
      if (stats.currentPage === 'analytics') {
        return "This page uses statistics and machine learning to predict your future pulls! Make sure to train the model with your wish history for better predictions!";
      }
      return response;
    }
  },
  
  gameEvents: {
    patterns: ['game event', 'festival', 'limited time', 'activity', 'quest'],
    responses: [
      "The current events are: {event_list}",
      "These events are happening right now: {event_list}",
      "Here are all the active events: {event_list}",
      "Paimon's favorite events right now: {event_list}"
    ],
    formatResponse: (response, stats, _, __, events) => {
      if (!events || !Array.isArray(events) || events.length === 0) {
        return "Hmm, Paimon doesn't see any events active right now! Check back later or refresh the app!";
      }
      
      // Filter to current events
      const now = new Date();
      const currentEvents = events.filter(event => {
        const startDate = event.startDate ? new Date(event.startDate) : null;
        const endDate = event.endDate ? new Date(event.endDate) : null;
        return (!startDate || now >= startDate) && (!endDate || now <= endDate);
      });
      
      if (currentEvents.length === 0) {
        return "There aren't any events running right now. Check back soon!";
      }
      
      let eventList = "";
      
      currentEvents.forEach(event => {
        const daysLeft = event.endDate ? 
          Math.ceil((new Date(event.endDate) - now) / (1000 * 60 * 60 * 24)) : 
          "??";
        
        eventList += `• ${event.name} (${daysLeft} days left)\n`;
        if (event.description) {
          eventList += `  ${event.description.substring(0, 70)}${event.description.length > 70 ? "..." : ""}\n`;
        }
        if (event.rewards && event.rewards.length) {
          eventList += `  Rewards: ${event.rewards.join(", ")}\n`;
        }
        eventList += "\n";
      });
      
      return response.replace('{event_list}', eventList);
    }
  },
  
  upcomingBanners: {
    patterns: ['upcoming banner', 'next banner', 'future banner', 'leaked banner', 'next patch'],
    responses: [
      "According to leaks, here's what might be coming: {upcoming_list}",
      "Paimon's heard some rumors about future banners: {upcoming_list}",
      "Don't tell anyone Paimon told you, but the next banners might be: {upcoming_list}",
      "Shh! These are the leaked upcoming banners: {upcoming_list}"
    ],
    formatResponse: (response, stats, _, __, ___, leaks) => {
      if (!leaks || !leaks.phases || leaks.phases.length === 0) {
        return "Paimon doesn't have any information about upcoming banners yet! Check the Leaks page for the latest info!";
      }
      
      let upcomingList = "";
      
      // Go through each phase from the leaks data
      leaks.phases.forEach((phase, index) => {
        if (phase.banners && phase.banners.length > 0) {
          upcomingList += `📌 Phase ${phase.number || index + 1}`;
          if (phase.dateRange) {
            upcomingList += ` (${phase.dateRange})`;
          }
          upcomingList += ":\n";
          
          phase.banners.forEach(banner => {
            let characters = "";
            if (banner.characters && banner.characters.length > 0) {
              characters = `featuring ${banner.characters.join(" and ")}`;
            } else if (banner.name) {
              characters = banner.name;
            }
            
            upcomingList += `• ${characters}\n`;
          });
          
          upcomingList += "\n";
        }
      });
      
      if (!upcomingList) {
        return "Paimon doesn't have detailed information about upcoming banners yet! Check the Leaks page!";
      }
      
      upcomingList += "⚠️ Remember, this is based on leaks and could change before release!";
      
      return response.replace('{upcoming_list}', upcomingList);
    }
  },

  upcomingEvents: {
    patterns: ['upcoming event', 'next event', 'future event', 'leaked event'],
    responses: [
      "These events should be coming in the next update: {upcoming_events}",
      "Paimon's heard about these upcoming events: {upcoming_events}",
      "According to leaks, we'll be getting these events: {upcoming_events}",
      "The next update should bring these events: {upcoming_events}"
    ],
    formatResponse: (response, stats, _, __, ___, leaks) => {
      if (!leaks || !leaks.phases || leaks.phases.length === 0) {
        return "Paimon doesn't know about any upcoming events yet! Check the Leaks page for the latest info!";
      }
      
      let upcomingEventsList = "";
      let foundEvents = false;
      
      // Go through phases looking for events
      leaks.phases.forEach((phase, index) => {
        const events = [];
        
        // Different ways events might be structured in the leaks data
        if (phase.events && Array.isArray(phase.events)) {
          events.push(...phase.events);
          foundEvents = true;
        }
        
        if (events.length > 0) {
          upcomingEventsList += `📌 Phase ${phase.number || index + 1}`;
          if (phase.dateRange) {
            upcomingEventsList += ` (${phase.dateRange})`;
          }
          upcomingEventsList += ":\n";
          
          events.forEach(event => {
            upcomingEventsList += `• ${event.name || event.title || "Unnamed Event"}\n`;
            if (event.description) {
              upcomingEventsList += `  ${event.description.substring(0, 70)}${event.description.length > 70 ? "..." : ""}\n`;
            }
          });
          
          upcomingEventsList += "\n";
        }
      });
      
      if (!foundEvents) {
        upcomingEventsList = "Paimon hasn't heard about specific upcoming events yet, but there should be new ones in the next version!";
      } else {
        upcomingEventsList += "⚠️ Remember, this is based on leaks and could change before release!";
      }
      
      return response.replace('{upcoming_events}', upcomingEventsList);
    }
  }
};

export const HELP_RESPONSES = {
  home: "On the Home page, you can see:\n• Your current pity status\n• Recent banners\n• Latest events\n• Recent wishes\n\nYou can also import your wish history using the URL bar at the top. Need help with that?",
  
  characters: "The Characters page shows all Genshin Impact characters with their rarity and elements. Click on any character to see:\n• Recommended builds\n• Best artifact sets\n• Team compositions\n• Ascension materials",
  
  history: "This is your Wish History page. Here you can:\n• View all your wishes sorted by date\n• Filter by banner type\n• Export your wish data\n• See the pity count for each pull",
  
  analytics: "The Analytics page shows statistics about your wishes including:\n• Pull rate analysis\n• Pity distribution\n• Banner distribution\n• 5★ and 4★ item analysis\n\nYou can also predict your chances of getting a 5★ based on your current pity!",
  
  simulator: "The Wish Simulator lets you practice wishing without spending real primogems! Features include:\n• Accurate banner mechanics and rates\n• Real soft pity and hard pity systems\n• 50/50 and guarantee mechanics\n• Wish animation for single and ten-pulls\n• Capturing Radiance system (10% chance to get featured character when losing 50/50)",
  
  settings: "In Settings, you can:\n• Import or export your wish data\n• Change app appearance\n• Check for updates\n• Manage your game content\n• Toggle offline mode\n• Reset your data (be careful with this!)",

  leaks: "The Leaks page shows upcoming content from beta testing, including:\n• Future banners\n• New characters\n• Events coming in the next version\n\nRemember that leaked content might change before the official release!",
  
  default: "This is the Genshin Impact Pity Tracker! You can:\n• Track your wish pity for all banner types\n• Import your wish history\n• Analyze your pull statistics\n• Get predictions for future wishes\n• Set reminders for banners and events\n\nWhat would you like help with?"
};

export const DEFAULT_RESPONSE = "Eh? Paimon's not sure what you mean... Try asking about wishes, banners, or pity! Or say 'help' for some guidance!";