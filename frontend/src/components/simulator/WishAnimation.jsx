// Path: frontend/src/components/simulator/WishAnimation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../../features/audio/AudioSystem';

const starColors = {
  3: '#4D6B96', // Blue
  4: '#A56CC1', // Purple
  5: '#C0973A'  // Gold
};

// Animation video paths
const animationPaths = {
  threeStarSingle: '/animations/3star-single.mp4',
  fourStarSingle: '/animations/4star-single.mp4',
  fiveStarSingle: '/animations/5star-single.mp4',
  threeStarMulti: '/animations/3star-multi.mp4',
  fourStarMulti: '/animations/4star-multi.mp4',
  fiveStarMulti: '/animations/5star-multi.mp4',
  capturingRadiance: '/animations/capturing-radiance.mp4'
};

// Audio paths
const audioPaths = {
  threeStarReveal: '/audio/3star-reveal.mp3',
  fourStarReveal: '/audio/4star-reveal.mp3',
  fiveStarReveal: '/audio/5star-reveal.mp3',
  capturingRadianceReveal: '/audio/capturing-radiance-reveal.mp3',
  wishClick: '/audio/wish-click.mp3',
  wishResultAppear: '/audio/result-appear.mp3',
  qiqiEasterEgg: '/audio/qiqi-easter-egg.mp3' // Easter egg sound for Qiqi
};

const WishAnimation = ({ results, onAnimationComplete, simulationState }) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [animationSource, setAnimationSource] = useState('');
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const { playAudio } = useAudio();
  
  // Function to determine which animation to show
  const determineAnimation = () => {
    if (!results || results.length === 0) return '';
    
    const isMultiWish = results.length > 1;
    const hasCapturingRadiance = results.some(item => item.isCapturingRadiance);
    const hasFiveStar = results.some(item => item.rarity === 5);
    const hasFourStar = results.some(item => item.rarity === 4);
    
    // Animation priority: Capturing Radiance > 5★ > 4★ > 3★
    if (hasCapturingRadiance) {
      return animationPaths.capturingRadiance;
    } else if (hasFiveStar) {
      return isMultiWish ? animationPaths.fiveStarMulti : animationPaths.fiveStarSingle;
    } else if (hasFourStar) {
      return isMultiWish ? animationPaths.fourStarMulti : animationPaths.fourStarSingle;
    } else {
      return isMultiWish ? animationPaths.threeStarMulti : animationPaths.threeStarSingle;
    }
  };
  
  // Play sound
  const playSound = (src) => {
    // Create and play audio using Web Audio API for better browser compatibility
    const audio = new Audio(src);
    audio.volume = 1.0;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Audio play error:", error);
      });
    }
  };
  
  // Function to play appropriate sound for the wish
  const playWishSound = () => {
    if (!results || results.length === 0) return;
    
    // Check for Qiqi easter egg first
    const hasQiqi = results.some(item => 
      item.name === "Qiqi" && 
      (simulationState?.bannerType?.startsWith('character') || 
       simulationState?.bannerType === 'permanent')
    );
    
    if (hasQiqi) {
      playSound(audioPaths.qiqiEasterEgg);
      return;
    }
    
    // Regular sound logic
    const hasCapturingRadiance = results.some(item => item.isCapturingRadiance);
    const hasFiveStar = results.some(item => item.rarity === 5);
    const hasFourStar = results.some(item => item.rarity === 4);
    
    if (hasCapturingRadiance) {
      playSound(audioPaths.capturingRadianceReveal);
    } else if (hasFiveStar) {
      playSound(audioPaths.fiveStarReveal);
    } else if (hasFourStar) {
      playSound(audioPaths.fourStarReveal);
    } else {
      playSound(audioPaths.threeStarReveal);
    }
  };
  
  // Handle video loaded metadata
  const handleVideoLoaded = () => {
    console.log("Video metadata loaded");
    setVideoLoaded(true);
    
    // Try to play video with explicit user interaction simulation
    if (videoRef.current) {
      videoRef.current.muted = true; // Start muted for autoplay policy
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Video playing successfully");
            // Unmute after successful play (after a short delay)
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.muted = false;
              }
            }, 100);
          })
          .catch(error => {
            console.error("Video play error:", error);
            setVideoError(true);
            // Go directly to results if video won't play
            handleVideoComplete();
          });
      }
    }
  };
  
  // Handle video play error
  const handleVideoError = (e) => {
    console.error("Video error:", e);
    setVideoError(true);
    // Go directly to results if video has error
    handleVideoComplete();
  };
  
  // Handle video ended or skipped
  const handleVideoComplete = () => {
    // Stop video if still playing
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    // Play wish sound for the appropriate star level
    playWishSound();
    
    // Show results
    setShowResults(true);
    showItemsSequentially();
  };
  
  // Skip button handler
  const handleSkip = () => {
    if (!showResults) {
      // If video is still playing, skip to results
      handleVideoComplete();
    } else {
      // If results are showing, close the animation completely
      onAnimationComplete();
    }
  };
  
  // Show each item in sequence
  const showItemsSequentially = () => {
    // Show items one by one
    let index = 0;
    const interval = setInterval(() => {
      if (index < results.length) {
        setCurrentIndex(index);
        playSound(audioPaths.wishResultAppear);
        index++;
      } else {
        clearInterval(interval);
        // Do not automatically close - user must click skip
      }
    }, 300);
  };
  
  // Initialize animation when results change
  useEffect(() => {
    if (results && results.length > 0) {
      // Reset state
      setCurrentIndex(-1);
      setShowResults(false);
      setVideoLoaded(false);
      setVideoError(false);
      
      // Determine animation to show
      const animSrc = determineAnimation();
      setAnimationSource(animSrc);
      
      // Play click sound
      playSound(audioPaths.wishClick);
    }
  }, [results]);
  
  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-50 bg-black flex items-center justify-center" 
         style={{ margin: 0, height: '100vh', width: '100vw' }}>
      
      {/* Skip button - always visible, fixed position */}
      <div className="fixed bottom-8 right-8 z-[999]">
        <button
          onClick={handleSkip}
          className="px-6 py-2 bg-black/70 hover:bg-black/90 
                   text-white font-medium border border-white/30
                   rounded-lg transition-colors animate-pulse"
        >
          {showResults ? "Close" : "Skip"}
        </button>
      </div>
      
      {/* Initial animation */}
      <AnimatePresence>
        {!showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 top-0 left-0 right-0 bottom-0 w-full h-full overflow-hidden"
          >
            {animationSource && !videoError ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                onLoadedMetadata={handleVideoLoaded}
                onError={handleVideoError}
                onEnded={handleVideoComplete}
                playsInline
                src={animationSource}
                preload="auto"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl font-genshin text-white text-center">
                  {results && results.length > 1 ? "10-Wish Animation" : "Wish Animation"}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
        
      {/* Results display */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl p-4 pb-20">
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
                    
                    {/* Capturing Radiance indicator */}
                    {item.isCapturingRadiance && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/80 
                                    text-white text-xs rounded-full animate-pulse">
                        Capturing Radiance!
                      </div>
                    )}
                  </div>
                  
                  {/* Item name */}
                  <div 
                    className="p-3 text-center font-medium"
                    style={{ color: item.rarity >= 4 ? starColors[item.rarity] : 'white' }}
                  >
                    {item.name}
                    <div className="flex flex-col items-center gap-1 mt-1">
                      {item.isLostFiftyFifty && (
                        <div className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 inline-block">
                          Lost 50/50
                        </div>
                      )}
                      {item.isCapturingRadiance && (
                        <div className="text-xs px-2 py-0.5 rounded bg-yellow-500/40 text-white inline-block">
                          Capturing Radiance
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WishAnimation;