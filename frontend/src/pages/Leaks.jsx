// Path: frontend/src/pages/Leaks.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFirebase } from '../context/FirebaseContext';
import Icon from '../components/Icon';
import SafeImage from '../components/SafeImage';
import { AlertTriangle, Calendar, ArrowLeft, RefreshCw, Telescope, MapPin, Compass, Image } from 'lucide-react';

// Character Card Component - Vertical design
const CharacterCard = ({ character }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden"
    >
      <div className="relative aspect-[2/3] bg-gradient-to-b from-indigo-900/50 to-purple-900/50">
        <SafeImage
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover"
          fallbackSrc="/images/characters/placeholder.png"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <h3 className="text-sm font-medium">{character.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <img 
              src={`/elements/${character.element?.toLowerCase() || 'anemo'}.svg`}
              alt={character.element || 'Element'}
              className="w-3 h-3"
            />
            <span className="text-xs text-white/80">{character.rarity}★ {character.weapon}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Banner Card Component - More compact design
const BannerCard = ({ banner, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden"
    >
      <div className="relative h-32">
        <SafeImage
          src={banner.image}
          alt={banner.name}
          className="w-full h-full object-cover"
          fallbackSrc="/images/banners/placeholder.png"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <h3 className="text-sm font-medium">{banner.name}</h3>
          {banner.characters && (
            <div className="flex items-center gap-1 mt-1 text-xs text-white/80">
              <Image size={12} />
              <span className="truncate">{banner.characters.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Map Update Card Component - With larger images
const MapUpdateCard = ({ update, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 h-full"
    >
      <h4 className="text-sm font-medium mb-2">{update.title}</h4>
      <p className="text-xs text-white/70 mb-3">{update.description}</p>
      {update.image && (
        <div className="rounded-lg overflow-hidden">
          <SafeImage
            src={update.image}
            alt={update.title}
            className="w-full h-96 object-contain"
            fallbackSrc="/images/maps/placeholder.png"
          />
        </div>
      )}
    </motion.div>
  );
};

// Main Leaks Page Component
const Leaks = () => {
  const { getLeaks, isLoading, error } = useFirebase();
  const [leaksData, setLeaksData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load leaks data
  useEffect(() => {
    const loadLeaksData = async () => {
      try {
        setLoading(true);
        const data = await getLeaks();
        setLeaksData(data);
      } catch (err) {
        console.error('Error loading leaks data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeaksData();
  }, [getLeaks]);
  
  // Handle refresh
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await getLeaks();
      setLeaksData(data);
    } catch (err) {
      console.error('Error refreshing leaks data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-t-indigo-500 border-white/20 rounded-full animate-spin"></div>
        <p className="mt-4 text-white/70">Loading leaks data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
        <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">Error Loading Leaks</h2>
        <p className="text-white/70">{error}</p>
      </div>
    );
  }
  
  if (!leaksData || !leaksData.phases || leaksData.phases.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
        <Icon name="info" size={48} className="mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">No Leaks Available</h2>
        <p className="text-white/70">There are no leaks available at this time. Check back later for updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} />
          </motion.button>
          <h1 className="text-2xl font-genshin bg-gradient-to-r from-indigo-300 
                       via-purple-300 to-pink-300 text-transparent bg-clip-text">
            Upcoming Content (Beta)
          </h1>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          disabled={loading}
        >
          <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </div>
      
      {/* Version info and disclaimer */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-genshin">Version {leaksData.version}</h2>
            {leaksData.lastUpdated && (
              <p className="text-sm text-white/60">
                Last updated: {new Date(leaksData.lastUpdated).toLocaleDateString()}
              </p>
            )}
          </div>
          
          <div className="px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>Beta Information - Subject to Change</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content in two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Phase 1 and Characters */}
        <div className="space-y-6">
          {/* Phase 1 */}
          {leaksData.phases[0] && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-genshin">Phase {leaksData.phases[0].number}</h2>
                {leaksData.phases[0].dateRange && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-sm">
                    <Calendar size={14} className="text-indigo-400" />
                    <span>{leaksData.phases[0].dateRange}</span>
                  </div>
                )}
              </div>
              
              {/* Banners section */}
              {leaksData.phases[0].banners && leaksData.phases[0].banners.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Telescope size={16} className="text-amber-400" />
                    <span>Banners</span>
                  </h3>
                  <div className="space-y-4">
                    {leaksData.phases[0].banners.map((banner, idx) => (
                      <BannerCard key={idx} banner={banner} index={idx} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* All Characters (from all phases) */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <MapPin size={20} className="text-purple-400" />
              <span>New Characters</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {leaksData.phases.flatMap((phase, phaseIdx) => 
                phase.characters ? phase.characters.map((character, idx) => (
                  <CharacterCard key={`${phaseIdx}-${idx}`} character={character} />
                )) : []
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Phase 2 and Map Updates */}
        <div className="space-y-6">
          {/* Phase 2 */}
          {leaksData.phases[1] && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-genshin">Phase {leaksData.phases[1].number}</h2>
                {leaksData.phases[1].dateRange && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-sm">
                    <Calendar size={14} className="text-indigo-400" />
                    <span>{leaksData.phases[1].dateRange}</span>
                  </div>
                )}
              </div>
              
              {/* Banners section */}
              {leaksData.phases[1].banners && leaksData.phases[1].banners.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Telescope size={16} className="text-amber-400" />
                    <span>Banners</span>
                  </h3>
                  <div className="space-y-4">
                    {leaksData.phases[1].banners.map((banner, idx) => (
                      <BannerCard key={idx} banner={banner} index={idx} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* All Map Updates (from all phases) */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Compass size={18} className="text-emerald-400" />
              <span>Map Updates</span>
            </h3>
            <div className="space-y-4">
              {leaksData.phases.flatMap((phase, phaseIdx) => 
                phase.mapUpdates ? phase.mapUpdates.map((update, idx) => (
                  <MapUpdateCard key={`${phaseIdx}-${idx}`} update={update} index={idx} />
                )) : []
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-8 p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10">
        <p className="text-xs text-white/60 text-center">
          All leaked content is subject to change before official release. Images and information are based on beta versions and may not represent the final product.
        </p>
      </div>
    </div>
  );
};

export default Leaks;