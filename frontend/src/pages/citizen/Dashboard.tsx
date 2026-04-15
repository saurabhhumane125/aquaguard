import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, TrendingUp, Map as MapIcon, ArrowRight, ShieldCheck, Clock, Zap, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { leakAPI } from '../../services/api';
import type { Leak } from '../../types';
import LeakMap from '../../components/shared/LeakMap';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  RESOLVED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  VERIFIED: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  REPORTED: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  REJECTED: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  ASSIGNED: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', dot: 'bg-indigo-400' },
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const [recentLeaks, setRecentLeaks] = useState<Leak[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    { label: 'Total Points', value: user?.points || 0, icon: Droplets, color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/20' },
    { label: 'Trust Score', value: `${user?.trustScore || 100}%`, icon: ShieldCheck, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/20' },
    { label: 'Active Reports', value: recentLeaks.filter(l => l.status !== 'RESOLVED' && l.status !== 'REJECTED').length, icon: TrendingUp, color: 'text-orange-400', gradient: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/20' },
  ];

  useEffect(() => {
    let mounted = true;
    
    const fetchLeaks = async () => {
      try {
        const response = await leakAPI.getMyLeaks();
        if (mounted) {
          setRecentLeaks(response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch leaks:', error);
        if (mounted) setLoading(false);
      }
    };
    
    fetchLeaks();
    const intervalId = setInterval(fetchLeaks, 5000);
    
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-black mb-2"
          >
            Hello, {user?.name?.split(' ')[0]}! 👋
          </motion.h1>
          <p className="text-indigo-200/70 max-w-lg mb-6 text-sm">
            Ready to be a water hero today? Every leak you report helps your city conserve millions of liters.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Zap className="h-4 w-4" />
            Report a Leak
            <ArrowRight size={16} />
          </Link>
        </div>

        <Droplets className="absolute -right-6 -bottom-6 h-40 w-40 text-indigo-800/30" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
              className={`relative overflow-hidden bg-slate-900/60 backdrop-blur-sm border ${stat.border} p-4 rounded-2xl`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className="text-xl font-black text-white">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-cyan-400" />
                Active Leaks Map
              </h2>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live Data
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-700/30">
              <LeakMap leaks={recentLeaks} height="350px" />
            </div>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl h-full flex flex-col">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" />
              Your Recent Reports
            </h2>
            
            {loading ? (
              <div className="space-y-3 flex-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-3/4" />
                      <div className="h-3 bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentLeaks.length > 0 ? (
              <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                <AnimatePresence>
                  {recentLeaks.slice(0, 6).map((leak, i) => {
                    const sc = statusColors[leak.status] || statusColors.REPORTED;
                    return (
                      <motion.div
                        key={leak.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="p-3 rounded-xl border border-slate-700/30 hover:bg-white/[0.02] transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                              <p className="font-semibold text-white text-sm truncate">
                                {leak.category.replace('_', ' ')}
                              </p>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5 ml-5">
                              {leak.address}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                            {new Date(leak.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2 ml-5">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                            {leak.status}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-10 flex-1 flex flex-col items-center justify-center">
                <Droplets className="mx-auto h-10 w-10 text-slate-600 mb-3" />
                <p className="text-sm text-slate-400 mb-2">No leaks reported yet.</p>
                <Link
                  to="/report"
                  className="text-sm text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
                >
                  Report your first leak →
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
