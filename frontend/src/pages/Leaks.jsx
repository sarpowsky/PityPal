// Path: frontend/src/pages/Leaks.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFirebase } from '../context/FirebaseContext';
import Icon from '../components/Icon';
import SafeImage from '../components/SafeImage';
import { AlertTriangle, Calendar, ArrowLeft, RefreshCw } from 'lucide-react';

// Character Card Component
const CharacterCard = ({ character }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden"
    >
      <div className="relative aspect-[2/3] bg-gradient-to-b from-indigo-900/50 to-purple-900/50">
        <SafeImage
          src={character.image}
          alt={character.name}
          className="w-full h-full object-cover"
          fallbackSrc="/images/characters/placeholder.png"
        />
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <h3 className="text-lg font-genshin">{character.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <img 
              src={`/elements/${character.element?.toLowerCase() || 'anemo'}.svg`}
              alt={character.element || 'Element'}
              className="w-4 h-4"
            />
            <span className="text-sm text-white/80">{character.rarity}★ {character.weapon}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Banner Card Component
const BannerCard = ({ banner, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden"
    >
      <div className="relative aspect-[16/7]">
        <SafeImage
          src={banner.image}
          alt={banner.name}
          className="w-full h-full object-cover"
          fallbackSrc="/images/banners/placeholder.png"
        />
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <h3 className="text-lg font-genshin">{banner.name}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-white/80">
            {banner.characters && (
              <div className="flex items-center gap-1">
                <Icon name="crown" size={16} />
                <span>{banner.characters.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Phase Section Component
const PhaseSection = ({ phase, index }) => {
  return (
    <div className="mb-8 animate-fadeIn" style={{ animationDelay: `${index * 150}ms` }}>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-genshin">Phase {phase.number}</h2>
        {phase.dateRange && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-sm">
            <Calendar size={14} className="text-indigo-400" />
            <span>{phase.dateRange}</span>
          </div>
        )}
      </div>
      
      {/* Banners Section */}
      {phase.banners && phase.banners.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Banners</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phase.banners.map((banner, idx) => (
              <BannerCard key={idx} banner={banner} index={idx} />
            ))}
          </div>
        </div>
      )}
      
      {/* Characters Section */}
      {phase.characters && phase.characters.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">New Characters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {phase.characters.map((character, idx) => (
              <CharacterCard key={idx} character={character} />
            ))}
          </div>
        </div>
      )}
      
      {/* Map Updates Section */}
      {phase.mapUpdates && phase.mapUpdates.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Map Updates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phase.mapUpdates.map((update, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="p-4 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10"
              >
                <h4 className="font-medium mb-2">{update.title}</h4>
                <p className="text-sm text-white/70">{update.description}</p>
                {update.image && (
                  <div className="mt-3 rounded-lg overflow-hidden">
                    <SafeImage
                      src={update.image}
                      alt={update.title}
                      className="w-full h-auto"
                      fallbackSrc="/images/maps/placeholder.png"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
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
    <div className="space-y-6 pb-32">
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
      
      {/* Phases */}
      {leaksData.phases.map((phase, index) => (
        <PhaseSection key={index} phase={phase} index={index} />
      ))}
      
      {/* Disclaimer */}
      <div className="mt-12 p-4 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10">
        <p className="text-sm text-white/60 text-center">
          All leaked content is subject to change before official release. Images and information are based on beta versions and may not represent the final product.
        </p>
      </div>
    </div>
  );
};

export default Leaks;