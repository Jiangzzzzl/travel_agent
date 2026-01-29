'use client';

import { Navigation, Clock, MapPin, Car, User, Train, Bike, AlertCircle } from 'lucide-react';

interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface RouteCardProps {
  origin: Location;
  destination: Location;
  waypoints?: Location[];
  travelMode: 'driving' | 'walking' | 'transit' | 'bicycling';
  estimatedTime: string;
  estimatedDistance: string;
  tips: string[];
}

export function RouteCard({
  origin,
  destination,
  waypoints = [],
  travelMode,
  estimatedTime,
  estimatedDistance,
  tips
}: RouteCardProps) {
  
  // 获取交通方式的图标和样式
  const getTravelModeStyle = (mode: string) => {
    switch (mode) {
      case 'driving':
        return { icon: Car, color: 'bg-blue-500', bgColor: 'bg-blue-50', label: 'Driving' };
      case 'walking':
        return { icon: User, color: 'bg-green-500', bgColor: 'bg-green-50', label: 'Walking' };
      case 'transit':
        return { icon: Train, color: 'bg-purple-500', bgColor: 'bg-purple-50', label: 'Transit' };
      case 'bicycling':
        return { icon: Bike, color: 'bg-orange-500', bgColor: 'bg-orange-50', label: 'Bicycling' };
      default:
        return { icon: Navigation, color: 'bg-gray-500', bgColor: 'bg-gray-50', label: 'Route' };
    }
  };

  const modeStyle = getTravelModeStyle(travelMode);
  const ModeIcon = modeStyle.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* 头部 */}
      <div className={`${modeStyle.bgColor} border-b border-gray-200 p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${modeStyle.color} text-white w-10 h-10 rounded-lg flex items-center justify-center`}>
              <ModeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Route Planning</h3>
              <p className="text-sm text-gray-600">{modeStyle.label} • {estimatedTime} • {estimatedDistance}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{estimatedTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 路线详情 */}
      <div className="p-4">
        {/* 起点和终点 */}
        <div className="space-y-4">
          {/* 起点 */}
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{origin.name}</p>
              <p className="text-sm text-gray-500">Starting point</p>
            </div>
          </div>

          {/* 途经点 */}
          {waypoints.map((waypoint, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{waypoint.name}</p>
                <p className="text-sm text-gray-500">Waypoint {index + 1}</p>
              </div>
            </div>
          ))}

          {/* 终点 */}
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{destination.name}</p>
              <p className="text-sm text-gray-500">Destination</p>
            </div>
          </div>
        </div>

        {/* 路线可视化 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">{origin.name}</span>
            </div>
            <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-300 relative">
              <ModeIcon className="w-4 h-4 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-50" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{destination.name}</span>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 路线信息 */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">{estimatedTime}</p>
            <p className="text-xs text-gray-500">Estimated Time</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Navigation className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">{estimatedDistance}</p>
            <p className="text-xs text-gray-500">Distance</p>
          </div>
        </div>

        {/* 提示和建议 */}
        {tips.length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-amber-900 mb-2">Travel Tips</h4>
                <ul className="space-y-1">
                  {tips.map((tip, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-1">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-4 flex gap-2">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <Navigation className="w-4 h-4" />
            Start Navigation
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Share Route
          </button>
        </div>
      </div>
    </div>
  );
}