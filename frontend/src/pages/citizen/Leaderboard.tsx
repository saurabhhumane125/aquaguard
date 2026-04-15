import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, MapPin, TrendingUp, Flame, Star, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { authAPI } from '../../services/api';

interface LeaderEntry {
  id: string;
  name: string;
  points: number;
  leaksReported: number;
  badge: string;
  isCurrent?: boolean;
}

const badgeColors: Record<string, { bg: string; text: string; border: string }> = {
  'Water Savior': { bg: 'bg-gradient-to-r from-yellow-400/20 to-amber-400/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  'Eco Warrior': { bg: 'bg-gradient-to-r from-emerald-400/20 to-green-400/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Scout': { bg: 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'Observer': { bg: 'bg-gradient-to-r from-slate-400/20 to-gray-400/20', text: 'text-slate-400', border: 'border-slate-500/30' },
};

const rankGradients = [
  'from-yellow-500 to-amber-400',
  'from-slate-400 to-gray-300',
  'from-amber-600 to-orange-500',
];

const Leaderboard = () => {
  const { user } = useAuthStore();
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await authAPI.getLeaderboard();
        const data: LeaderEntry[] = res.data.map((entry: any) => ({
          ...entry,
          isCurrent: entry.id === user?.id,
        }));
        setLeaders(data);
      } catch {
        // Fallback mock data if backend is down
        setLeaders([
          { id: '1', name: 'Ravi Kumar', points: 450, leaksReported: 32, badge: 'Water Savior' },
          { id: '2', name: 'Priya Patel', points: 380, leaksReported: 28, badge: 'Eco Warrior' },
          { id: 'self', name: user?.name || 'You', points: user?.points || 0, leaksReported: 5, badge: 'Observer', isCurrent: true },
          { id: '4', name: 'Amit Singh', points: 210, leaksReported: 15, badge: 'Scout' },
          { id: '5', name: 'Neha Gupta', points: 190, leaksReported: 12, badge: 'Scout' },
          { id: '6', name: 'Deepak Verma', points: 160, leaksReported: 11, badge: 'Scout' },
          { id: '7', name: 'Meera Joshi', points: 120, leaksReported: 8, badge: 'Scout' },
          { id: '8', name: 'Kiran Rao', points: 85, leaksReported: 6, badge: 'Observer' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [user]);

  const sorted = [...leaders].sort((a, b) => b.points - a.points);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const currentUserRank = sorted.findIndex(l => l.isCurrent) + 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          >
            <Trophy className="h-14 w-14 mx-auto mb-4 text-yellow-400 drop-shadow-lg" />
          </motion.div>
          <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
            City Leaderboard
          </h1>
          <p className="text-indigo-200/80 max-w-lg mx-auto text-sm">
            Champions of water conservation. Every leak reported earns points and badges.
          </p>

          {currentUserRank > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="mt-5 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-full"
            >
              <ChevronUp className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-white/80">Your Rank:</span>
              <span className="font-black text-cyan-400 text-lg">#{currentUserRank}</span>
              <span className="text-white/50">•</span>
              <span className="text-sm text-white/80">{user?.points || 0} pts</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      {!loading && top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 items-end">
          {[1, 0, 2].map((podiumIndex) => {
            const entry = top3[podiumIndex];
            const isFirst = podiumIndex === 0;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + podiumIndex * 0.15 }}
                className={`relative flex flex-col items-center p-4 rounded-2xl border backdrop-blur-sm
                  ${isFirst
                    ? 'bg-gradient-to-b from-yellow-500/10 to-slate-900/50 border-yellow-500/30 shadow-lg shadow-yellow-500/10 order-2'
                    : podiumIndex === 1
                      ? 'bg-gradient-to-b from-slate-400/10 to-slate-900/50 border-slate-500/30 order-1'
                      : 'bg-gradient-to-b from-amber-600/10 to-slate-900/50 border-amber-600/30 order-3'
                  }
                  ${entry.isCurrent ? 'ring-2 ring-cyan-400/50' : ''}
                `}
              >
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${rankGradients[podiumIndex]} flex items-center justify-center mb-2 shadow-lg`}>
                  <span className="text-white font-black text-sm">{podiumIndex + 1}</span>
                </div>
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 ${isFirst ? 'border-yellow-400' : 'border-slate-600'} flex items-center justify-center mb-2`}>
                  <span className="font-bold text-white text-lg">{entry.name.charAt(0)}</span>
                </div>
                <h3 className={`font-bold text-sm truncate max-w-full ${entry.isCurrent ? 'text-cyan-400' : 'text-white'}`}>
                  {entry.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="font-black text-white">{entry.points}</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{entry.leaksReported} reports</span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full Ranking List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl"
      >
        <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
          <h2 className="font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            Full Rankings
          </h2>
          <div className="flex items-center text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <MapPin className="h-3 w-3 mr-1 text-cyan-500" />
            Your City
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-3">
                <div className="h-8 w-8 bg-slate-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/4" />
                </div>
                <div className="h-6 w-16 bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <div className="divide-y divide-slate-800/50">
              {rest.map((entry, index) => {
                const rank = index + 4;
                const bc = badgeColors[entry.badge] || badgeColors['Observer'];
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`flex items-center px-5 py-4 transition-all duration-200 hover:bg-white/[0.03]
                      ${entry.isCurrent ? 'bg-cyan-500/5 border-l-2 border-l-cyan-400' : ''}
                    `}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-10 text-center">
                      <span className="text-sm font-bold text-slate-500">#{rank}</span>
                    </div>

                    {/* Avatar */}
                    <div className="ml-3 h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-white text-sm">{entry.name.charAt(0)}</span>
                    </div>

                    {/* User Info */}
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold truncate ${entry.isCurrent ? 'text-cyan-400' : 'text-white'}`}>
                          {entry.name}
                        </h3>
                        {entry.isCurrent && (
                          <span className="text-[9px] uppercase font-black bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30 flex-shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${bc.bg} ${bc.text} border ${bc.border}`}>
                          <Award className="h-2.5 w-2.5" />
                          {entry.badge}
                        </span>
                        <span className="text-[10px] text-slate-500">{entry.leaksReported} reports</span>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="ml-4 text-right flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-orange-400" />
                        <span className="text-base font-black text-white">{entry.points}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">points</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Badge Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {Object.entries(badgeColors).map(([badge, colors]) => (
          <div key={badge} className={`${colors.bg} border ${colors.border} rounded-xl p-3 text-center`}>
            <Medal className={`h-5 w-5 mx-auto mb-1 ${colors.text}`} />
            <p className={`text-xs font-bold ${colors.text}`}>{badge}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {badge === 'Water Savior' ? '500+ pts' : badge === 'Eco Warrior' ? '250+ pts' : badge === 'Scout' ? '100+ pts' : '0+ pts'}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Leaderboard;
