// Path: frontend/src/features/paimon/responses.js
export const RESPONSE_PATTERNS = {
  greetings: {
    patterns: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening'],
    responses: [
      "Ehehe~ Paimon's here! Need help with your pulls or pity tracking?",
      "Oh, hi there Traveler! Paimon was just thinking about mora... er, helping you track your pity!",
      "Yay, someone to talk to! Need info on your current banners or wish stats?",
      "Hey! Paimon missed you! Want to check your pity or see your next 5★ prediction?"
    ],
    formatResponse: (response, formatData) => {
      const page = formatData.currentPage;
      if (page === 'characters') {
        return response + " Or do you want help with character builds?";
      } else if (page === 'analytics') {
        return response + " Looking at your stats? Paimon can explain the ML predictions!";
      } else if (page === 'simulator') {
        return response + " Want to try wishing without spending your primogems?";
      } else if (page === 'leaks') {
        return response + " Checking out future content? Paimon knows all the rumors!";
      } else if (page === 'history') {
        return response + " Want to analyze your past wishes?";
      }
      return response;
    }
  },
 
  pity: {
    patterns: ['pity', 'how many', 'wishes', 'pulls', '5 star', '4 star', 'next'],
    responses: [
      "Hmm, let Paimon check... You've done {pity} wishes since your last 5★! {status}",
      "Paimon's been counting carefully! That's {pity} wishes since your last 5★! {status}",
      "Oooh, exciting! You're at {pity} pity right now! {status}",
      "*checking notes* {pity} wishes... {status}"
    ],
    formatResponse: (response, stats) => {
      const pity = stats.pity.character.current;
      let status = "";
      
      if (pity >= 85) {
        status = "WOW! Your next pull is almost definitely going to be golden! Your chance is over 70%!";
      } else if (pity >= 74) {
        status = "Soft pity is active! Your 5★ chance is much higher than normal now!";
      } else if (pity >= 65) {
        status = "Getting close to soft pity at 74 pulls! Just a few more wishes!";
      } else if (pity >= 45) {
        status = "We're halfway to soft pity! Keep wishing - it starts at 74 pulls with boosted rates!";
      } else {
        status = "Still building pity... Paimon can set a reminder when you get closer to soft pity!";
      }
      
      if (stats.pity.character.guaranteed) {
        status += " And you're GUARANTEED to get the featured character on your next 5★!";
      } else {
        status += " You're currently on 50/50 for your next 5★.";
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
      
      const characterBanners = banners.filter(b => b.character && !b.isPermanent);
      const weaponBanners = banners.filter(b => b.weapons && !b.isPermanent);
      const permanentBanners = banners.filter(b => b.isPermanent);
      
      let bannerList = "";
      
      if (characterBanners.length > 0) {
        bannerList += "📌 Character Banners:\n";
        characterBanners.forEach(banner => {
          const daysLeft = banner.endDate ? 
            Math.ceil((new Date(banner.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 
            "??";
          
          bannerList += `• ${banner.name} featuring ${banner.character} (${daysLeft} days left)\n`;
        });
      }
      
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
      
      if (permanentBanners.length > 0) {
        bannerList += "\n📌 Permanent Banner:\n";
        permanentBanners.forEach(banner => {
          bannerList += `• ${banner.name} (always available)\n`;
        });
      }
      
      bannerList += "\nPaimon can set reminders before these banners end! Just ask!";
      
      return response.replace('{banner_list}', bannerList);
    }
  },

  stats: {
    patterns: ['stats', 'statistics', 'total', 'spent', 'numbers', 'how much'],
    responses: [
      "Let's see... You've spent {primogems} primogems on {total} wishes! That's {five_stars} 5★ characters from it!",
      "Wow! {total} wishes! That's {five_stars} 5★ and {four_stars} 4★ items!",
      "*checking the records* You've made {total} wishes so far! That's {primogems} primogems!",
      "Paimon's calculations show {total} wishes! You got {five_stars} 5★ friends at an average pity of {avg_pity}!"
    ],
    formatResponse: (response, stats) => {
      const data = stats.wishes.stats;
      const avgPity = data.avg_pity || "unknown";
      
      return response
        .replace('{primogems}', (data.total_wishes * 160).toLocaleString())
        .replace('{total}', data.total_wishes.toLocaleString())
        .replace('{five_stars}', data.five_stars)
        .replace('{four_stars}', data.four_stars)
        .replace('{avg_pity}', avgPity);
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
      
      let details = isGuaranteed ? 
        "Paimon's excited to see who you'll get!" : 
        "But remember, if you lose the 50/50, you still have a 10% chance for Capturing Radiance!";

      // Add ML prediction if on analytics page
      if (stats.currentPage === 'analytics') {
        details += " Check the Analytics page for ML predictions on your pull chances!";
      }

      return response
        .replace('{status}', status)
        .replace('{details}', details);
    }
  },

  analytics: {
    patterns: ['analytics', 'predict', 'chance', 'model', 'machine learning', 'ml', 'prediction'],
    responses: [
      "The Analytics page uses machine learning to predict your 5★ chances! It shows exactly when you'll hit 50% and 90% probability!",
      "Paimon loves the Analytics page! It shows your pull distribution and can predict exactly how many wishes until your next 5★!",
      "Want accurate predictions? The ML model in Analytics calculates your exact 5★ chances based on your wish history!",
      "Analytics has super smart predictions using real math! It shows pity distribution, rate comparisons, and ML predictions for your next 5★!"
    ],
    formatResponse: (response, stats) => {
      if (stats.currentPage === 'analytics') {
        return "Make sure to train the ML model with your wish history for more accurate predictions! You can see your exact 5★ probability for each future pull!";
      }
      return response;
    }
  },

  simulator: {
    patterns: ['simulator', 'simulate', 'practice', 'test wishes', 'fake wishes', 'try wishes'],
    responses: [
      "The Wish Simulator lets you test your luck without spending primogems! It has ALL the real game mechanics!",
      "Want to try the simulator? It has real soft pity, hard pity, guaranteed pity, AND the Capturing Radiance system!",
      "Paimon loves the Wish Simulator! It shows exactly what would happen if you wished on the real banners!",
      "The simulator is super accurate! It uses the same rates as the real game - even the secret soft pity increase at pull 74!"
    ],
    formatResponse: (response, stats) => {
      if (stats.currentPage === 'simulator') {
        return "This simulator tracks separate pity for each banner type, just like the real game! It even simulates the 10% Capturing Radiance chance when you lose 50/50!";
      }
      return response;
    }
  },

  import: {
    patterns: ['import', 'get wishes', 'url', 'fetch', 'load data', 'get data'],
    responses: [
      "To import your wishes, click 'How to Import Wishes' on the homepage and follow the steps to get your wish history URL from the game!",
      "Want to import wishes? Go to the Home page and click the guide button! It'll show you exactly how to get your URL with PowerShell!",
      "Importing wishes is easy! The guide on the homepage walks you through getting your game URL with PowerShell and pasting it in the app!",
      "Need to import wishes? Click the import guide button on the homepage! It explains how to grab your URL while the game is running!"
    ]
  },

  reminders: {
    patterns: ['remind', 'notification', 'alert', 'don\'t forget', 'remember'],
    responses: [
      "PityPal can remind you about banner endings, event endings, approaching soft pity, and custom things too! What would you like a reminder for?",
      "Paimon can set reminders for banners ending, events ending, or when you get close to soft pity! Just say what you want to be reminded about!",
      "Want reminders? Paimon can notify you before banners end, events end, or when you're approaching soft pity!",
      "Reminder options include: banner endings (with customizable hours), event endings, soft pity alerts, and custom timed reminders!"
    ],
    formatResponse: (response, _, banners) => {
      if (banners && banners.length > 0 && !banners[0].isPermanent) {
        return response + ` Should I remind you about ${banners[0].name} ending?`;
      }
      return response;
    }
  },

  capturingRadiance: {
    patterns: ['capturing radiance', 'radiance', '10%', 'special chance', 'still get featured'],
    responses: [
      "Capturing Radiance is when you lose the 50/50 but STILL get the featured character! It's a 10% chance - the simulator shows it too!",
      "Even when you lose the 50/50, you have a 10% chance of Capturing Radiance, getting the featured character anyway! The simulator shows this mechanic!",
      "Capturing Radiance gives you a 10% chance to get the featured character even after losing the 50/50! PityPal tracks this in the simulator!",
      "Did you know? When you lose the 50/50, there's a 10% 'Capturing Radiance' chance to still get the featured character! The simulator shows these moments!"
    ]
  },

  offlineMode: {
    patterns: ['offline', 'no connection', 'firebase', 'data', 'cached'],
    responses: [
      "PityPal works offline too! When you're in offline mode, it uses cached data from your last online session.",
      "No internet? No problem! PityPal uses cached data in offline mode. You can toggle this in Settings → Game Content.",
      "Offline mode uses locally stored banner and event data. You can manually force offline mode in Settings if needed!",
      "PityPal caches banners and events so you can use it offline! All your wish data is stored locally and works without internet!"
    ]
  },

  dataManagement: {
    patterns: ['export', 'backup', 'save data', 'download data', 'backup wishes'],
    responses: [
      "You can export your wish data in Settings → Data Management! This creates a JSON file with your complete wish history.",
      "Want to back up your wishes? Go to Settings → Data Management → Export Data to save everything as a JSON file!",
      "PityPal lets you export your wish history as JSON from Settings → Data Management. Great for backups or analysis in other tools!",
      "To save your wish data, use the Export feature in Settings → Data Management. You can import it back later if needed!"
    ]
  },

  contentUpdates: {
    patterns: ['refresh content', 'update banners', 'new content', 'latest banners'],
    responses: [
      "PityPal can automatically fetch the latest banners and events! Check Settings → Game Content to control update frequency.",
      "Need the latest banners? Go to Settings → Game Content and click 'Refresh Content Now'!",
      "PityPal updates game content automatically unless you're in offline mode. You can manually refresh anytime in Settings!",
      "To get the newest banners and events, go to Settings → Game Content → Refresh Content Now!"
    ],
    formatResponse: (response, _, __, contentStatus) => {
      if (contentStatus && contentStatus.contentUpdateAvailable) {
        return "Paimon notices new content is available! Go to Settings → Game Content and click 'Refresh Content Now' to get the latest banners and events!";
      }
      return response;
    }
  },

  gameEvents: {
    patterns: ['game event', 'festival', 'limited time', 'activity', 'quest', 'current events', 'active events', 'ongoing events', 'what events', 'which events', 'show events', 'tell me about events'],
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
      
      eventList += "Paimon can set reminders for these events too! Just ask!";
      
      return response.replace('{event_list}', eventList);
    }
  },

  history: {
    patterns: ['history', 'past wishes', 'wish history', 'previous wishes', 'all wishes'],
    responses: [
      "The History page shows all your wishes with details like pity count for each pull and banner type!",
      "Want to see your wish history? The History page lets you filter by banner type and sort by date!",
      "Check the History page to see every wish you've made, sorted by date with pity info for each pull!",
      "Your complete wish history is on the History page, with filters for different banner types and time periods!"
    ],
    formatResponse: (response, stats) => {
      if (stats.currentPage === 'history') {
        return "You can filter your wishes by banner type using the buttons at the top! The History page also shows the pity count for each pull!";
      }
      return response;
    }
  },

  paimonHelp: {
    patterns: ['what can you do', 'paimon help', 'paimon commands', 'how to use paimon'],
    responses: [
      "Paimon can help with lots of things! Ask about:\n• Pity tracking (\"What's my pity?\")\n• Banner info (\"Show current banners\")\n• Stats (\"What are my wish stats?\")\n• Reminders (\"Remind me about banner ending\")\n• Navigation (\"Go to simulator\")\n• Content updates (\"Check for updates\")\n• Game events (\"What events are active?\")\n• And more!",
      "Paimon is your wish tracker companion! Try asking about:\n• Your pity and 50/50 status\n• Current or upcoming banners\n• Setting reminders for events/banners\n• Wish statistics and analytics\n• Using the simulator\n• Navigating to different pages\n• Importing wish history",
      "Paimon knows everything about your wishes! You can ask about pity, banners, events, stats, or say things like \"Go to simulator\" or \"Set a reminder\" for specific actions!"
    ]
  },

  aboutApp: {
    patterns: ['about app', 'what is pitypal', 'app features', 'how does pitypal work'],
    responses: [
      "PityPal is your complete Genshin Impact wish tracker! It imports your wish history, tracks pity across all banner types, uses ML to predict 5★ chances, simulates wishes, and sets reminders for banners/events!",
      "PityPal helps you track your Genshin wishes! Main features: wish history import, pity tracking, ML prediction, wish simulation, banner/event reminders, and detailed analytics!",
      "PityPal is a Genshin wish tracker that imports your wish history, calculates pity, predicts your 5★ chances with machine learning, simulates wishes with real game mechanics, and more!",
      "PityPal combines wish history tracking, pity calculation, ML prediction, and wish simulation to help you plan your Genshin wishing strategy! It also has banner/event reminders!"
    ]
  },

  creatorInfo: {
    patterns: ['who created', 'who made', 'who developed', 'author', 'creator', 'developer'],
    responses: [
      "PityPal was created by sarpowsky! Paimon thinks they're super talented! They made this cool app with machine learning and everything!",
      "Oh! A developer named sarpowsky created PityPal! They even gave Paimon a job as your helper!",
      "PityPal was made by sarpowsky - they created all these amazing features to help Travelers track their wishes!",
      "The Traveler sarpowsky created PityPal! Paimon is thankful they made such a useful tool for Genshin players!"
    ]
  },

  upcomingBanners: {
    patterns: ['upcoming banner', 'next banner', 'future banner', 'leaked banner'],
    responses: [
      "According to leaks, here's what might be coming: {upcoming_list}",
      "Paimon's heard some rumors about future banners: {upcoming_list}",
      "Don't tell anyone Paimon told you, but the next banners might be: {upcoming_list}",
      "Shh! These are the leaked upcoming banners: {upcoming_list}"
    ],
    formatResponse: (response, stats, _, __, ___, leaks) => {
      if (!leaks || !leaks.phases || leaks.phases.length === 0) {
        return "Paimon doesn't have info about upcoming banners yet! Check the Leaks page for updates or for the latest rumors!";
      }
      
      let upcomingList = "";
      
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
        return "Check the Leaks page for the latest information about upcoming banners! Paimon can take you there!";
      }
      
      upcomingList += "⚠️ Remember, leaks can change before official release!";
      
      return response.replace('{upcoming_list}', upcomingList);
    }
  }
};



export const HELP_RESPONSES = {
  home: "On the Home page, you can:\n• Import wish history using the URL bar\n• See your current pity and 50/50 status\n• View active banners and events\n• Check recent wishes\n• Access quick statistics\n\nUse the 'How to Import Wishes' button for step-by-step instructions to get your wish URL from the game!",
  
  history: "On the Wish History page, you can:\n• View all your wishes chronologically\n• Filter by banner type (Character, Weapon, Standard)\n• See the pity count for each pull\n• Sort by newest or oldest\n• Export your wish history\n\nEach wish shows its rarity, name, date, banner type and pity count!",
  
  analytics: "The Analytics page has three sections:\n• Predictions - ML-powered 5★ pull chance calculator\n• Distribution - Shows your 5★/4★ pity patterns\n• Rate Analysis - Compares your actual rates vs expected\n\nThe ML model can predict exactly when you'll hit 50% and 90% chance for a 5★ pull!",
  
  simulator: "The Wish Simulator lets you test pulls without spending primogems! Features:\n• Real banner mechanics including soft pity, hard pity, and 50/50\n• Capturing Radiance system (10% chance when losing 50/50)\n• Pull animations for single and 10-pull wishes\n• Separate pity tracking for each banner type\n• Detailed statistics\n\nTry it to plan your wishing strategy!",
  
  settings: "In Settings, you can:\n• Manage app updates and content\n• Toggle offline mode\n• Export/import wish data\n• Reset data if needed\n• Adjust audio\n• Check for updates\n\nThe Firebase settings control how game content (banners/events) is loaded!",

  leaks: "The Leaks page shows:\n• Upcoming banners and characters\n• New version content\n• Future events\n• Map updates\n\nAll information is based on beta testing and may change before official release!",
  
  default: "PityPal helps track your Genshin Impact wishes! Key features:\n• Wish history import and tracking\n• Banner pity calculation and 50/50 status\n• ML prediction for 5★ pull chances\n• Wish simulator with real game mechanics\n• Banner and event reminders\n• Detailed analytics and statistics\n\nWhat would you like to know about?"
};

export const DEFAULT_RESPONSE = "Hmm? Paimon's not sure what you mean... Try asking about your pity, current banners, wish stats, or say 'help' for more options!";