import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Leak, Cluster } from '../../types';

// Fix typical Leaflet missing icon issues
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface LeakMapProps {
  leaks?: Leak[];
  clusters?: Cluster[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const LeakMap: React.FC<LeakMapProps> = ({ 
  leaks = [], 
  clusters = [], 
  center = [28.6139, 77.2090], // Default New Delhi
  zoom = 13,
  height = "400px" 
}) => {
  return (
    <div style={{ height, width: '100%', borderRadius: '0.75rem', overflow: 'hidden', zIndex: 0 }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render individual leaks */}
        {leaks.map((leak) => (
          <Marker 
            key={leak.id} 
            position={[leak.latitude, leak.longitude]} 
            icon={DefaultIcon}
          >
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold text-gray-900">{leak.category.replace('_', ' ')}</h3>
                <p className="text-sm text-gray-600 mb-1">{leak.address}</p>
                <div className="flex gap-2 text-xs font-semibold">
                  <span className={`px-2 py-0.5 rounded ${
                    leak.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    leak.severity === 'SEVERE' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {leak.severity}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                    {leak.flowRate}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render clusters as heatmap-like circles */}
        {clusters.map((cluster) => (
          <Circle
            key={cluster.id}
            center={[cluster.centerLatitude, cluster.centerLongitude]}
            radius={cluster.radius}
            pathOptions={{ 
              color: cluster.priorityScore > 80 ? 'red' : 'orange', 
              fillColor: cluster.priorityScore > 80 ? '#ef4444' : '#f97316',
              fillOpacity: 0.4
            }}
          >
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold text-gray-900">High Risk Zone</h3>
                <p className="text-sm text-gray-600">Priority Score: <span className="font-bold text-red-600">{cluster.priorityScore}/100</span></p>
                <p className="text-sm text-gray-600">Active Reports: {cluster.totalReports}</p>
                <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                  Crew is notified about this cluster.
                </div>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeakMap;
