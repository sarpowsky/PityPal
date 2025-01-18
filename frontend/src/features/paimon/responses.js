/* Path: src/features/paimon/responses.js */

export const RESPONSE_PATTERNS = {
  greetings: {
    patterns: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening'],
    responses: [
      "Hi Traveler! Paimon is here to help!",
      "Hello! Let's check your wishes together!",
      "Hey there! Ready to track some wishes?"
    ]
  },
 
  pity: {
    patterns: ['pity', 'guaranteed', '50/50', 'pulls', 'wishes', 'how many', 'counter'],
    responses: [
      "Your pity is at {pity}! {pityMessage}",
      "You've made {pity} wishes since your last 5★. {pityMessage}",
      "Counting... {pity} wishes so far! {pityMessage}"
    ],
    formatResponse: (response, pityCount) => {
      const pityMessage = pityCount >= 74 
        ? "Soft pity is active! Your next 5★ could be any pull now!" 
        : pityCount >= 60 
          ? "Getting close to soft pity! Just a few more pulls!" 
          : pityCount >= 45
            ? "Keep wishing! You're making progress!"
            : "Still building up that pity count!";
      return response.replace('{pity}', pityCount).replace('{pityMessage}', pityMessage);
    }
  },
 
  banners: {
    patterns: ['banner', 'event', 'featured', 'rate up', 'wishing on', 'current'],
    responses: [
      "You're wishing on {bannerName}! {timeRemaining}",
      "The {bannerName} banner {timeMessage}",
      "Featured on {bannerName}: {featured}"
    ],
    formatResponse: (response, pityCount, banner) => {
      if (!banner) return "No active banner selected! Choose one from the banner carousel!";
      
      const now = new Date();
      const endDate = new Date(banner.endDate);
      const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      
      const timeRemaining = banner.isPermanent 
        ? "This banner is always available!"
        : daysRemaining <= 1 
          ? "Ending today! Better hurry!" 
          : `${daysRemaining} days remaining!`;
 
      const timeMessage = banner.isPermanent
        ? "is always available"
        : daysRemaining <= 1
          ? "ends today! Don't miss out!"
          : `ends in ${daysRemaining} days`;
 
      return response
        .replace('{bannerName}', banner.name)
        .replace('{timeRemaining}', timeRemaining)
        .replace('{timeMessage}', timeMessage)
        .replace('{featured}', banner.character || 'Standard wish');
    }
  },
 
  characters: {
    patterns: ['character', 'who', 'build', 'materials', 'talents', 'ascension'],
    responses: [
      "Want to learn about {character}? Check the Characters tab!",
      "Looking for {character}'s materials? I can help you find them!",
      "Need help building {character}? Let's check their details!"
    ],
    formatResponse: (response, pityCount, banner) => {
      const character = banner?.character || "characters";
      return response.replace('{character}', character);
    }
  },
 
  help: {
    patterns: ['help', 'how', 'what', 'guide', 'explain', 'tutorial', 'confused'],
    responses: [
      "Paimon can help! You can ask about:\n• Your pity count\n• Current banners\n• Character info",
      "Need help? Paimon knows about:\n• Wish history\n• Banner details\n• Pity tracking",
      "Here's what Paimon can help with:\n• Tracking wishes\n• Finding materials\n• Banner info"
    ]
  },
 
  tips: {
    patterns: ['tip', 'advice', 'should', 'better', 'suggest', 'recommendation'],
    responses: [
      "Pro tip: Save your primogems if you're waiting for a specific character!",
      "Remember: Soft pity starts at 74 pulls, giving you better 5★ chances!",
      "Here's a tip: Track your 50/50 status to know if your next 5★ is guaranteed!"
    ]
  },

  jokes: {
    patterns: ['joke', 'funny', 'laugh', 'humor', 'emergency food'],
    responses: [
      "Hey! Paimon is NOT emergency food! 😠",
      "Paimon thinks the best joke is getting Qiqi on your 50/50... Wait, that's not funny...",
      "What's a Hilichurl's favorite food? Mora meat! ...Paimon needs to work on better jokes."
    ]
  },

  complaints: {
    patterns: ['lost', 'failed', 'bad luck', 'unlucky', 'qiqi', 'sad'],
    responses: [
      "Don't worry! Your next 5★ will come home soon!",
      "Keep your spirits up! Every pull brings you closer to pity!",
      "Remember, losing the 50/50 means your next 5★ is guaranteed!"
    ]
  }
};
 
export const DEFAULT_RESPONSE = "Paimon's not sure about that. Try asking about wishes, characters, or banners!";