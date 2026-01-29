'use client';

import { useState, useEffect } from 'react';
import { Heart, MapPin, Star, Clock, Camera } from 'lucide-react';
import { attractionStore, SavedAttraction } from '@/lib/attraction-store';
import { itineraryStore } from '@/lib/itinerary-store';
import { useActions, useUIState } from '@ai-sdk/rsc';
import { nanoid } from 'nanoid';

interface EnhancedAttractionCardProps {
  name: string;
  type: 'historical' | 'nature' | 'food' | 'modern' | 'cultural' | 'beach';
  location: string;
  description: string;
  tags: string[];
  vibeColor: string;
  emoji?: string;
  rating?: number;
  bestTime?: string;
  estimatedDuration?: string;
  imageUrl?: string;
}

const typeStyles = {
  historical: {
    gradient: 'from-amber-500 to-orange-600',
    bg: 'from-amber-50 to-orange-50',
    icon: '🏛️',
    pattern: '🏺',
    decorations: ['⚱️', '🗿', '📜', '🏛️', '👑'],
    badge: '历史古迹',
  },
  nature: {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'from-green-50 to-emerald-50',
    icon: '🌲',
    pattern: '🍃',
    decorations: ['🌿', '🦋', '🌸', '🌳', '🏔️'],
    badge: '自然风光',
  },
  food: {
    gradient: 'from-red-500 to-pink-600',
    bg: 'from-red-50 to-pink-50',
    icon: '🍜',
    pattern: '🥢',
    decorations: ['🍱', '🥟', '🍵', '🥠', '🍲'],
    badge: '美食体验',
  },
  modern: {
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'from-blue-50 to-indigo-50',
    icon: '🏙️',
    pattern: '🌆',
    decorations: ['🏢', '🎡', '🎢', '🛍️', '🎭'],
    badge: '现代都市',
  },
  cultural: {
    gradient: 'from-purple-500 to-pink-600',
    bg: 'from-purple-50 to-pink-50',
    icon: '🎭',
    pattern: '🎨',
    decorations: ['🎪', '🎬', '🎨', '🎵', '📚'],
    badge: '文化艺术',
  },
  beach: {
    gradient: 'from-cyan-500 to-blue-600',
    bg: 'from-cyan-50 to-blue-50',
    icon: '🏖️',
    pattern: '🌊',
    decorations: ['🐚', '🦀', '🏄', '⛱️', '🌴'],
    badge: '海滨度假',
  }
};

export function EnhancedAttractionCard({
  name,
  type,
  location,
  description,
  tags,
  vibeColor,
  emoji,
  rating,
  bestTime,
  estimatedDuration,
  imageUrl
}: EnhancedAttractionCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isInItinerary, setIsInItinerary] = useState(false);
  const [addedDay, setAddedDay] = useState<number | null>(null);
  const style = typeStyles[type];
  const attractionId = `${name}-${location}`.replace(/\s+/g, '-').toLowerCase();
  const { submitUserMessage } = useActions();
  const [conversation, setConversation] = useUIState();

  useEffect(() => {
    setIsLiked(attractionStore.isLiked(attractionId));
    setIsInItinerary(itineraryStore.isInItinerary(name));
    setAddedDay(itineraryStore.getAttractionDay(name));
    
    const unsubscribeAttraction = attractionStore.subscribe(() => {
      setIsLiked(attractionStore.isLiked(attractionId));
    });
    
    const unsubscribeItinerary = itineraryStore.subscribe(() => {
      setIsInItinerary(itineraryStore.isInItinerary(name));
      setAddedDay(itineraryStore.getAttractionDay(name));
    });
    
    return () => {
      unsubscribeAttraction();
      unsubscribeItinerary();
    };
  }, [attractionId, name]);

  const handleLikeToggle = async () => {
    const attraction: SavedAttraction = {
      id: attractionId,
      name,
      location,
      type,
      description,
      emoji: emoji || style.icon,
      vibeColor,
      rating,
    };

    if (isLiked) {
      attractionStore.removeAttraction(attractionId);
      // 从行程中移除所有该景点
      const allDayPlans = itineraryStore.getAllDayPlans();
      allDayPlans.forEach(dayPlan => {
        dayPlan.attractions.forEach((attr, index) => {
          if (attr.name === name) {
            itineraryStore.removeAttractionFromDay(dayPlan.day, attr.id, index);
          }
        });
      });
    } else {
      attractionStore.addAttraction(attraction);
      
      // 使用AI时间估算
      let finalEstimatedDuration = estimatedDuration || "2-3小时";
      
      try {
        console.log('🤖 Getting AI time estimate for chat attraction:', name);
        const response = await fetch('/api/estimate-time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attractionName: name,
            attractionType: type,
            location: location
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            finalEstimatedDuration = data.timeEstimate;
            console.log('🤖 AI time estimate for chat attraction:', name, '→', data.timeEstimate);
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to get AI time estimate for chat attraction:', error);
      }
      
      // 静默添加到行程，AI 自动分配到景点最少的一天
      const day = await itineraryStore.addAttractionAuto({
        id: attractionId,
        name,
        location,
        emoji: emoji || style.icon,
        vibeColor,
        estimatedDuration: finalEstimatedDuration
      });
      setAddedDay(day);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
      {/* 背景渐变 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.bg} opacity-90`} />
      
      {/* 大型装饰元素 - 根据类型显示不同图案 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 主要装饰图标 - 超大尺寸 */}
        <div 
          className="absolute -right-12 -top-12 text-[200px] opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:rotate-12 transform transition-transform duration-700"
        >
          {style.icon}
        </div>
        
        {/* 次要装饰图标 - 左下角 */}
        <div 
          className="absolute -left-8 -bottom-8 text-[150px] opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:-rotate-12 transform transition-transform duration-700"
        >
          {style.pattern}
        </div>
        
        {/* 浮动装饰元素 */}
        {style.decorations.map((deco, idx) => (
          <div
            key={idx}
            className="absolute text-4xl animate-float opacity-20"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              animationDelay: `${idx * 0.5}s`,
              animationDuration: `${8 + idx * 2}s`,
            }}
          >
            {deco}
          </div>
        ))}
      </div>
      
      {/* 装饰性顶部带 - 更宽更明显 */}
      <div className={`h-3 bg-gradient-to-r ${style.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/20 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      </div>

      {/* 主要内容 */}
      <div className="relative p-6">
        {/* 类型徽章 - 更大更显眼 */}
        <div className="absolute top-4 left-4 z-10">
          <div className={`px-4 py-2 bg-gradient-to-r ${style.gradient} text-white text-sm font-bold rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-sm animate-in-up`}>
            <span className="text-xl">{style.icon}</span>
            <span>{style.badge}</span>
          </div>
        </div>
        
        {/* 头部：标题和收藏按钮 */}
        <div className="flex items-start justify-between mb-4 mt-12">
          <div className="flex-1">
            <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight group-hover:text-slate-900 transition-colors">
              {emoji && <span className="mr-2 text-3xl">{emoji}</span>}
              {name}
            </h3>
            <div className="flex items-center gap-2 text-slate-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-semibold">{location}</span>
            </div>
          </div>
          
          {/* 收藏按钮 - 更大更显眼 */}
          <button
            onClick={handleLikeToggle}
            className={`relative p-3 rounded-full transition-all duration-300 shadow-lg ${
              isLiked 
                ? 'bg-red-500 text-white shadow-red-500/50 scale-110' 
                : 'bg-white/90 text-slate-400 hover:bg-white hover:text-red-500 hover:scale-110'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            {isInItinerary && addedDay && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                D{addedDay}
              </div>
            )}
          </button>
        </div>

        {/* 描述 */}
        <p className="text-slate-700 text-base leading-relaxed mb-4 font-medium">
          {description}
        </p>

        {/* 评分和最佳时间 */}
        <div className="flex items-center gap-4 mb-4">
          {rating && (
            <div className="flex items-center gap-1 bg-white/80 px-3 py-2 rounded-full shadow-md">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-base font-bold text-slate-700">{rating}</span>
            </div>
          )}
          {bestTime && (
            <div className="flex items-center gap-2 text-slate-600 bg-white/80 px-3 py-2 rounded-full shadow-md">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">{bestTime}</span>
            </div>
          )}
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-4 py-2 bg-white/90 text-slate-700 text-sm font-bold rounded-full border-2 border-white/50 shadow-md hover:shadow-lg transition-shadow"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 底部操作按钮 */}
        <div className="flex gap-3">
          <button className="flex-1 bg-white/90 hover:bg-white text-slate-700 font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
            <Camera className="w-5 h-5" />
            <span>拍照打卡</span>
          </button>
          <button 
            onClick={handleLikeToggle}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 ${
              isInItinerary 
                ? 'bg-green-500 text-white' 
                : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInItinerary ? 'fill-current' : ''}`} />
            {isInItinerary ? `第${addedDay}天` : '加入行程'}
          </button>
        </div>
      </div>

      {/* 悬停光效 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${vibeColor}, ${vibeColor}88)` }}
      />
      
      {/* 边框光效 */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ 
          boxShadow: `inset 0 0 60px ${vibeColor}40, 0 0 40px ${vibeColor}20` 
        }}
      />
    </div>
  );
}