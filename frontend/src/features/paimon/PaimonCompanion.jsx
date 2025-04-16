// Path: frontend/src/features/paimon/PaimonCompanion.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Maximize2, Minimize2 } from 'lucide-react';
import Draggable from 'react-draggable';
import { RESPONSE_PATTERNS, DEFAULT_RESPONSE, HELP_RESPONSES } from './responses';
import { useAudio } from '../audio/AudioSystem';
import { useApp } from '../../context/AppContext';
import { useFirebase } from '../../context/FirebaseContext';
import { createSoftPityReminder } from '../../services/reminderService';
import { useNotification } from '../../context/NotificationContext';
import idleImg from './idle.png';
import hoverImg from './hover.png';
import thinkingImg from './thinking.png';
import talkingImg from './talking.png';

const PaimonState = {
  IDLE: 'idle',
  HOVER: 'hover',
  THINKING: 'thinking',
  TALKING: 'talking'
};

const ANIMATION_DURATION = 300;
const THINKING_INTERVAL = 500;
const TYPING_INTERVAL = 80;

const PaimonCompanion = () => {
  const [paimonState, setPaimonState] = useState(PaimonState.IDLE);
  const [isInputActive, setIsInputActive] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState(null);
  const [messageInterval, setMessageInterval] = useState(null);
  const [thinkingInterval, setThinkingInterval] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasProactiveSuggestion, setHasProactiveSuggestion] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const { playAudio } = useAudio();
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const messageBoxRef = useRef(null);
  const { showNotification } = useNotification();
  const suggestionTimeout = useRef(null);
  const dragNodeRef = useRef(null);
  
  // Firebase integration
  const { 
    getBanners, 
    getEvents,
    getLeaks,
    contentUpdateAvailable,
    firebaseSettings
  } = useFirebase();
  
  const [activeBanners, setActiveBanners] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [leaksData, setLeaksData] = useState(null);

  // Load banners, events and leaks data from Firebase with local fallbacks
  useEffect(() => {
    const loadFirebaseData = async () => {
      try {
        // Get banners from Firebase
        const banners = await getBanners();
        
        // Filter to only active banners
        const now = new Date();
        const activeBannersFiltered = banners.filter(banner => {
          if (banner.isPermanent) return true;
          const start = banner.startDate ? new Date(banner.startDate) : null;
          const end = banner.endDate ? new Date(banner.endDate) : null;
          return (!start || now >= start) && (!end || now <= end);
        });
        
        setActiveBanners(activeBannersFiltered);
        
        // Continue with the rest of the function (events and leaks data)
        const events = await getEvents();
        setActiveEvents(events);
        
        const leaksData = await getLeaks();
        setLeaksData(leaksData);
      } catch (error) {
        console.error('Error loading data for Paimon:', error);
        // Fallback handling...
      }
    };
    
    loadFirebaseData();
  }, [getBanners, getEvents, getLeaks]);

  // Track current page for context-aware responses
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    return path.substring(1); // Remove leading slash
  };

  useEffect(() => {
    // Clean up intervals on unmount
    return () => {
      if (messageInterval) clearInterval(messageInterval);
      if (thinkingInterval) clearInterval(thinkingInterval);
      if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    };
  }, [messageInterval, thinkingInterval]);

  // Check for proactive suggestions based on user data
  useEffect(() => {
    // Only show suggestions if Paimon is not already active
    if (isInputActive || hasProactiveSuggestion) return;

    // Clear any existing timeout
    if (suggestionTimeout.current) {
      clearTimeout(suggestionTimeout.current);
    }

    // Set a new timeout for proactive suggestions
    suggestionTimeout.current = setTimeout(() => {
      // Check pity and show suggestion when close to soft pity
      const characterPity = state.wishes?.pity?.character?.current || 0;
      const characterSoftPity = 74;
      
      if (characterPity >= characterSoftPity - 5 && characterPity < characterSoftPity) {
        setHasProactiveSuggestion(true);
        showProactiveSuggestion(`Hey! Your pity is at ${characterPity}. You're getting close to soft pity! Want me to remind you when you get a 5★?`);
      }
      // Check for contentUpdateAvailable
      else if (contentUpdateAvailable) {
        setHasProactiveSuggestion(true);
        showProactiveSuggestion("Paimon notices there's new content available! Want to refresh to get the latest banners and events?");
      }
      // Check for offline mode
      else if (firebaseSettings && firebaseSettings.offlineMode) {
        setHasProactiveSuggestion(true);
        showProactiveSuggestion("Paimon notices we're in offline mode! The app is using cached data. You can change this in Settings if you want!");
      }
      // Check if there are upcoming banner endings
      else if (activeBanners && activeBanners.length > 0) {
        const nonPermanentBanners = activeBanners.filter(banner => !banner.isPermanent);
        
        if (nonPermanentBanners.length > 0) {
          const closestBanner = nonPermanentBanners.reduce((closest, banner) => {
            const endDate = new Date(banner.endDate);
            const now = new Date();
            const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysLeft <= 3 && (!closest || daysLeft < closest.daysLeft)) {
              return { banner, daysLeft };
            }
            return closest;
          }, null);
          
          if (closestBanner) {
            setHasProactiveSuggestion(true);
            showProactiveSuggestion(`Hey! The "${closestBanner.banner.name}" banner is ending in just ${closestBanner.daysLeft} days! Want Paimon to remind you before it ends?`);
          }
        }
      }
    }, 60000); // Check every minute

    return () => {
      if (suggestionTimeout.current) {
        clearTimeout(suggestionTimeout.current);
      }
    };
  }, [state.wishes?.pity, isInputActive, hasProactiveSuggestion, activeBanners, contentUpdateAvailable, firebaseSettings]);

  const showProactiveSuggestion = (text) => {
    setPaimonState(PaimonState.TALKING);
    playAudio('paimonTalk');
    setIsInputActive(true);
    setMessage(text);
  };

  const getResponse = useCallback((input) => {
    if (!input) return DEFAULT_RESPONSE;
    
    const lowercaseInput = input.toLowerCase();
    const currentPage = getCurrentPage();
    
    // Check for navigation commands
    if (lowercaseInput.includes('go to') || lowercaseInput.includes('show me')) {
      if (lowercaseInput.includes('home') || lowercaseInput.includes('main page')) {
        setTimeout(() => navigate('/'), 1000);
        return "Going to the home page!";
      } else if (lowercaseInput.includes('character')) {
        setTimeout(() => navigate('/characters'), 1000);
        return "Let's check out the characters!";
      } else if (lowercaseInput.includes('history') || lowercaseInput.includes('wishes')) {
        setTimeout(() => navigate('/history'), 1000);
        return "Here's your wish history!";
      } else if (lowercaseInput.includes('analytics') || lowercaseInput.includes('stats')) {
        setTimeout(() => navigate('/analytics'), 1000);
        return "Let's look at your stats!";
      } else if (lowercaseInput.includes('simulator') || lowercaseInput.includes('simulate')) {
        setTimeout(() => navigate('/simulator'), 1000);
        return "Let's try some wishes in the simulator!";
      } else if (lowercaseInput.includes('settings')) {
        setTimeout(() => navigate('/settings'), 1000);
        return "Opening settings!";
      } else if (lowercaseInput.includes('leak') || lowercaseInput.includes('upcoming')) {
        setTimeout(() => navigate('/leaks'), 1000);
        return "Shh! Let's check out those juicy leaks!";
      }
    }
    
    // Check for help mode
    if (lowercaseInput.includes('help')) {
      // Return context-specific help based on current page
      return HELP_RESPONSES[currentPage] || HELP_RESPONSES.default;
    }
    
    // Check for reminder setting
    if (lowercaseInput.includes('remind') || lowercaseInput.includes('notification')) {
      const characterPity = state.wishes?.pity?.character?.current || 0;
      if (lowercaseInput.includes('pity') || lowercaseInput.includes('5 star') || lowercaseInput.includes('5★')) {
        // Create a pity reminder
        const reminder = createSoftPityReminder(characterPity, 'character');
        if (reminder) {
          showNotification('success', 'Reminder Set', 'Paimon will remind you when you reach soft pity!');
          return "Okay! Paimon will remind you when you get close to soft pity!";
        } else {
          return "Hmm, you're not close enough to soft pity yet. Paimon will keep an eye on it though!";
        }
      }
      
      // Handle banner reminders if a banner name is mentioned
      if (activeBanners && activeBanners.length > 0) {
        for (const banner of activeBanners) {
          if (banner.name && lowercaseInput.includes(banner.name.toLowerCase())) {
            // Import dynamically to avoid circular dependencies
            import('../../services/reminderService').then(({ createBannerEndingReminder }) => {
              const reminder = createBannerEndingReminder(banner, 24);
              if (reminder) {
                showNotification('success', 'Reminder Set', `Paimon will remind you before ${banner.name} ends!`);
              }
            });
            return `Okay! Paimon will remind you 24 hours before ${banner.name} ends!`;
          }
        }
      }
      
      return "What would you like Paimon to remind you about? Soft pity? Banner endings?";
    }

    const formatData = {
      pity: state.wishes?.pity || {
        character: { current: 0, guaranteed: false },
        weapon: { current: 0, guaranteed: false }
      },
      wishes: {
        stats: state.wishes?.stats || {
          total_wishes: 0,
          five_stars: 0,
          four_stars: 0,
          primogems_spent: 0
        }
      },
      currentPage: currentPage
    };
    
    // Use all available banners for comprehensive responses
    const allBanners = activeBanners && activeBanners.length > 0 ? activeBanners : null;
    
    // Content update status for update-related responses
    const contentStatus = { contentUpdateAvailable };

    for (const category in RESPONSE_PATTERNS) {
      const { patterns, responses, formatResponse } = RESPONSE_PATTERNS[category];
      if (patterns.some(pattern => lowercaseInput.includes(pattern))) {
        const baseResponse = responses[Math.floor(Math.random() * responses.length)];
        try {
          return formatResponse ? 
            formatResponse(baseResponse, formatData, allBanners, contentStatus, activeEvents, leaksData) : 
            baseResponse;
        } catch (error) {
          console.error('Response formatting error:', error);
          return DEFAULT_RESPONSE;
        }
      }
    }
    return DEFAULT_RESPONSE;
  }, [state.wishes, navigate, showNotification, activeBanners, contentUpdateAvailable, playAudio]);

  const typeMessage = useCallback((text) => {
    if (messageInterval) clearInterval(messageInterval);
    
    let index = 0;
    let buffer = '';
    const words = text.split(' ');
    
    const interval = setInterval(() => {
      if (index < words.length) {
        buffer += words[index] + ' ';
        setMessage(buffer);
        index++;
      } else {
        clearInterval(interval);
        setPaimonState(PaimonState.IDLE);
        setMessageInterval(null);
      }
    }, TYPING_INTERVAL);
  
    setMessageInterval(interval);
    return interval;
  }, [messageInterval]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    
    if (messageInterval) clearInterval(messageInterval);
    if (thinkingInterval) clearInterval(thinkingInterval);
    
    const userInput = input;
    setInput('');
    setPaimonState(PaimonState.THINKING);
    setMessage(".");
    setHasProactiveSuggestion(false);

    const thinking = setInterval(() => {
      setMessage(prev => prev === "..." ? "." : prev + ".");
    }, THINKING_INTERVAL);
    setThinkingInterval(thinking);

    setTimeout(() => {
      clearInterval(thinking);
      setThinkingInterval(null);
      const response = getResponse(userInput);
      setPaimonState(PaimonState.TALKING);
      playAudio('paimonTalk');
      typeMessage(response);
    }, 1500);
  }, [input, getResponse, playAudio, typeMessage, messageInterval, thinkingInterval]);

  const handlePaimonClick = useCallback(() => {
    playAudio('buttonClick');
    
    if (isInputActive) {
      if (messageInterval) clearInterval(messageInterval);
      if (thinkingInterval) clearInterval(thinkingInterval);
      setIsClosing(true);
      setTimeout(() => {
        setMessage(null);
        setIsInputActive(false);
        setIsClosing(false);
        setPaimonState(PaimonState.IDLE);
        setHasProactiveSuggestion(false);
      }, ANIMATION_DURATION);
    } else {
      setIsInputActive(true);
      setPaimonState(PaimonState.TALKING);
      
      // Context-aware greeting based on current page
      const currentPage = getCurrentPage();
      let greeting;
      
      switch(currentPage) {
        case 'home':
          greeting = "Hi Traveler! What would you like to know about your wishes?";
          break;
        case 'characters':
          greeting = "Looking at characters? Need help with builds or team comps?";
          break;
        case 'history':
          greeting = "Checking your wish history? Want me to analyze your pulls?";
          break;
        case 'analytics':
          greeting = "Looking at your stats? Ask me about your pity or wish patterns!";
          break;
        case 'settings':
          greeting = "Need help with settings? Ask me about importing or exporting data!";
          break;
        case 'simulator':
          greeting = "Ooh, the wish simulator! Want to try your luck without spending primogems?";
          break;
        case 'leaks':
          greeting = "Checking out leaks? Remember, these might change before release!";
          break;
        default:
          greeting = "Hello! How can Paimon help you today?";
      }
      
      // Add Firebase-awareness to greetings
      if (contentUpdateAvailable) {
        greeting += " Oh, and Paimon notices there's new content available to download!";
      } else if (firebaseSettings && firebaseSettings.offlineMode) {
        greeting += " Paimon sees we're in offline mode, using cached data.";
      }
      
      typeMessage(greeting);
    }
  }, [isInputActive, messageInterval, thinkingInterval, playAudio, typeMessage, contentUpdateAvailable, firebaseSettings]);

  const handleMouseEnter = useCallback(() => {
    setPaimonState(PaimonState.HOVER);
    playAudio('buttonHover');
  }, [playAudio]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const getPaimonImage = () => {
    switch (paimonState) {
      case PaimonState.HOVER: return hoverImg;
      case PaimonState.THINKING: return thinkingImg;
      case PaimonState.TALKING: return talkingImg;
      default: return idleImg;
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    playAudio('buttonClick');
  };

  const handleDragStop = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <Draggable 
      handle=".paimon-handle" 
      bounds="parent"
      onStop={handleDragStop}
      position={position}
      nodeRef={dragNodeRef}
    >
      <div ref={dragNodeRef} className="fixed bottom-16 right-6 z-50">
        {/* Messages */}
        {!isMinimized && (message || isInputActive) && (
          <div 
            ref={messageBoxRef}
            className={`absolute -left-64 z-10 w-64
                      ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
            style={{ 
              bottom: '80px', // Position above the input bar
              maxHeight: '300px' // Limit height with scrolling for long messages
            }}
          >
            <div className="relative bg-gray-100/95 rounded-2xl p-4 
                          border border-gray-300/30
                          shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.05)]
                          backdrop-blur-sm
                          transition-all duration-300 ease-in-out
                          max-h-[300px] overflow-y-auto">
              <p className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Input Bar */}
        {!isMinimized && isInputActive && (
          <div className={`absolute -left-64 bottom-0 w-64 
                         ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
            <div className="flex gap-2 bg-black/40 backdrop-blur-md rounded-xl p-2
                         border border-white/10">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Paimon..."
                className="bg-transparent text-white placeholder-white/50
                        border-none outline-none flex-1 text-sm"
              />
              <button 
                onClick={handleSend}
                className="p-1.5 rounded-lg bg-white/10 text-white
                       hover:bg-white/20 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Proactive suggestion indicator */}
        {hasProactiveSuggestion && !isInputActive && (
          <div className="absolute -right-2 top-10 w-3 h-3 bg-red-500 rounded-full animate-ping" />
        )}

        {/* Paimon */}
        <div 
          className="relative paimon-handle cursor-grab active:cursor-grabbing"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setPaimonState(PaimonState.IDLE)}
          onClick={handlePaimonClick}
        >
          <img
            src={getPaimonImage()}
            alt="Paimon"
            className={`w-24 h-24 object-contain transition-all duration-300
                      hover:scale-110 animate-fadeIn
                      ${isMinimized ? 'w-16 h-16 opacity-80' : ''}`}
          />
        </div>
      </div>
    </Draggable>
  );
};

export default PaimonCompanion;