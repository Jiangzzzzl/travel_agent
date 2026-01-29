"use client";

import { MapPin, Star, Clock, Camera, Heart, Navigation, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { itineraryStore } from '@/lib/itinerary-store';

interface AttractionCardProps {
  id?: string;
  name: string;
  location: string;
  tags: string[];
  description: string;
  vibeColor: string;
  rating?: number;
  bestTime?: string;
  emoji?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  estimatedDuration?: string;
  bestTimeToVisit?: string;
}

export function AttractionCard({ 
  id,
  name, 
  location, 
  tags, 
  description, 
  vibeColor,
  rating = 4.8,
  bestTime = "全天",
  emoji = "📍",
  coordinates,
  estimatedDuration = "2-3小时",
  bestTimeToVisit
}: AttractionCardProps) {
  const [isInItinerary, setIsInItinerary] = useState(false);
  const [addedDay, setAddedDay] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    
    setIsInItinerary(itineraryStore.isInItinerary(name));
    setAddedDay(itineraryStore.getAttractionDay(name));
    
    const unsubscribe = itineraryStore.subscribe(() => {
      setIsInItinerary(itineraryStore.isInItinerary(name));
      setAddedDay(itineraryStore.getAttractionDay(name));
    });
    
    return unsubscribe;
  }, [id, name]);

  const handleToggleItinerary = async () => {
    if (!id) return;
    
    if (isInItinerary && addedDay) {
      // 移除所有该名称的景点
      const allDayPlans = itineraryStore.getAllDayPlans();
      allDayPlans.forEach(dayPlan => {
        dayPlan.attractions.forEach((attr, index) => {
          if (attr.name === name) {
            itineraryStore.removeAttractionFromDay(dayPlan.day, attr.id, index);
          }
        });
      });
    } else {
      const day = await itineraryStore.addAttractionAuto({
        id,
        name,
        location,
        emoji,
        vibeColor,
        estimatedDuration,
        coordinates,
        priority: rating ? Math.round(rating) : 3
      });
      setAddedDay(day);
    }
  };
  return (
    <div className="group my-6 relative">
      {/* 外层光晕 */}
      <div 
        className="absolute -inset-1 rounded-[2rem] opacity-30 group-hover:opacity-50 blur-2xl transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${vibeColor}, ${vibeColor}88)` }}
      />
      
      <div 
        className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl transition-all duration-500 hover:scale-[1.02] border-2"
        style={{ borderColor: `${vibeColor}40` }}
      >
        {/* 顶部装饰带 */}
        <div className="relative h-3 overflow-hidden">
          <div 
            className="absolute inset-0 animate-pulse"
            style={{ background: `linear-gradient(90deg, ${vibeColor}, ${vibeColor}dd, ${vibeColor})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
        
        <div className="p-7">
          {/* 头部 */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="px-3 py-1.5 rounded-xl text-xs font-black text-white shadow-lg flex items-center gap-1.5"
                  style={{ background: `linear-gradient(135deg, ${vibeColor}, ${vibeColor}dd)` }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  推荐景点
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl shadow-lg">
                  <Star className="w-4 h-4 fill-white text-white" />
                  <span className="text-sm font-black text-white">{rating}</span>
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{name}</h3>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-5 h-5" style={{ color: vibeColor }} />
                <span className="text-base font-medium">{location}</span>
              </div>
            </div>
            
            <button 
              onClick={handleToggleItinerary}
              className={`group/heart p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 ${
                isInItinerary 
                  ? 'bg-gradient-to-br from-red-50 to-pink-50' 
                  : 'bg-gradient-to-br from-slate-50 to-slate-100 hover:from-red-50 hover:to-pink-50'
              }`}
              aria-label={isInItinerary ? '已加入行程' : '加入行程'}
            >
              <Heart className={`w-6 h-6 transition-all duration-300 ${
                isInItinerary 
                  ? 'text-red-500 fill-current' 
                  : 'text-slate-400 group-hover/heart:text-red-500 group-hover/heart:fill-current'
              }`} />
            </button>
            {isInItinerary && addedDay && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                第{addedDay}天
              </div>
            )}
          </div>

          {/* 标签云 */}
          <div className="flex flex-wrap gap-2 mb-5">
            {tags.map((tag: string, idx: number) => (
              <span 
                key={idx} 
                className="px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 hover:scale-110 cursor-default shadow-md"
                style={{ 
                  background: `linear-gradient(135deg, ${vibeColor}15, ${vibeColor}25)`,
                  color: vibeColor,
                  border: `2px solid ${vibeColor}30`
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
          
          {/* 描述卡片 */}
          <div 
            className="relative mb-6 p-5 rounded-2xl overflow-hidden shadow-inner"
            style={{ 
              background: `linear-gradient(135deg, ${vibeColor}08, ${vibeColor}15)`,
            }}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: vibeColor }}
            />
            <p className="text-base text-slate-700 leading-relaxed italic font-medium pl-3">
              "{description}"
            </p>
          </div>
          
          {/* 信息栏 */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <Clock className="w-4 h-4" style={{ color: vibeColor }} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">游览时长</p>
                <p className="text-sm font-bold">{estimatedDuration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <Camera className="w-4 h-4" style={{ color: vibeColor }} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">最佳时间</p>
                <p className="text-sm font-bold">{bestTimeToVisit || bestTime}</p>
              </div>
            </div>
            {coordinates && (
              <div className="col-span-2 flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <Navigation className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium">坐标位置</p>
                  <p className="text-sm font-bold text-blue-600">
                    {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                  </p>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  查看地图
                </button>
              </div>
            )}
          </div>
          
          {/* 底部按钮 */}
          <div className="flex gap-3">
            <button 
              onClick={handleToggleItinerary}
              className={`flex-1 py-4 rounded-2xl text-base font-black shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                isInItinerary
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                  : 'text-white'
              }`}
              style={!isInItinerary ? { 
                background: `linear-gradient(135deg, ${vibeColor}, ${vibeColor}dd)` 
              } : undefined}
            >
              <Heart className={`w-5 h-5 ${isInItinerary ? 'fill-current' : ''}`} />
              {isInItinerary ? `已加入第${addedDay}天` : '加入我的行程'}
            </button>
            <button 
              className="px-6 py-4 rounded-2xl text-base font-black bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              分享
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
