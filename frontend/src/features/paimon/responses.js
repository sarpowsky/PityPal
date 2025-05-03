// Path: frontend/src/features/paimon/responses.js
export const RESPONSE_PATTERNS = {
  greetings: {
    patterns: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening'],
    responses: [
      "Ehehe~ Paimon's here! Need help with your pulls or pity tracking?",
      "Oh, hi there Traveler! Paimon was just thinking about mora... er, helping you track your pity!",
      "Yay, someone to talk to! Need info on your current banners or wish stats?",
      "Hey! Paimon missed you! Want to check your pity or see your next 5★ prediction?",
      "Hello Traveler! Ready to check your wishes? Or maybe peek at some leaks?",
      "Hi! Paimon is excited to help with your wishing strategy today!"
    ],
    formatResponse: (response, formatData, banners, contentStatus, events, leaksData) => {
      const page = formatData.currentPage;
      
      // Add context about available leak data if we're on the home page
      if (page === 'home' && leaksData && leaksData.phases && leaksData.phases.length > 0) {
        return response + " Paimon knows about some upcoming banners too - just ask!";
      } else if (page === 'characters') {
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
      "*checking notes* {pity} wishes... {status}",
      "Let's see... You're at {pity} pity now! {status}",
      "Paimon's special pity tracker says {pity} wishes! {status}"
    ],
    formatResponse: (response, stats, banners, contentStatus, events, leaksData) => {
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
      
      // Add suggestion about upcoming banners if we have leak data
      if (leaksData && leaksData.phases && leaksData.phases.length > 0 && pity >= 65) {
        let nextBannerPhase = leaksData.phases[0];
        if (nextBannerPhase.banners && nextBannerPhase.banners.length > 0) {
          let featuredChar = "";
          if (nextBannerPhase.banners[0].characters && nextBannerPhase.banners[0].characters.length > 0) {
            featuredChar = nextBannerPhase.banners[0].characters[0];
          }
          
          if (featuredChar) {
            status += ` Paimon knows that ${featuredChar} might be coming soon - want to save for them?`;
          } else {
            status += " Paimon has heard about some interesting upcoming characters - ask about leaks!";
          }
        }
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
      "*excited noises* Here's what's available now: {banner_list}",
      "The banners you can wish on right now: {banner_list}",
      "Here's what the Wanderlust Invocation has for you: {banner_list}"
    ],
    formatResponse: (response, stats, banners) => {
      if (!banners || !Array.isArray(banners) || banners.length === 0) {
        return "Eh? Paimon doesn't see any banners right now! Check back later or refresh the app!";
      }
      
       // Filter out expired banners
      const now = new Date();
      const activeBanners = banners.filter(banner => {
        if (banner.isPermanent) return true;
        const end = banner.endDate ? new Date(banner.endDate) : null;
        return !end || now <= end;
      });
      
      if (activeBanners.length === 0) {
        return "Hmm, all banners have ended! There should be new ones soon, check back later!";
      }
      
      const characterBanners = activeBanners.filter(b => b.character && !b.isPermanent);
      const weaponBanners = activeBanners.filter(b => b.weapons && !b.isPermanent);
      const permanentBanners = activeBanners.filter(b => b.isPermanent);
      
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
      "Paimon's calculations show {total} wishes! You got {five_stars} 5★ friends at an average pity of {avg_pity}!",
      "The official count is {total} wishes! With {five_stars} 5★ items - that's about {primogems} primogems!",
      "You've made {total} wishes and got {five_stars} 5★ items! Your average 5★ pity is {avg_pity}!"
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
      "About your next 5★... {status}! {details}",
      "Let's check your guarantee status... {status}! {details}",
      "Hmmm, according to Paimon's notes... {status}! {details}"
    ],
    formatResponse: (response, stats, banners, contentStatus, events, leaksData) => {
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
      
      // Add upcoming character info if we have leak data
      if (leaksData && leaksData.phases && leaksData.phases.length > 0) {
        let upcomingChars = [];
        for (let phase of leaksData.phases) {
          if (phase.banners) {
            for (let banner of phase.banners) {
              if (banner.characters && banner.characters.length > 0) {
                upcomingChars = upcomingChars.concat(banner.characters);
              }
            }
          }
          
          if (upcomingChars.length >= 2) break; // Just get first couple characters
        }
        
        if (upcomingChars.length > 0) {
          details += ` Paimon's heard ${upcomingChars.join(" and ")} might be coming soon! Want details?`;
        }
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
      "Analytics has super smart predictions using real math! It shows pity distribution, rate comparisons, and ML predictions for your next 5★!",
      "The Analytics page is like Paimon's crystal ball! It uses ML to show exactly when you'll get your next 5★!",
      "Paimon thinks the Analytics page is magic! It learns from your wish history to predict your exact 5★ chances!"
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
      "The simulator is super accurate! It uses the same rates as the real game - even the secret soft pity increase at pull 74!",
      "Paimon recommends the simulator for planning your wishes! Try different strategies before spending real primogems!",
      "The simulator is perfect for testing your luck! It even shows a detailed breakdown of your results!"
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
      "Need to import wishes? Click the import guide button on the homepage! It explains how to grab your URL while the game is running!",
      "Paimon can help you import wishes! Just click the guide button on the homepage and follow the simple steps!",
      "To get your wish history, click the import guide on the homepage! Paimon will walk you through everything!"
    ]
  },

  reminders: {
    patterns: ['remind', 'notification', 'alert', 'don\'t forget', 'remember'],
    responses: [
      "PityPal can remind you about banner endings, event endings, approaching soft pity, and custom things too! What would you like a reminder for?",
      "Paimon can set reminders for banners ending, events ending, or when you get close to soft pity! Just say what you want to be reminded about!",
      "Want reminders? Paimon can notify you before banners end, events end, or when you're approaching soft pity!",
      "Reminder options include: banner endings (with customizable hours), event endings, soft pity alerts, and custom timed reminders!",
      "Paimon is great at reminders! Just tell me what you need to remember - banner endings, events, or pity alerts!",
      "Never miss a banner again! Paimon can remind you about anything - just tell me what you need!"
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
      "Did you know? When you lose the 50/50, there's a 10% 'Capturing Radiance' chance to still get the featured character! The simulator shows these moments!",
      "Paimon loves the Capturing Radiance system! Even if you lose 50/50, you have a 10% chance to get the banner character!",
      "The 10% Capturing Radiance chance can save your wishes! It's like a second chance after losing 50/50!"
    ]
  },

  offlineMode: {
    patterns: ['offline', 'no connection', 'firebase', 'data', 'cached'],
    responses: [
      "PityPal works offline too! When you're in offline mode, it uses cached data from your last online session.",
      "No internet? No problem! PityPal uses cached data in offline mode. You can toggle this in Settings → Game Content.",
      "Offline mode uses locally stored banner and event data. You can manually force offline mode in Settings if needed!",
      "PityPal caches banners and events so you can use it offline! All your wish data is stored locally and works without internet!",
      "Paimon works even without internet! All your wish data is stored on your device, so you can track pity anytime!",
      "Don't worry about connection - PityPal stores everything locally! You can even force offline mode in Settings!"
    ]
  },

  dataManagement: {
    patterns: ['export', 'backup', 'save data', 'download data', 'backup wishes'],
    responses: [
      "You can export your wish data in Settings → Data Management! This creates a JSON file with your complete wish history.",
      "Want to back up your wishes? Go to Settings → Data Management → Export Data to save everything as a JSON file!",
      "PityPal lets you export your wish history as JSON from Settings → Data Management. Great for backups or analysis in other tools!",
      "To save your wish data, use the Export feature in Settings → Data Management. You can import it back later if needed!",
      "Paimon recommends backing up your wishes regularly! Just go to Settings → Data Management → Export Data!",
      "Keep your wish data safe by exporting it from Settings → Data Management! You can reimport it anytime!"
    ]
  },

  contentUpdates: {
    patterns: ['refresh content', 'update banners', 'new content', 'latest banners'],
    responses: [
      "PityPal can automatically fetch the latest banners and events! Check Settings → Game Content to control update frequency.",
      "Need the latest banners? Go to Settings → Game Content and click 'Refresh Content Now'!",
      "PityPal updates game content automatically unless you're in offline mode. You can manually refresh anytime in Settings!",
      "To get the newest banners and events, go to Settings → Game Content → Refresh Content Now!",
      "Paimon always knows about the newest banners! You can refresh content in Settings → Game Content!",
      "Need the freshest information? Just refresh content in Settings → Game Content!"
    ],
    formatResponse: (response, _, __, contentStatus) => {
      if (contentStatus && contentStatus.contentUpdateAvailable) {
        return "Paimon notices new content is available! Go to Settings → Game Content and click 'Refresh Content Now' to get the latest banners and events!";
      }
      return response;
    }
  },

  gameEvents: {
    patterns: ['game event', 'festival', 'event', 'events', 'limited time', 'activity', 'quest', 'current events', 'active events', 'ongoing events', 'what events', 'which events', 'show events', 'tell me about events'],
    responses: [
      "The current events are: {event_list}",
      "These events are happening right now: {event_list}",
      "Here are all the active events: {event_list}",
      "Paimon's favorite events right now: {event_list}",
      "Let me check what's happening in Teyvat... {event_list}",
      "Here's what you can do in the game now: {event_list}"
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
      "Your complete wish history is on the History page, with filters for different banner types and time periods!",
      "Paimon keeps track of all your wishes in the History page! You can filter by banner or rarity!",
      "The History page has everything - every wish you've ever made with all the details!"
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
      "Paimon can help with lots of things! Ask about:\n• Pity tracking (\"What's my pity?\")\n• Banner info (\"Show current banners\")\n• Stats (\"What are my wish stats?\")\n• Reminders (\"Remind me about banner ending\")\n• Navigation (\"Go to simulator\")\n• Content updates (\"Check for updates\")\n• Game events (\"What events are active?\")\n• Leaks (\"Tell me about upcoming banners\")\n• And more!",
      "Paimon is your wish tracker companion! Try asking about:\n• Your pity and 50/50 status\n• Current or upcoming banners\n• Setting reminders for events/banners\n• Wish statistics and analytics\n• Using the simulator\n• Navigating to different pages\n• Importing wish history\n• Leaked future content",
      "Paimon knows everything about your wishes! You can ask about pity, banners, events, stats, or say things like \"Go to simulator\" or \"Set a reminder\" for specific actions! Paimon also knows about leaks!",
      "Need help? Paimon can talk about:\n• Your pity status and next 5★ chances\n• Current banners and events\n• Wish statistics and history\n• Pull predictions using ML\n• Setting reminders\n• Navigating the app\n• Upcoming leaks and banners"
    ]
  },

  aboutApp: {
    patterns: ['about app', 'what is pitypal', 'app features', 'how does pitypal work'],
    responses: [
      "PityPal is your complete Genshin Impact wish tracker! It imports your wish history, tracks pity across all banner types, uses ML to predict 5★ chances, simulates wishes, and sets reminders for banners/events!",
      "PityPal helps you track your Genshin wishes! Main features: wish history import, pity tracking, ML prediction, wish simulation, banner/event reminders, and detailed analytics!",
      "PityPal is a Genshin wish tracker that imports your wish history, calculates pity, predicts your 5★ chances with machine learning, simulates wishes with real game mechanics, and more!",
      "PityPal combines wish history tracking, pity calculation, ML prediction, and wish simulation to help you plan your Genshin wishing strategy! It also has banner/event reminders!",
      "This app is Paimon's favorite wish tracker! It tracks your pity, predicts your next 5★, simulates wishes, and even shows upcoming banners!",
      "PityPal does everything a Traveler needs - import wishes, track pity, predict pulls with ML, simulate banners, and check upcoming content!"
    ]
  },

  creatorInfo: {
    patterns: ['who created', 'who made', 'who developed', 'author', 'creator', 'developer'],
    responses: [
      "PityPal was created by sarpowsky! Paimon thinks they're super talented! They made this cool app with machine learning and everything!",
      "Oh! A developer named sarpowsky created PityPal! They even gave Paimon a job as your helper!",
      "PityPal was made by sarpowsky - they created all these amazing features to help Travelers track their wishes!",
      "The Traveler sarpowsky created PityPal! Paimon is thankful they made such a useful tool for Genshin players!",
      "A really smart developer called sarpowsky made PityPal! They even added machine learning to predict your wishes!",
      "Sarpowsky created PityPal! Paimon thinks they must really understand Travelers' needs!"
    ]
  },

  upcomingBanners: {
    patterns: ['upcoming banner', 'next banner', 'future banner', 'leaked banner', 'leak', 'future character', 'upcoming character', 'new character', 'next patch', 'next version', 'leaks'],
    responses: [
      "According to leaks, here's what might be coming: {upcoming_list}",
      "Paimon's heard some rumors about future banners: {upcoming_list}",
      "Don't tell anyone Paimon told you, but the next banners might be: {upcoming_list}",
      "Shh! These are the leaked upcoming banners: {upcoming_list}",
      "Paimon has insider information! Here's what might be coming: {upcoming_list}",
      "Paimon's network of spies report these upcoming banners: {upcoming_list}"
    ],
    formatResponse: (response, stats, _, __, ___, leaks) => {
      if (!leaks || !leaks.phases || leaks.phases.length === 0) {
        return "Paimon doesn't have info about upcoming banners yet! Check the Leaks page for updates or refresh the app for the latest rumors!";
      }
      
      let upcomingList = "";
      
      leaks.phases.forEach((phase, index) => {
        if (phase.banners && phase.banners.length > 0) {
          upcomingList += `📌 Phase ${phase.number || index + 1}`;
          if (phase.version) {
            upcomingList += ` (Version ${phase.version})`;
          }
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
            
            // Add 4-star characters if available
            if (banner.fourStars && banner.fourStars.length > 0) {
              upcomingList += `  4★: ${banner.fourStars.join(", ")}\n`;
            }
          });
          
          // Add events if available
          if (phase.events && phase.events.length > 0) {
            upcomingList += "\n  Events:\n";
            phase.events.slice(0, 3).forEach(event => {
              upcomingList += `  • ${event.name || event}\n`;
            });
            if (phase.events.length > 3) {
              upcomingList += `  • And ${phase.events.length - 3} more...\n`;
            }
          }
          
          upcomingList += "\n";
        }
      });
      
      if (!upcomingList) {
        return "Check the Leaks page for the latest information about upcoming banners! Paimon can take you there!";
      }
      
      // Add version summary if available
      if (leaks.version) {
        upcomingList = `Version ${leaks.version} Leaks:\n\n` + upcomingList;
      }
      
      if (leaks.lastUpdated) {
        const updateDate = new Date(leaks.lastUpdated);
        upcomingList += `\nLeaks last updated: ${updateDate.toLocaleDateString()}\n`;
      }
      
      upcomingList += "⚠️ Remember, leaks can change before official release!";
      
      return response.replace('{upcoming_list}', upcomingList);
    }
  },
  
  newCharacters: {
    patterns: ['new character', 'upcoming character', 'future character', 'character leak', 'leaked character', 'next character'],
    responses: [
      "Paimon's heard about these upcoming characters: {character_list}",
      "According to leaks, these characters might be coming soon: {character_list}",
      "Shh! Don't tell anyone, but these characters might be next: {character_list}",
      "Paimon's sources say these characters are coming up: {character_list}",
      "The rumor mill says we'll see these characters soon: {character_list}",
      "Paimon's crystal ball shows these upcoming characters: {character_list}"
    ],
    formatResponse: (response, stats, _, __, ___, leaks) => {
      if (!leaks || !leaks.phases || leaks.phases.length === 0) {
        return "Paimon doesn't have information about new characters yet! Check the Leaks page or refresh game content!";
      }
      
      // Extract all characters from upcoming banners
      const characters = new Set();
      const characterDetails = {};
      
      leaks.phases.forEach(phase => {
        if (phase.banners) {
          phase.banners.forEach(banner => {
            if (banner.characters && banner.characters.length > 0) {
              banner.characters.forEach(char => {
                characters.add(char);
                if (!characterDetails[char]) {
                  characterDetails[char] = {
                    version: phase.version || "upcoming version",
                    isNew: banner.isNew || false,
                    element: banner.element || "",
                    weaponType: banner.weaponType || "",
                    phase: phase.number || ""
                  };
                }
              });
            }
          });
        }
      });
      
      if (characters.size === 0) {
        return "Paimon hasn't heard about any specific new characters yet. Check the Leaks page for updates!";
      }
      
      let characterList = "";
      
      // First list new characters (if any are marked as new)
      const newChars = Array.from(characters).filter(char => characterDetails[char].isNew);
      if (newChars.length > 0) {
        characterList += "🌟 New Characters:\n";
        newChars.forEach(char => {
          characterList += `• ${char}`;
          if (characterDetails[char].element) {
            characterList += ` (${characterDetails[char].element})`;
          }
          if (characterDetails[char].weaponType) {
            characterList += ` - ${characterDetails[char].weaponType}`;
          }
          characterList += ` - Coming in Version ${characterDetails[char].version}`;
          if (characterDetails[char].phase) {
            characterList += `, Phase ${characterDetails[char].phase}`;
          }
          characterList += "\n";
        });
        characterList += "\n";
      }
      
      // Then list reruns
      const reruns = Array.from(characters).filter(char => !characterDetails[char].isNew);
      if (reruns.length > 0) {
        characterList += "🔄 Rerun Characters:\n";
        reruns.forEach(char => {
          characterList += `• ${char} - Expected in Version ${characterDetails[char].version}`;
          if (characterDetails[char].phase) {
            characterList += `, Phase ${characterDetails[char].phase}`;
          }
          characterList += "\n";
        });
      }
      
      characterList += "\n⚠️ Remember that leaks can be inaccurate or change before release!";
      
      return response.replace('{character_list}', characterList);
    }
  },
  
  versionInfo: {
    patterns: ['next version', 'upcoming version', 'version', 'patch', 'update', 'new region', 'new area', 'new map'],
    responses: [
      "Here's what Paimon knows about the upcoming version: {version_info}",
      "The next version should bring these features: {version_info}",
      "Paimon's heard these rumors about the next update: {version_info}",
      "According to leaks, the next version will include: {version_info}",
      "Shh! Paimon's sources say the next update will have: {version_info}",
      "Based on beta testing, the next version should have: {version_info}"
    ],
    formatResponse: (response, stats, _, __, ___, leaks) => {
      if (!leaks || !leaks.version) {
        return "Paimon doesn't have details about the next version yet! Check the Leaks page for updates!";
      }
      
      let versionInfo = `Version ${leaks.version}\n\n`;
      
      // Add major features if available
      if (leaks.features && leaks.features.length > 0) {
        versionInfo += "✨ Major Features:\n";
        leaks.features.forEach(feature => {
          versionInfo += `• ${feature}\n`;
        });
        versionInfo += "\n";
      }
      
      // Add new areas if available
      if (leaks.newAreas && leaks.newAreas.length > 0) {
        versionInfo += "🗺️ New Areas:\n";
        leaks.newAreas.forEach(area => {
          versionInfo += `• ${area}\n`;
        });
        versionInfo += "\n";
      }
      
      // List phases with characters
      if (leaks.phases && leaks.phases.length > 0) {
        versionInfo += "📅 Banner Schedule:\n";
        leaks.phases.forEach((phase, index) => {
          if (phase.banners && phase.banners.length > 0) {
            versionInfo += `• Phase ${phase.number || index + 1}: `;
            
            const characters = [];
            phase.banners.forEach(banner => {
              if (banner.characters && banner.characters.length > 0) {
                characters.push(...banner.characters);
              }
            });
            
            if (characters.length > 0) {
              versionInfo += characters.join(" / ");
            } else {
              versionInfo += "Unknown characters";
            }
            
            versionInfo += "\n";
          }
        });
        versionInfo += "\n";
      }
      
      // Add events summary
      let allEvents = [];
      if (leaks.phases) {
        leaks.phases.forEach(phase => {
          if (phase.events && phase.events.length > 0) {
            phase.events.forEach(event => {
              if (typeof event === 'string') {
                allEvents.push(event);
              } else if (event.name) {
                allEvents.push(event.name);
              }
            });
          }
        });
      }
      
      if (allEvents.length > 0) {
        versionInfo += "🎮 Events (partial list):\n";
        // Limit to first 5 events
        allEvents.slice(0, 5).forEach(event => {
          versionInfo += `• ${event}\n`;
        });
        if (allEvents.length > 5) {
          versionInfo += `• And ${allEvents.length - 5} more events...\n`;
        }
        versionInfo += "\n";
      }
      
      versionInfo += "⚠️ All information is based on leaks and subject to change!";
      
      return response.replace('{version_info}', versionInfo);
    }
  },

  futureContent: {
    patterns: ['roadmap', 'future content', 'upcoming content', 'future updates', 'future versions', 'long term', 'upcoming regions', 'natlan', 'fontaine', 'snezhnaya'],
    responses: [
      "Here's what Paimon's heard about future content: {roadmap}",
      "According to leaks and official teasers, here's what's coming: {roadmap}",
      "Paimon's inside sources have shared this future roadmap: {roadmap}",
      "The future of Genshin Impact looks exciting! Here's what's coming: {roadmap}",
      "Paimon can't wait for these upcoming features: {roadmap}",
      "The Traveler's journey will take us to these places: {roadmap}"
    ],
    formatResponse: (response, stats, _, __, ___, leaks) => {
      // This is largely static content with some elements from leaks
      let roadmap = "";
      
      // Current upcoming version from leaks if available
      if (leaks && leaks.version) {
        roadmap += `🌟 Version ${leaks.version}:\n`;
        
        // List known features
        if (leaks.features && leaks.features.length > 0) {
          leaks.features.slice(0, 3).forEach(feature => {
            roadmap += `• ${feature}\n`;
          });
        } else {
          // Extract characters if no features listed
          const characters = new Set();
          if (leaks.phases) {
            leaks.phases.forEach(phase => {
              if (phase.banners) {
                phase.banners.forEach(banner => {
                  if (banner.characters) {
                    banner.characters.forEach(char => characters.add(char));
                  }
                });
              }
            });
          }
          
          if (characters.size > 0) {
            roadmap += `• Featured characters: ${Array.from(characters).join(", ")}\n`;
          } else {
            roadmap += "• Details coming soon!\n";
          }
        }
        roadmap += "\n";
      }
      
      // Add semi-static future content based on known Genshin roadmap
      // This will need occasional manual updates
      roadmap += `🗺️ Major Region Roadmap:\n`;
      roadmap += `• Natlan - The Nation of Fire (expected in 2-3 versions)\n`;
      roadmap += `• Snezhnaya - The Nation of Ice (expected in 1-2 years)\n`;
      roadmap += `• Khaenri'ah - The Fallen Kingdom (final chapter)\n\n`;
      
      roadmap += `👑 Upcoming Archons (expected):\n`;
      roadmap += `• Pyro Archon - Murata, God of War (Natlan)\n`;
      roadmap += `• Cryo Archon - Tsaritsa (Snezhnaya)\n\n`;
      
      roadmap += `⚠️ This roadmap is based on leaks and official teasers - details and timing may change!`;
      
      return response.replace('{roadmap}', roadmap);
    }
  }
};

export const HELP_RESPONSES = {
  home: "On the Home page, you can:\n• Import wish history using the URL bar\n• See your current pity and 50/50 status\n• View active banners and events\n• Check recent wishes\n• Access quick statistics\n\nUse the 'How to Import Wishes' button for step-by-step instructions to get your wish URL from the game!",
  
  history: "On the Wish History page, you can:\n• View all your wishes chronologically\n• Filter by banner type (Character, Weapon, Standard)\n• See the pity count for each pull\n• Sort by newest or oldest\n• Export your wish history\n\nEach wish shows its rarity, name, date, banner type and pity count!",
  
  analytics: "The Analytics page has three sections:\n• Predictions - ML-powered 5★ pull chance calculator\n• Distribution - Shows your 5★/4★ pity patterns\n• Rate Analysis - Compares your actual rates vs expected\n\nThe ML model can predict exactly when you'll hit 50% and 90% chance for a 5★ pull!",
  
  simulator: "The Wish Simulator lets you test pulls without spending primogems! Features:\n• Real banner mechanics including soft pity, hard pity, and 50/50\n• Capturing Radiance system (10% chance when losing 50/50)\n• Pull animations for single and 10-pull wishes\n• Separate pity tracking for each banner type\n• Detailed statistics\n\nTry it to plan your wishing strategy!",
  
  settings: "In Settings, you can:\n• Manage app updates and content\n• Toggle offline mode\n• Export/import wish data\n• Reset data if needed\n• Adjust audio\n• Check for updates\n\nThe Firebase settings control how game content (banners/events) is loaded!",

  leaks: "The Leaks page shows:\n• Upcoming banners and characters\n• New version content\n• Future events\n• Map updates\n• Character details\n\nYou can see what characters are coming in future updates, with their expected release dates and versions. All information is based on beta testing and may change before official release!",
  
  default: "PityPal helps track your Genshin Impact wishes! Key features:\n• Wish history import and tracking\n• Banner pity calculation and 50/50 status\n• ML prediction for 5★ pull chances\n• Wish simulator with real game mechanics\n• Banner and event reminders\n• Detailed analytics and statistics\n• Upcoming banner leaks and predictions\n\nWhat would you like to know about?"
};

export const DEFAULT_RESPONSES = [
  "Hmm? Paimon's not sure what you mean... Try asking about your pity, current banners, wish stats, or say 'help' for more options!",
  "Eh? Paimon didn't quite catch that! You can ask about your wish history, pity status, or upcoming banners!",
  "Paimon is confused! Try asking about analytics, the simulator, or even leaked future characters!",
  "Paimon needs more details! Ask about your current pity, banner info, or say 'What can you do?' for a full list!",
  "That doesn't make sense to Paimon! Try asking about reminders, wish statistics, or events instead!",
  "Paimon's brain is foggy! Try asking about predictions, banner endings, or your 50/50 status!",
  "Hmm, Paimon doesn't understand! Want to know about the Capturing Radiance system? Or maybe upcoming leaks?",
  "Paimon's not sure how to help with that! Try 'Show me current banners' or 'What's my pity?' instead!"
];

export const DEFAULT_RESPONSE = DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];