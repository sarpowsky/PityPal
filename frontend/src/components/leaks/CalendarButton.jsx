// Path: src/components/leaks/CalendarButton.jsx
import React from 'react';
import { Calendar } from 'lucide-react';

const CalendarButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl 
               bg-black/30 backdrop-blur-sm border border-white/10
               hover:bg-black/40 hover:border-white/20
               transition-all duration-300
               group"
    >
      <Calendar size={20} className="text-white/80 group-hover:text-white transition-colors" />
      <span className="font-medium">Version Calendar</span>
    </button>
  );
};

export default CalendarButton;