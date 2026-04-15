import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Shield, Award, Droplets, Edit3, Save, LogOut, Star, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { authAPI } from '../../services/api';

const Profile = () => {
  const { user, updateUser, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({ name });
      updateUser({ name });
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getBadge = (points: number) => {
    if (points >= 500) return { name: 'Water Savior', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/30' };
    if (points >= 250) return { name: 'Eco Warrior', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/30' };
    if (points >= 100) return { name: 'Scout', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-500/30' };
    return { name: 'Observer', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-500/30' };
  };

  const badge = getBadge(user?.points || 0);

  const stats = [
    {
      icon: Droplets,
      label: 'Total Points',
      value: user?.points || 0,
      color: 'text-cyan-400',
      gradient: 'from-cyan-500/20 to-blue-500/20',
    },
    {
      icon: Shield,
      label: 'Trust Score',
      value: `${user?.trustScore || 100}%`,
      color: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-green-500/20',
    },
    {
      icon: Star,
      label: 'Badge Level',
      value: badge.name,
      color: badge.color,
      gradient: 'from-yellow-500/20 to-amber-500/20',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 border-2 border-white/10">
              <span className="text-3xl font-black text-white">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${badge.bg} ${badge.color} ${badge.border}`}>
              {badge.name}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            {editing ? (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-lg font-bold focus:ring-2 focus:ring-cyan-500/50 outline-none w-48"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-2 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-black">{user?.name}</h1>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5 text-white/60" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
              {user?.email && (
                <div className="flex items-center gap-1.5 text-sm text-indigo-200/70">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{user.email}</span>
                </div>
              )}
              {user?.phone && (
                <div className="flex items-center gap-1.5 text-sm text-indigo-200/70">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {user?.role}
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle className="h-3 w-3" />
                Verified Account
              </span>
            </div>
          </div>
        </div>
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
              transition={{ delay: 0.1 * i }}
              className={`relative overflow-hidden bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl text-center`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
              <div className="relative z-10">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
      >
        <h2 className="font-bold text-white flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-yellow-400" />
          Achievements
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { title: 'First Report', desc: 'Report your first leak', unlocked: (user?.points || 0) > 0, icon: '📸' },
            { title: 'Rising Star', desc: 'Earn 50 points', unlocked: (user?.points || 0) >= 50, icon: '⭐' },
            { title: 'Water Guardian', desc: 'Earn 100 points', unlocked: (user?.points || 0) >= 100, icon: '🛡️' },
            { title: 'Community Hero', desc: 'Earn 250 points', unlocked: (user?.points || 0) >= 250, icon: '🏆' },
            { title: 'Eco Champion', desc: 'Earn 500 points', unlocked: (user?.points || 0) >= 500, icon: '🌍' },
            { title: 'Legend', desc: 'Earn 1000 points', unlocked: (user?.points || 0) >= 1000, icon: '👑' },
          ].map((ach, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-center transition-all ${
                ach.unlocked
                  ? 'bg-gradient-to-b from-cyan-500/10 to-indigo-500/10 border-cyan-500/30'
                  : 'bg-slate-800/50 border-slate-700/30 opacity-50 grayscale'
              }`}
            >
              <div className="text-2xl mb-1">{ach.icon}</div>
              <p className={`text-xs font-bold ${ach.unlocked ? 'text-white' : 'text-slate-500'}`}>{ach.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{ach.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Water Impact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6"
      >
        <h2 className="font-bold text-white flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          Your Water Impact
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-black text-cyan-400">{((user?.points || 0) * 50).toLocaleString()} L</p>
            <p className="text-xs text-slate-400">Estimated Water Saved</p>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-400">₹{((user?.points || 0) * 3).toLocaleString()}</p>
            <p className="text-xs text-slate-400">Economic Value</p>
          </div>
        </div>
      </motion.div>

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 py-3 rounded-xl font-semibold hover:bg-red-500/20 transition-all"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </motion.button>
    </div>
  );
};

export default Profile;
