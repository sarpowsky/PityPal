// src/features/banners/BannerCountdown.jsx
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getRemainingTime } from '../../data/banners';

const CountdownUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="px-2 py-1 rounded bg-black/40 backdrop-blur-sm 
                  text-sm font-medium min-w-[2.5rem] text-center">
      {value.toString().padStart(2, '0')}
    </div>
    <div className="text-[10px] text-white/60 mt-1">{label}</div>
  </div>
);

const BannerCountdown = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState(getRemainingTime(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getRemainingTime(endDate);
      if (remaining.days < 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft || timeLeft.days < 0) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1 text-white/80">
        <Clock size={14} />
        <span className="text-xs">Ends in:</span>
      </div>
      
      <div className="flex items-center gap-2">
        <CountdownUnit value={timeLeft.days} label="DAYS" />
        <CountdownUnit value={timeLeft.hours} label="HOURS" />
        <CountdownUnit value={timeLeft.minutes} label="MINS" />
        <CountdownUnit value={timeLeft.seconds} label="SECS" />
      </div>
    </div>
  );
};

export default BannerCountdown;