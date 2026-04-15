import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, LogOut, Search, Bell } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center group">
              <div className="bg-gradient-to-br from-primary-500 to-cyan-400 p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-cyan-500/20">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary-900 to-gray-900 tracking-tight">
                AquaGuard
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-4">
            
            <button className="p-2 text-gray-400 hover:text-cyan-600 transition-colors rounded-full hover:bg-gray-50 group relative hidden sm:block">
              <Search className="h-5 w-5" />
            </button>
            
            <button className="p-2 text-gray-400 hover:text-cyan-600 transition-colors rounded-full hover:bg-gray-50 relative group">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </button>

            <div className="relative ml-2">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-100 to-primary-100 border border-cyan-200 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm overflow-hidden">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-50 focus:outline-none overflow-hidden origin-top-right border border-gray-100"
                  >
                    <div className="px-4 py-4 bg-gradient-to-b from-gray-50 to-white">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || user?.phone || 'Water Savior'}</p>
                      
                      <div className="mt-3 bg-cyan-50 border border-cyan-100 px-3 py-2 rounded-lg flex items-center justify-between">
                        <span className="text-xs font-semibold text-cyan-800">Points</span>
                        <span className="text-sm font-black text-cyan-600">{user?.points || 0}</span>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors font-medium"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
