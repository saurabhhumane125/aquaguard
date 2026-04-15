import React, { useEffect, useState } from 'react';
import { ShieldAlert, Droplets, Clock, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { leakAPI } from '../../services/api';
import { Leak } from '../../types';
import LeakMap from '../../components/shared/LeakMap';

const AuthorityDashboard = () => {
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllLeaks = async () => {
      try {
        const response = await leakAPI.getLeaks();
        setLeaks(response.data);
      } catch (error) {
        console.error('Failed to fetch leaks for authority:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllLeaks();
  }, []);

  const criticalLeaks = leaks.filter(l => l.severity === 'CRITICAL' || l.severity === 'SEVERE').length;
  const verifiedLeaks = leaks.filter(l => l.status === 'VERIFIED').length;
  const resolvedLeaks = leaks.filter(l => l.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-900 text-white p-6 rounded-2xl shadow-md">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <ShieldAlert className="mr-2 text-primary-400" />
            Authority Control Center
          </h1>
          <p className="text-gray-400 mt-1">Delhi Jal Board (DJB) - Central District</p>
        </div>
        <div className="hidden md:flex space-x-4">
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Dispatch Crew
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium border border-gray-700 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-red-500">
          <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
            Critical Severity
          </p>
          <p className="text-3xl font-black text-gray-900">{criticalLeaks}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-blue-500">
          <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center">
            <ShieldAlert className="h-4 w-4 mr-1 text-blue-500" />
            Verified Unassigned
          </p>
          <p className="text-3xl font-black text-gray-900">{verifiedLeaks}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-orange-500">
          <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center">
            <Droplets className="h-4 w-4 mr-1 text-orange-500" />
            Est. Water Loss/hr
          </p>
          <p className="text-3xl font-black text-gray-900">4,250 L</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-green-500">
          <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
            Resolved Today
          </p>
          <p className="text-3xl font-black text-gray-900">{resolvedLeaks}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">City-Wide Heatmap</h2>
            </div>
            {/* Display Map */}
            <LeakMap leaks={leaks} height="500px" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-[560px] flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
              Action Required Queue
              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{criticalLeaks} pending</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {loading ? (
                <p className="text-center text-gray-500 mt-10">Loading queue...</p>
              ) : leaks.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">No active reports</p>
              ) : (
                leaks.sort((a, b) => b.priorityScore - a.priorityScore).map(leak => (
                  <div key={leak.id} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={\`h-2 w-2 rounded-full \${
                            leak.severity === 'CRITICAL' ? 'bg-red-500' :
                            leak.severity === 'SEVERE' ? 'bg-orange-500' :
                            'bg-yellow-500'
                          }\`} 
                        />
                        <span className="font-bold text-gray-900 text-sm">Priority {leak.priorityScore}/100</span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(leak.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 truncate">
                      <MapPin className="inline h-3 w-3 mr-1 text-gray-400" />
                      {leak.address}
                    </p>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                        {leak.category.replace('_', ' ').toLowerCase()}
                      </span>
                      <button className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline">
                        Review & Assign
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
