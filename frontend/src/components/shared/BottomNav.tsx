import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Trophy, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  if (!user) return null;

  const citizenNav = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Report', path: '/report', icon: PlusCircle, isPrimary: true },
    { name: 'Ranks', path: '/leaderboard', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const navItems = user.role === 'AUTHORITY' ? [] : citizenNav;

  if (navItems.length === 0) return null;

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-2 px-6 flex justify-between items-center relative isolation-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-14 h-14 ${
                item.isPrimary ? '-mt-8' : ''
              }`}
            >
              {item.isPrimary ? (
                <div className="absolute top-0 w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 transform transition-transform hover:scale-105 active:scale-95 border-4 border-gray-50">
                  <Icon className="h-7 w-7 text-white" />
                </div>
              ) : (
                <>
                  <Icon 
                    className={`h-6 w-6 mb-1 transition-all duration-300 ${
                      isActive ? 'text-cyan-600 drop-shadow-md' : 'text-gray-400'
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <motion.div 
                      layoutId="bottom-nav-indicator"
                      className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-500"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
