import React from 'react';
import { Trophy, Medal, Award, MapPin } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const Leaderboard = () => {
  const { user } = useAuthStore();

  // Mock data for MVP
  const leaders = [
    { id: '1', name: 'Ravi Kumar', points: 450, leaksReported: 32, badge: 'Water Savior' },
    { id: '2', name: 'Priya Patel', points: 380, leaksReported: 28, badge: 'Eco Warrior' },
    { id: 'user-id', name: user?.name || 'You', points: user?.points || 0, leaksReported: 5, badge: 'Observer', isCurrent: true },
    { id: '4', name: 'Amit Singh', points: 210, leaksReported: 15, badge: 'Scout' },
    { id: '5', name: 'Neha Gupta', points: 190, leaksReported: 12, badge: 'Scout' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center bg-gradient-to-r from-primary-600 to-blue-500 rounded-2xl p-8 text-white shadow-lg">
        <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
        <h1 className="text-3xl font-bold mb-2">City Leaderboard</h1>
        <p className="text-blue-100 max-w-xl mx-auto">
          See who is leading the movement to save water in your city! Earn points by reporting leaks and verifying others' reports.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-700">Top Citizen Reporters</h2>
          <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
            <MapPin className="h-4 w-4 mr-1 text-primary-500" />
            New Delhi
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {leaders.sort((a, b) => b.points - a.points).map((leader, index) => (
            <div 
              key={leader.id} 
              className={`flex items-center p-4 sm:px-6 transition-colors hover:bg-gray-50
                ${leader.isCurrent ? 'bg-primary-50/50 border-l-4 border-primary-500' : ''}`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-12 text-center">
                {index === 0 ? <Medal className="h-8 w-8 mx-auto text-yellow-500" /> :
                 index === 1 ? <Medal className="h-8 w-8 mx-auto text-gray-400" /> :
                 index === 2 ? <Medal className="h-8 w-8 mx-auto text-amber-600" /> :
                 <span className="text-lg font-bold text-gray-400">#{index + 1}</span>}
              </div>

              {/* User Info */}
              <div className="ml-4 flex-1">
                <div className="flex items-center">
                  <h3 className={`text-sm sm:text-base font-bold ${leader.isCurrent ? 'text-primary-700' : 'text-gray-900'}`}>
                    {leader.name}
                  </h3>
                  {leader.isCurrent && (
                    <span className="ml-2 text-[10px] uppercase font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary-400" />
                  {leader.badge}
                  <span className="mx-2">•</span>
                  <span>{leader.leaksReported} reports</span>
                </div>
              </div>

              {/* Points */}
              <div className="ml-4 text-right">
                <div className="text-lg sm:text-xl font-black text-gray-900">
                  {leader.points}
                </div>
                <div className="text-xs text-gray-500">Points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
