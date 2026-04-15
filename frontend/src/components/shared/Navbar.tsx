import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, LogOut, Bell } from 'lucide-react';
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
    <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg shadow-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center group">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-cyan-500/20">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-white tracking-tight">
                AquaGuard
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-white/5 relative group">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </button>

            <div className="relative ml-2">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 border-2 border-slate-700 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/10">
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
                    className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl bg-slate-900 ring-1 ring-slate-700 divide-y divide-slate-800 overflow-hidden origin-top-right border border-slate-700/50"
                  >
                    <div className="px-4 py-4 bg-gradient-to-b from-slate-800/50 to-slate-900">
                      <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || user?.phone || 'Water Savior'}</p>
                      
                      <div className="mt-3 bg-cyan-500/10 border border-cyan-500/20 px-3 py-2 rounded-lg flex items-center justify-between">
                        <span className="text-xs font-semibold text-cyan-300">Points</span>
                        <span className="text-sm font-black text-cyan-400">{user?.points || 0}</span>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfile(false)}
                        className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/5 flex items-center transition-colors font-medium"
                      >
                        👤 View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center transition-colors font-medium"
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
