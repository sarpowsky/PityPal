// Path: frontend/src/components/simulator/WishAnimation.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const starColors = {
  3: '#4D6B96', // Blue
  4: '#A56CC1', // Purple
  5: '#C0973A'  // Gold
};

const WishAnimation = ({ results, onAnimationComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  
  // Start animation when results are provided
  useEffect(() => {
    if (results && results.length > 0) {
      // Reset animation state
      setCurrentIndex(-1);
      setShowResults(false);
      
      // Start animation sequence
      const timer = setTimeout(() => {
        startAnimation();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [results]);
  
  const startAnimation = () => {
    // Check if we have 4★ or 5★ items to determine animation duration
    const hasRare = results.some(item => item.rarity >= 4);
    
    // Start showing results after the animation
    // Adding 500ms more to the animation duration
    setTimeout(() => {
      setShowResults(true);
      showItemsSequentially();
    }, hasRare ? 3000 : 2000); // Increased from 2500/1500 to 3000/2000
  };
  
  const showItemsSequentially = () => {
    // Show items one by one
    let index = 0;
    const interval = setInterval(() => {
      if (index < results.length) {
        setCurrentIndex(index);
        index++;
      } else {
        clearInterval(interval);
        // Animation finished, notify parent
        setTimeout(() => {
          if (onAnimationComplete) onAnimationComplete();
        }, 1000);
      }
    }, 300);
  };
  
  // Determine if it's a multi-wish (10 pull)
  const isMultiWish = results && results.length > 1;
  
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Initial animation - Custom image/gif that fills the screen */}
      <AnimatePresence>
        {!showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full"
          >
            <div className="w-full h-full">
              {/* Full screen animation */}
              <img 
                src="/animations/wish-animation.gif" 
                alt="Wish Animation"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if the image doesn't exist
                  e.target.style.display = 'none';
                  
                  // Create a div with text as fallback
                  const container = e.target.parentNode;
                  container.classList.add("flex", "items-center", "justify-center");
                  
                  const fallback = document.createElement('div');
                  fallback.className = "text-4xl font-genshin text-white text-center";
                  fallback.textContent = isMultiWish ? "10-Wish Animation" : "Wish Animation";
                  container.appendChild(fallback);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        
      {/* Results display - Showing cards one by one */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl p-4">
              {results.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  className={`relative rounded-lg overflow-hidden transition-all duration-200
                           ${currentIndex >= index ? 'opacity-100' : 'opacity-0'}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={currentIndex >= index ? { 
                    scale: 1, 
                    opacity: 1,
                    y: [20, 0]
                  } : {}}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.05,
                    ease: "easeOut"
                  }}
                  style={{
                    borderColor: starColors[item.rarity],
                    borderWidth: item.rarity > 3 ? '2px' : '1px',
                    boxShadow: item.rarity >= 5 ? `0 0 20px ${starColors[item.rarity]}` : '',
                    transform: `scale(${currentIndex === index ? 1.1 : 1})`,
                    zIndex: currentIndex === index ? 10 : 1
                  }}
                >
                  {/* Background gradient based on rarity */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-b opacity-40"
                    style={{ 
                      background: `linear-gradient(to bottom, ${starColors[item.rarity]}22, ${starColors[item.rarity]}88)`
                    }}
                  ></div>
                  
                  {/* Colored circle for the item */}
                  <div className="aspect-square p-4 bg-gray-900/90 flex items-center justify-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${starColors[item.rarity]}33`,
                        boxShadow: `0 0 15px ${starColors[item.rarity]}66` 
                      }}
                    >
                      <div className="text-2xl" style={{ color: starColors[item.rarity] }}>
                        {item.rarity}★
                      </div>
                    </div>
                    
                    {/* Rarity indicator at bottom */}
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                      {[...Array(item.rarity)].map((_, i) => (
                        <div 
                          key={i}
                          className="w-3 h-3 mx-0.5" 
                          style={{ color: starColors[item.rarity] }}
                        >★</div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Item name */}
                  <div 
                    className="p-3 text-center font-medium"
                    style={{ color: item.rarity >= 4 ? starColors[item.rarity] : 'white' }}
                  >
                    {item.name}
                    {item.isLostFiftyFifty && (
                      <div className="mt-1 text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 inline-block">
                        Lost 50/50
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Skip button */}
            <div className="absolute bottom-8 right-8">
              <button
                onClick={onAnimationComplete}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 
                         rounded-lg transition-colors"
              >
                Skip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WishAnimation;