import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ homeButtonRef }) => {
  const location = useLocation();
  
  const links = [
    { to: '/', icon: '/icons/navigation/home.png', label: 'Home' },
    { to: '/history', icon: '/icons/navigation/history.png', label: 'History' },
    { to: '/analytics', icon: '/icons/navigation/analytics.png', label: 'Analytics' },
    { to: '/simulator', icon: '/icons/navigation/simulator.png', label: 'Simulator' },
    { to: '/settings', icon: '/icons/navigation/settings.png', label: 'Settings' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8 pointer-events-none z-40">
      <nav className="pointer-events-auto">
        <div className="p-2 bg-black/20 backdrop-blur-md rounded-full 
                    border border-white/10
                    transition-all duration-300 ease-in-out
                    shadow-lg hover:shadow-purple-500/20">
          <div className="flex items-center gap-1">
            {links.map(({ to, icon, label }, index) => {
              const isActive = location.pathname === to;
              // Get ref for home button
              const ref = to === '/' ? homeButtonRef : null;
              
              return (
                <Link
                  key={to}
                  to={to}
                  className="relative group"
                  ref={ref}
                >
                  <div className={`p-4 rounded-full transition-all duration-300 ease-out
                               relative overflow-hidden
                               ${isActive 
                                 ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                                 : 'hover:bg-white/10'}`}
                  >
                    {/* Icon */}
                    <img 
                      src={icon}
                      alt={label}
                      width={36}
                      height={36}
                      className={`transform transition-all duration-300
                        ${isActive ? 'scale-110 brightness-125' : 'opacity-60 group-hover:opacity-100'}`}
                    />
                    
                    {/* Active Glow Effect */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-purple-500/20 
                                  animate-pulse-fast blur-sm -z-10" />
                    )}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 
                               px-4 py-2 bg-black/90 rounded-lg
                               opacity-0 group-hover:opacity-100
                               transition-all duration-300 ease-out
                               translate-y-2 group-hover:translate-y-0
                               pointer-events-none">
                    <span className="text-white text-xs whitespace-nowrap">{label}</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 
                                 w-2 h-2 bg-black/90 rotate-45" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;