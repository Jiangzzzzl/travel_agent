'use client';

import { Info, Clock, DollarSign, Users, Zap, Utensils, Car, Cloud, Landmark } from 'lucide-react';

interface InfoCardProps {
  title: string;
  content: string;
  type: 'tip' | 'time' | 'budget' | 'crowd' | 'highlight' | 'food' | 'transport' | 'weather' | 'culture' | string;
  color?: string;
}

const typeConfig: Record<string, {
  icon: any;
  gradient: string;
  bg: string;
  emoji: string;
}> = {
  tip: {
    icon: Info,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'from-blue-50 to-cyan-50',
    emoji: '💡',
  },
  time: {
    icon: Clock,
    gradient: 'from-purple-500 to-pink-500',
    bg: 'from-purple-50 to-pink-50',
    emoji: '⏰',
  },
  budget: {
    icon: DollarSign,
    gradient: 'from-green-500 to-emerald-500',
    bg: 'from-green-50 to-emerald-50',
    emoji: '💰',
  },
  crowd: {
    icon: Users,
    gradient: 'from-orange-500 to-red-500',
    bg: 'from-orange-50 to-red-50',
    emoji: '👥',
  },
  highlight: {
    icon: Zap,
    gradient: 'from-yellow-500 to-orange-500',
    bg: 'from-yellow-50 to-orange-50',
    emoji: '⚡',
  },
  food: {
    icon: Utensils,
    gradient: 'from-red-500 to-pink-500',
    bg: 'from-red-50 to-pink-50',
    emoji: '🍽️',
  },
  transport: {
    icon: Car,
    gradient: 'from-indigo-500 to-blue-500',
    bg: 'from-indigo-50 to-blue-50',
    emoji: '🚗',
  },
  weather: {
    icon: Cloud,
    gradient: 'from-sky-500 to-blue-500',
    bg: 'from-sky-50 to-blue-50',
    emoji: '🌤️',
  },
  culture: {
    icon: Landmark,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'from-amber-50 to-orange-50',
    emoji: '🏛️',
  },
};

export function InfoCard({ title, content, type, color }: InfoCardProps) {
  // 如果 type 不存在，使用默认的 'tip' 类型
  const config = typeConfig[type] || typeConfig.tip;
  const Icon = config.icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105">
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bg}`} />
      
      <div className="relative p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
            <span className="text-2xl">{config.emoji}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-slate-800 mb-1">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
      
      <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
    </div>
  );
}
