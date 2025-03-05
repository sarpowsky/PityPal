// Path: frontend/src/pages/Reminders.jsx
import React, { useState } from 'react';
import { BellRing, Plus, Calendar, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import RemindersList from '../components/reminders/RemindersList';
import CustomReminderDialog from '../components/reminders/CustomReminderDialog';

const InfoCard = ({ title, children }) => (
  <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-2">
    <Info className="text-indigo-400 mt-0.5 shrink-0" size={16} />
    <div>
      <h3 className="text-sm font-medium text-indigo-400 mb-1">{title}</h3>
      <div className="text-xs text-white/70">{children}</div>
    </div>
  </div>
);

const ReminderTypes = [
  {
    id: 'banner',
    title: 'Banner Reminders',
    description: 'Get notified before banner endings',
    icon: Calendar,
    color: 'bg-indigo-500/20 text-indigo-400',
    hint: 'Set from banner details'
  },
  {
    id: 'pity',
    title: 'Pity Reminders',
    description: 'Get notified when approaching soft pity',
    icon: AlertCircle,
    color: 'bg-purple-500/20 text-purple-400',
    hint: 'Set from the Home page'
  },
  {
    id: 'custom',
    title: 'Custom Reminders',
    description: 'Create personalized reminders',
    icon: BellRing,
    color: 'bg-green-500/20 text-green-400',
    hint: 'Create using the + button'
  }
];

const Reminders = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  return (
    <div className="space-y-6 pb-32 max-w-2xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-genshin bg-gradient-to-r from-indigo-300 
                       via-purple-300 to-pink-300 text-transparent bg-clip-text">
            Reminders
          </h1>
          <p className="text-white/60 mt-1">
            Never miss banner endings or soft pity
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateDialog(true)}
          className="p-2 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30
                   border border-indigo-500/30 text-indigo-400 transition-colors"
        >
          <Plus size={20} />
        </button>
      </header>
      
      <InfoCard title="About Reminders">
        <p>Reminders will notify you about important events like banner endings 
        and when you're approaching soft pity. Notifications will appear even if 
        the app is not currently open.</p>
      </InfoCard>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ReminderTypes.map((type) => (
          <div key={type.id} 
               className="p-4 rounded-lg bg-black/20 backdrop-blur-sm 
                        border border-white/10 hover:bg-black/30 
                        transition-all animate-fadeIn">
            <div className={`w-10 h-10 rounded-lg ${type.color} flex 
                           items-center justify-center mb-3`}>
              <type.icon size={20} />
            </div>
            <h3 className="font-medium mb-1">{type.title}</h3>
            <p className="text-sm text-white/60">{type.description}</p>
            <div className="mt-2 text-xs border border-white/10 bg-white/5 
                          px-2 py-1 rounded text-white/50 inline-block">
              {type.hint}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-black/20 backdrop-blur-sm rounded-xl 
                    border border-white/10 p-4">
        <h2 className="text-lg font-genshin mb-4">Active Reminders</h2>
        <RemindersList />
      </div>
      
      {showCreateDialog && (
        <CustomReminderDialog onClose={() => setShowCreateDialog(false)} />
      )}
    </div>
  );
};

export default Reminders;