import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, TrendingUp, Map as MapIcon, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { leakAPI } from '../../services/api';
import { Leak } from '../../types';
import LeakMap from '../../components/shared/LeakMap';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [recentLeaks, setRecentLeaks] = useState<Leak[]>([]);
  const [loading, setLoading] = useState(true);

  // Example stats for MVP
  const stats = [
    { label: 'Total Points', value: user?.points || 0, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Trust Score', value: `${user?.trustScore || 100}%`, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Reports Active', value: recentLeaks.filter(l => l.status !== 'RESOLVED' && l.status !== 'REJECTED').length, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  useEffect(() => {
    const fetchLeaks = async () => {
      try {
        const response = await leakAPI.getMyLeaks();
        setRecentLeaks(response.data);
      } catch (error) {
        console.error('Failed to fetch leaks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaks();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-primary-600 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Hello, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-primary-100 max-w-lg mb-6">
            Ready to be a water hero today? Every leak you report helps your city conserve millions of liters.
          </p>
          <Link to="/report" className="inline-flex items-center space-x-2 bg-white text-primary-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            <span>Report a Leak</span>
            <ArrowRight size={18} />
          </Link>
        </div>
        {/* Decorative background droplets */}
        <Droplets className="absolute -right-8 -bottom-8 h-48 w-48 text-primary-500 opacity-50" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <MapIcon className="mr-2 h-5 w-5 text-gray-400" />
                Active Leaks Map
              </h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Live Data</span>
            </div>
            {/* The LeakMap needs window loaded correctly so it can display */}
            <LeakMap leaks={recentLeaks} height="350px" />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-gray-400" />
              Your Recent Reports
            </h2>
            
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex space-x-3 items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentLeaks.length > 0 ? (
              <div className="space-y-4">
                {recentLeaks.slice(0, 5).map((leak) => (
                  <div key={leak.id} className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {leak.category.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">
                        {leak.address}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium
                        ${leak.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                          leak.status === 'VERIFIED' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'}`}
                      >
                        {leak.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(leak.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Droplets className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No leaks reported yet.</p>
                <Link to="/report" className="text-sm text-primary-600 font-medium hover:underline mt-1 inline-block">
                  Report your first leak
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
