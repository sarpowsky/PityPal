// Path: src/features/paimon/responses.js
export const RESPONSE_PATTERNS = {
  greetings: {
    patterns: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening'],
    responses: [
      "Ehehe~ Paimon's here! Need help checking your wishes?",
      "Oh, hi there Traveler! Paimon was just thinking about mora... er, helping you with wishes!",
      "Yay, someone to talk to! What should we check first? Wishes? Pity?",
      "Hey! Paimon missed you! Want to see how close you are to your next 5★?"
    ]
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
      
      return response
        .replace('{pity}', pity)
        .replace('{status}', status);
    }
  },

  banners: {
    patterns: ['banner', 'event', 'featured', 'rate up', 'wishing on', 'current'],
    responses: [
      "Right now we have {banner_name}! {time_info} {character_info}",
      "Ooh, Paimon loves this banner! {banner_name} is running, and {character_info} {time_info}",
      "The current banner is {banner_name}! {character_info} {time_info} Should we do some wishes?",
      "*excited noises* {banner_name} is here! {character_info} {time_info}"
    ],
    formatResponse: (response, stats, banner) => {
      if (!banner) return "Eh? Paimon doesn't see any banner selected! Pick one from the banner carousel first!";
      
      const timeInfo = banner.isPermanent ? 
        "This one never goes away!" :
        banner.endDate ? `Only ${banner.endDate} left! Better hurry!` :
        "Better wish while you can!";
        
      const characterInfo = banner.character ?
        `featuring the amazing ${banner.character}!` :
        "it's the standard banner with all kinds of surprises!";

      return response
        .replace('{banner_name}', banner.name)
        .replace('{time_info}', timeInfo)
        .replace('{character_info}', characterInfo);
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
      "Paimon's here to help! You can ask about:\n• Your pity count (how close to 5★)\n• Banner details\n• Wish history\n• 50/50 status\nJust ask naturally!",
      "Need guidance? Paimon knows everything about wishes! Try asking about your pity, current banners, or wish history! Paimon will explain everything!",
      "Paimon's your best companion! Ask about your wishes, pity, or banners - Paimon will help! You can even check how many primogems you've spent (though maybe that's scary...)"
    ]
  }
};

export const DEFAULT_RESPONSE = "Eh? Paimon's not sure what you mean... Try asking about wishes, banners, or pity! Or say 'help' for some guidance!";