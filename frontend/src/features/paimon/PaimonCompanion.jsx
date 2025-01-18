/* Path: src/features/paimon/PaimonCompanion.jsx */
import React, { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { RESPONSE_PATTERNS } from './responses';
import { useAudio } from '../audio/AudioSystem';
import idleImg from './idle.png';
import hoverImg from './hover.png';
import thinkingImg from './thinking.png';
import talkingImg from './talking.png';
import chatBubbleImg from './chat-bubble.png';

const PaimonState = {
  IDLE: 'idle',
  HOVER: 'hover',
  THINKING: 'thinking',
  TALKING: 'talking'
};

const PaimonCompanion = ({ pityCount, currentBanner }) => {
  const [paimonState, setPaimonState] = useState(PaimonState.IDLE);
  const [isInputActive, setIsInputActive] = useState(false);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState(null);
  const { playAudio } = useAudio();

  const getResponse = (input) => {
    const lowercaseInput = input.toLowerCase();
    for (const category in RESPONSE_PATTERNS) {
      const { patterns, responses, formatResponse } = RESPONSE_PATTERNS[category];
      if (patterns.some(pattern => lowercaseInput.includes(pattern))) {
        const baseResponse = responses[Math.floor(Math.random() * responses.length)];
        return formatResponse ? formatResponse(baseResponse, pityCount, currentBanner) : baseResponse;
      }
    }
    return "Paimon doesn't understand. Try asking about wishes or banners!";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userInput = input;
    setInput('');
    setPaimonState(PaimonState.THINKING);
    setMessage(".");
    
    playAudio('paimonThinking');
  
    const thinkingInterval = setInterval(() => {
      setMessage(current => {
        switch(current) {
          case ".": return "..";
          case "..": return "...";
          default: return ".";
        }
      });
    }, 500);
  
    setTimeout(() => {
      clearInterval(thinkingInterval);
      const response = getResponse(userInput);
      if (response) {
        setMessage(response);
        setPaimonState(PaimonState.TALKING);
        playAudio('paimonTalk');
        setTimeout(() => setPaimonState(PaimonState.IDLE), 2000);
      }
    }, 2000);
  };

  const handlePaimonClick = () => {
    playAudio('buttonClick');
    setIsInputActive(!isInputActive);
    if (isInputActive) {
      setMessage(null);
    } else {
      playAudio('paimonGreeting');
    }
    setPaimonState(PaimonState.IDLE);
  };

  const handleMouseEnter = () => {
    setPaimonState(PaimonState.HOVER);
    playAudio('buttonHover');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
      playAudio('buttonClick');
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Messages */}
        {(message || isInputActive) && (
        <div className="absolute -top-48 -left-64 w-64 animate-fadeIn">
          <div 
            className="relative w-full"
            onClick={handlePaimonClick}
            style={{
              backgroundImage: `url(${chatBubbleImg})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              minHeight: '300px',
              padding: '48px 0',
              mixBlendMode: 'multiply'
            }}
          >
            <p className="font-mono text-black text-xs px-8 py-6 max-w-[80%] mx-auto">
              {message}
            </p>
          </div>
        </div>
        )}
      {/* Input Bar */}
      {isInputActive && (
        <div className="absolute -left-64 bottom-0 w-64">
          <div className="flex gap-2 bg-black/40 backdrop-blur-md rounded-xl p-2
                      border border-white/10 animate-fadeIn">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Paimon..."
              className="bg-transparent text-white placeholder-white/50
                      border-none outline-none flex-1"
            />
            <button onClick={handleSend}
                    className="p-1.5 rounded-lg bg-white/10 text-white
                          hover:bg-white/20 transition-colors">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Paimon */}
      <div className="relative"
           onMouseEnter={handleMouseEnter}
           onMouseLeave={() => setPaimonState(PaimonState.IDLE)}
           onClick={handlePaimonClick}>
            
        <img
          src={paimonState === 'idle' ? idleImg : 
            paimonState === 'hover' ? hoverImg :
            paimonState === 'thinking' ? thinkingImg :
            paimonState === 'talking' ? talkingImg : idleImg }
          alt="Paimon"
          className="w-24 h-24 object-contain transition-all duration-300
                   hover:scale-110 cursor-pointer animate-fadeIn"
        />
      </div>
    </div>
  );
};

export default PaimonCompanion;