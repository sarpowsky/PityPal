// Path: src/pages/Leaks.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, RefreshCw, Telescope, MapPin, Compass, BookOpen, Skull, Calendar } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import Icon from '../components/Icon';

// Import modular components
import DetailModal from '../components/leaks/modals/DetailModal';
import VersionSelector from '../components/leaks/VersionSelector';
import CalendarButton from '../components/leaks/CalendarButton';
import PrimogemButton from '../components/leaks/PrimogemButton';
import CharacterCard from '../components/leaks/cards/CharacterCard';
import BannerCard from '../components/leaks/cards/BannerCard';
import EventCard from '../components/leaks/cards/EventCard';
import MapUpdateCard from '../components/leaks/cards/MapUpdateCard';
import BossCard from '../components/leaks/cards/BossCard';
import QuestCard from '../components/leaks/cards/QuestCard';
import CharacterDetailContent from '../components/leaks/details/CharacterDetailContent';
import BannerDetailContent from '../components/leaks/details/BannerDetailContent';
import MapDetailContent from '../components/leaks/details/MapDetailContent';
import EventDetailContent from '../components/leaks/details/EventDetailContent';
import BossDetailContent from '../components/leaks/details/BossDetailContent';
import QuestDetailContent from '../components/leaks/details/QuestDetailContent';
import PrimogemDetailContent from '../components/leaks/details/PrimogemDetailContent';

// Import utility functions
import { getAllItemsFromPhases, formatLeaksData } from '../components/leaks/utils/leaksUtils';
import SafeImage from '../components/SafeImage';

const Leaks = () => {
  const { getLeaks, isLoading, error, refreshContent } = useFirebase();
  const [leaksData, setLeaksData] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [modalContent, setModalContent] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showPrimogemModal, setShowPrimogemModal] = useState(false);

  // Load leaks data
  useEffect(() => {
    const loadLeaksData = async () => {
      try {
        setLoading(true);
        const data = await getLeaks();
        
        if (data) {
          const formattedData = formatLeaksData(data);
          setLeaksData(formattedData);
          setVersions(formattedData.versions);
          
          if (formattedData.versions.length > 0) {
            setSelectedVersion(formattedData.versions[0]);
          }
        }
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
      setRefreshing(true);
      await refreshContent();
      
      // Reload data after refresh
      const data = await getLeaks();
      
      if (data) {
        const formattedData = formatLeaksData(data);
        setLeaksData(formattedData);
        setVersions(formattedData.versions);
        
        // Keep the same selected version if it exists, otherwise select the first
        if (selectedVersion && formattedData.versions.length > 0) {
          const sameVersion = formattedData.versions.find(v => v.version === selectedVersion.version);
          setSelectedVersion(sameVersion || formattedData.versions[0]);
        } else if (formattedData.versions.length > 0) {
          setSelectedVersion(formattedData.versions[0]);
        }
      }
    } catch (err) {
      console.error('Error refreshing leaks data:', err);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle version selection
  const handleVersionSelect = (version) => {
    setSelectedVersion(version);
  };
  
  // Open modal with specific content
  const openModal = (content) => {
    setModalContent(content);
  };
  
  // Close any open modal
  const closeModal = () => {
    setModalContent(null);
    setShowCalendarModal(false);
    setShowPrimogemModal(false);
  };
  
  // Open calendar modal
  const openCalendarModal = () => {
    setShowCalendarModal(true);
  };
  
  // Open primogem modal
  const openPrimogemModal = () => {
    setShowPrimogemModal(true);
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
  
  if (!leaksData || !versions || versions.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
        <Icon name="info" size={48} className="mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">No Leaks Available</h2>
        <p className="text-white/70">There are no leaks available at this time. Check back later for updates.</p>
      </div>
    );
  }
  
  // Get all items from all phases
  const allBanners = selectedVersion ? getAllItemsFromPhases(selectedVersion, 'banners') : [];
  const allCharacters = selectedVersion ? getAllItemsFromPhases(selectedVersion, 'characters') : [];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header with back button and version selector */}
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
            Upcoming Content
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedVersion && selectedVersion.calendar && (
            <CalendarButton onClick={openCalendarModal} />
          )}
          
          {selectedVersion && selectedVersion.primogemCount && (
            <PrimogemButton onClick={openPrimogemModal} />
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors
                       ${refreshing ? 'cursor-not-allowed opacity-50' : ''}`}
            disabled={refreshing}
          >
            <RefreshCw size={24} className={refreshing ? 'animate-spin' : ''} />
          </motion.button>
        </div>
      </div>
      
      {/* Version selector and info */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <VersionSelector 
              versions={versions}
              selectedVersion={selectedVersion}
              onSelectVersion={handleVersionSelect}
            />
            
            {selectedVersion && selectedVersion.title && (
              <div className="text-lg font-genshin">{selectedVersion.title}</div>
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
      
      {/* Main content in sections by type */}
      {selectedVersion && (
        <div className="space-y-8">
          {/* Banners Section - All banners in one section */}
          {allBanners.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Telescope size={20} className="text-amber-400" />
                <span>Upcoming Banners</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allBanners.map((banner, idx) => (
                  <BannerCard 
                    key={`banner-${idx}`} 
                    banner={banner} 
                    index={idx}
                    onClick={() => openModal({
                      type: 'banner',
                      title: banner.name,
                      data: banner
                    })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Characters Section - All characters in one section */}
          {allCharacters.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <MapPin size={20} className="text-purple-400" />
                <span>New Characters</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {allCharacters.map((character, idx) => (
                  <CharacterCard 
                    key={`character-${idx}`} 
                    character={character}
                    onClick={() => openModal({
                      type: 'character',
                      title: character.name,
                      data: character
                    })}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Events Section */}
          {selectedVersion.events && selectedVersion.events.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Calendar size={20} className="text-amber-400" />
                <span>Events</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedVersion.events.map((event, idx) => (
                  <EventCard 
                    key={idx} 
                    event={event} 
                    index={idx}
                    onClick={() => openModal({
                      type: 'event',
                      title: event.name,
                      data: event
                    })}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Map Updates Section */}
          {selectedVersion.mapUpdates && selectedVersion.mapUpdates.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Compass size={18} className="text-emerald-400" />
                <span>Map Updates</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedVersion.mapUpdates.map((update, idx) => (
                  <MapUpdateCard 
                    key={idx} 
                    update={update} 
                    index={idx}
                    onClick={() => openModal({
                      type: 'map',
                      title: update.title,
                      data: update
                    })}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Bosses Section */}
          {selectedVersion.bosses && selectedVersion.bosses.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Skull size={20} className="text-red-400" />
                <span>New Bosses</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedVersion.bosses.map((boss, idx) => (
                  <BossCard 
                    key={idx} 
                    boss={boss} 
                    index={idx}
                    onClick={() => openModal({
                      type: 'boss',
                      title: boss.name,
                      data: boss
                    })}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Quests Section */}
          {selectedVersion.quests && selectedVersion.quests.length > 0 && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-400" />
                <span>New Quests</span>
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {selectedVersion.quests.map((quest, idx) => (
                  <QuestCard 
                    key={idx} 
                    quest={quest} 
                    index={idx}
                    onClick={() => openModal({
                      type: 'quest',
                      title: quest.title,
                      data: quest
                    })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Disclaimer */}
      <div className="mt-8 p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10">
        <p className="text-xs text-white/60 text-center">
          All leaked content is subject to change before official release. Images and information are based on beta versions and may not represent the final product.
        </p>
      </div>
      
      {/* Content Detail Modal */}
      {modalContent && (
        <DetailModal
          isOpen={!!modalContent}
          onClose={closeModal}
          title={modalContent.title}
        >
          {modalContent.type === 'character' && (
            <CharacterDetailContent character={modalContent.data} />
          )}
          {modalContent.type === 'banner' && (
            <BannerDetailContent banner={modalContent.data} />
          )}
          {modalContent.type === 'map' && (
            <MapDetailContent update={modalContent.data} />
          )}
          {modalContent.type === 'event' && (
            <EventDetailContent event={modalContent.data} />
          )}
          {modalContent.type === 'boss' && (
            <BossDetailContent boss={modalContent.data} />
          )}
          {modalContent.type === 'quest' && (
            <QuestDetailContent quest={modalContent.data} />
          )}
        </DetailModal>
      )}
      
      {/* Calendar Modal */}
      {showCalendarModal && selectedVersion && selectedVersion.calendar && (
        <DetailModal
          isOpen={showCalendarModal}
          onClose={closeModal}
          title={`Version ${selectedVersion.version} Calendar`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="max-w-full overflow-auto">
              <SafeImage
                src={selectedVersion.calendar}
                alt={`Version ${selectedVersion.version} Calendar`}
                className="max-w-4xl w-full h-auto object-contain"
                fallbackSrc="/images/calendars/placeholder.png"
              />
            </div>
            
            <p className="text-sm text-white/60 text-center">
              This calendar shows the expected schedule for Version {selectedVersion.version}.
              All dates are subject to change.
            </p>
          </div>
        </DetailModal>
      )}
      
      {/* Primogem Modal */}
      {showPrimogemModal && selectedVersion && selectedVersion.primogemCount && (
        <DetailModal
          isOpen={showPrimogemModal}
          onClose={closeModal}
          title={`Version ${selectedVersion.version} Primogem Count`}
        >
          <PrimogemDetailContent versionData={selectedVersion} />
        </DetailModal>
      )}
    </div>
  );
};

export default Leaks;