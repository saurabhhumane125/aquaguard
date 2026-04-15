import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Droplets, Clock, MapPin, CheckCircle, AlertTriangle, Radio, Users, Wrench } from 'lucide-react';
import { leakAPI } from '../../services/api';
import type { Leak } from '../../types';
import LeakMap from '../../components/shared/LeakMap';

const severityConfig: Record<string, { color: string; bg: string; dot: string }> = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
  SEVERE: { color: 'text-orange-400', bg: 'bg-orange-500/10', dot: 'bg-orange-400' },
  MODERATE: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', dot: 'bg-yellow-400' },
  MINOR: { color: 'text-slate-400', bg: 'bg-slate-500/10', dot: 'bg-slate-400' },
};

const AuthorityDashboard = () => {
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchAllLeaks = async () => {
      try {
        const response = await leakAPI.getLeaks();
        if (mounted) {
          setLeaks(response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch leaks for authority:', error);
        if (mounted) setLoading(false);
      }
    };
    
    fetchAllLeaks();
    const intervalId = setInterval(fetchAllLeaks, 5000);
    
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const criticalLeaks = leaks.filter(l => l.severity === 'CRITICAL' || l.severity === 'SEVERE').length;
  const verifiedLeaks = leaks.filter(l => l.status === 'VERIFIED').length;
  const resolvedLeaks = leaks.filter(l => l.status === 'RESOLVED').length;
  const totalWaterLoss = leaks.reduce((sum, l) => sum + (l.waterLossRate || 0), 0);

  const statCards = [
    { label: 'Critical Severity', value: criticalLeaks, icon: AlertTriangle, color: 'text-red-400', gradient: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30' },
    { label: 'Verified Pending', value: verifiedLeaks, icon: ShieldAlert, color: 'text-blue-400', gradient: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30' },
    { label: 'Est. Water Loss/hr', value: `${totalWaterLoss.toLocaleString()} L`, icon: Droplets, color: 'text-orange-400', gradient: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30' },
    { label: 'Resolved Today', value: resolvedLeaks, icon: CheckCircle, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Command Center Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 text-white shadow-2xl"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-red-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <ShieldAlert className="text-cyan-400" />
              Authority Control Center
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Delhi Jal Board (DJB) - Central District</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all">
              <Users className="h-4 w-4" />
              Dispatch Crew
            </button>
            <button className="flex items-center gap-2 bg-white/5 border border-slate-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all">
              <Radio className="h-4 w-4" />
              Generate Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
              className={`relative overflow-hidden bg-slate-900/60 backdrop-blur-sm border ${stat.border} p-5 rounded-2xl`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-40`} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{stat.label}</p>
                </div>
                <p className="text-3xl font-black text-white">{stat.value}</p>
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
          className="lg:col-span-2"
        >
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-400" />
                City-Wide Heatmap
              </h2>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Real-time
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-700/30">
              <LeakMap leaks={leaks} height="500px" />
            </div>
          </div>
        </motion.div>

        {/* Action Queue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl h-[580px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Wrench className="h-5 w-5 text-slate-400" />
                Action Queue
              </h2>
              <span className="text-[10px] font-bold bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full border border-red-500/20">
                {criticalLeaks} critical
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse p-3 rounded-xl bg-slate-800/30">
                      <div className="h-4 bg-slate-700 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-slate-800 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              ) : leaks.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle className="h-10 w-10 text-emerald-500/30 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No active reports</p>
                </div>
              ) : (
                <AnimatePresence>
                  {leaks.sort((a, b) => b.priorityScore - a.priorityScore).map((leak, i) => {
                    const sevConfig = severityConfig[leak.severity] || severityConfig.MODERATE;
                    return (
                      <motion.div
                        key={leak.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 * i }}
                        className="p-3 border border-slate-700/30 rounded-xl hover:bg-white/[0.02] transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${sevConfig.dot}`} />
                            <span className="font-bold text-white text-sm">Priority {leak.priorityScore}/100</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            <Clock className="h-3 w-3 inline mr-0.5" />
                            {new Date(leak.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-slate-400 mb-2 truncate flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
                          {leak.address}
                        </p>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sevConfig.bg} ${sevConfig.color}`}>
                            {leak.category.replace('_', ' ').toLowerCase()}
                          </span>
                          <button className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-all">
                            Review & Assign →
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
