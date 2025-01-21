// Path: src/features/paimon/PaimonCompanion.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { Send } from 'lucide-react';
import { RESPONSE_PATTERNS, DEFAULT_RESPONSE } from './responses';
import { useAudio } from '../audio/AudioSystem';
import { useApp } from '../../context/AppContext';
import { getCurrentBanners } from '../../data/banners';
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
const TYPING_INTERVAL = 90;

const PaimonCompanion = () => {
  const [paimonState, setPaimonState] = useState(PaimonState.IDLE);
  const [isInputActive, setIsInputActive] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState(null);
  const [messageInterval, setMessageInterval] = useState(null);
  const [thinkingInterval, setThinkingInterval] = useState(null);
  const { playAudio } = useAudio();
  const { state } = useApp();

  useEffect(() => {
    return () => {
      if (messageInterval) clearInterval(messageInterval);
      if (thinkingInterval) clearInterval(thinkingInterval);
    };
  }, [messageInterval, thinkingInterval]);

  const getResponse = useCallback((input) => {
    if (!input) return DEFAULT_RESPONSE;
    const lowercaseInput = input.toLowerCase();

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
      }
    };

    for (const category in RESPONSE_PATTERNS) {
      const { patterns, responses, formatResponse } = RESPONSE_PATTERNS[category];
      if (patterns.some(pattern => lowercaseInput.includes(pattern))) {
        const baseResponse = responses[Math.floor(Math.random() * responses.length)];
        try {
          return formatResponse ? 
            formatResponse(baseResponse, formatData, getCurrentBanners()[0]) : 
            baseResponse;
        } catch (error) {
          console.error('Response formatting error:', error);
          return DEFAULT_RESPONSE;
        }
      }
    }
    return DEFAULT_RESPONSE;
  }, [state.wishes]);

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
      }, ANIMATION_DURATION);
    } else {
      setIsInputActive(true);
      setPaimonState(PaimonState.TALKING);
      const greeting = getResponse('hello');
      typeMessage(greeting);
    }
  }, [isInputActive, messageInterval, thinkingInterval, getResponse, playAudio, typeMessage]);

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

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Messages */}
      {(message || isInputActive) && (
        <div className={`absolute -top-32 -left-64 w-64 
                      ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
          <div className="relative bg-gray-100/95 rounded-2xl p-4 
                        border border-gray-300/30
                        shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.05)]
                        backdrop-blur-sm
                        transition-all duration-300 ease-in-out">
          <div className="absolute right-[30px] bottom-[-12px] w-6 h-6 
                        bg-gray-100/95 rotate-45
                        border-b border-r border-gray-300/30
                        shadow-[2px_2px_2px_-1px_rgba(0,0,0,0.05)]"></div>
            <p className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      )}

      {/* Input Bar */}
      {isInputActive && (
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

      {/* Paimon */}
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setPaimonState(PaimonState.IDLE)}
        onClick={handlePaimonClick}
      >
        <img
          src={getPaimonImage()}
          alt="Paimon"
          className="w-24 h-24 object-contain transition-all duration-300
                   hover:scale-110 cursor-pointer animate-fadeIn"
        />
      </div>
    </div>
  );
};

export default PaimonCompanion;