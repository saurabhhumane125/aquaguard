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
    <div className="md:hidden fixed bottom-5 left-4 right-4 z-50">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/30 rounded-2xl p-2 px-5 flex justify-between items-center">
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
                <div className="absolute top-0 w-14 h-14 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 transform transition-transform hover:scale-105 active:scale-95 border-2 border-slate-900">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              ) : (
                <>
                  <Icon 
                    className={`h-5 w-5 mb-0.5 transition-all duration-300 ${
                      isActive ? 'text-cyan-400 drop-shadow-md' : 'text-slate-500'
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-[9px] font-medium ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="bottom-nav-indicator"
                      className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-cyan-400"
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
