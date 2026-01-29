'use client';

import { useState } from 'react';
import { MapPin, Navigation, Maximize2 } from 'lucide-react';

interface Place {
  name: string;
  lat: number;
  lng: number;
  type: 'attraction' | 'hotel' | 'restaurant' | 'transport';
  description: string;
}

interface MapComponentProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  places: Place[];
  title: string;
}

export function MapComponent({ center, zoom, places, title }: MapComponentProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // 获取地点类型的图标和颜色
  const getPlaceStyle = (type: Place['type']) => {
    switch (type) {
      case 'attraction':
        return { icon: '🎯', color: 'bg-blue-500', bgColor: 'bg-blue-50' };
      case 'hotel':
        return { icon: '🏨', color: 'bg-green-500', bgColor: 'bg-green-50' };
      case 'restaurant':
        return { icon: '🍽️', color: 'bg-red-500', bgColor: 'bg-red-50' };
      case 'transport':
        return { icon: '🚇', color: 'bg-purple-500', bgColor: 'bg-purple-50' };
      default:
        return { icon: '📍', color: 'bg-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  // 模拟地图（实际项目中会使用 Google Maps API）
  const MapView = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden">
      {/* 地图背景网格 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* 地点标记 */}
      {places.map((place, index) => {
        const style = getPlaceStyle(place.type);
        // 简单的位置计算（实际项目中会使用真实的地图投影）
        const x = 20 + (index % 3) * 30 + Math.random() * 20;
        const y = 20 + Math.floor(index / 3) * 25 + Math.random() * 20;
        
        return (
          <button
            key={index}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${style.color} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg hover:scale-110 transition-transform z-10`}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => setSelectedPlace(place)}
          >
            <span className="text-xs">{style.icon}</span>
          </button>
        );
      })}
      
      {/* 中心点标记 */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"
        style={{ left: '50%', top: '50%' }}
      />
      
      {/* 地图信息 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600">
        📍 {center.lat.toFixed(4)}, {center.lng.toFixed(4)} • Zoom: {zoom}
      </div>
    </div>
  );

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${
      isFullscreen ? 'fixed inset-4 z-50' : ''
    }`}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{places.length} places</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 地图区域 */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-80'}`}>
        <MapView />
        
        {/* 地点信息面板 */}
        {selectedPlace && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 max-w-xs shadow-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getPlaceStyle(selectedPlace.type).icon}</span>
                <h4 className="font-semibold text-gray-900">{selectedPlace.name}</h4>
              </div>
              <button
                onClick={() => setSelectedPlace(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{selectedPlace.description}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Navigation className="w-3 h-3" />
              <span>{selectedPlace.lat.toFixed(4)}, {selectedPlace.lng.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>

      {/* 地点列表 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-2">
          {places.map((place, index) => {
            const style = getPlaceStyle(place.type);
            return (
              <button
                key={index}
                onClick={() => setSelectedPlace(place)}
                className={`flex items-center gap-2 p-2 ${style.bgColor} rounded-lg text-left hover:bg-opacity-80 transition-colors`}
              >
                <span className="text-sm">{style.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{place.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{place.type}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 全屏模式关闭按钮 */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 text-gray-600 hover:text-gray-900 transition-colors z-20"
        >
          ×
        </button>
      )}
    </div>
  );
}