'use client';

import { useEffect, useState } from 'react';

interface DynamicBackgroundProps {
  destination?: string;
}

export function DynamicBackground({ destination }: DynamicBackgroundProps) {
  return (
    <>
      {/* 现代渐变背景 */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 -z-10" />
      
      {/* 动态光晕效果 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      {/* 网格纹理 */}
      <div className="fixed inset-0 -z-10 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>
    </>
  );
}

function getThemeForDestination(destination: string) {
  const dest = destination.toLowerCase();
  
  // Xi'an - 古都主题（琥珀/橙色）
  if (dest.includes('xi') || dest.includes('xian') || dest.includes('西安')) {
    return {
      gradient: {
        from: '#FEF3C7',
        via: '#FDE68A',
        to: '#FCD34D',
      },
      accent1: '#F59E0B',
      accent2: '#D97706',
      accent3: '#B45309',
      pattern: 'ancient' as const,
      floatingEmojis: ['🏛️', '⚔️', '🏺', '🐉', '🎭'],
    };
  }
  
  // Hangzhou - 西湖主题（青绿色）
  if (dest.includes('hangzhou') || dest.includes('杭州')) {
    return {
      gradient: {
        from: '#CCFBF1',
        via: '#99F6E4',
        to: '#5EEAD4',
      },
      accent1: '#14B8A6',
      accent2: '#0D9488',
      accent3: '#0F766E',
      pattern: 'nature' as const,
      floatingEmojis: ['🌸', '🍵', '🛕', '🌊', '🏞️'],
    };
  }
  
  // Dali - 洱海主题（蓝色/青色）
  if (dest.includes('dali') || dest.includes('大理')) {
    return {
      gradient: {
        from: '#DBEAFE',
        via: '#BFDBFE',
        to: '#93C5FD',
      },
      accent1: '#3B82F6',
      accent2: '#2563EB',
      accent3: '#1D4ED8',
      pattern: 'nature' as const,
      floatingEmojis: ['🌊', '🏔️', '🚴', '☁️', '🌸'],
    };
  }
  
  // Tokyo - 现代主题（紫色）
  if (dest.includes('tokyo') || dest.includes('东京')) {
    return {
      gradient: {
        from: '#F3E8FF',
        via: '#E9D5FF',
        to: '#D8B4FE',
      },
      accent1: '#A855F7',
      accent2: '#9333EA',
      accent3: '#7E22CE',
      pattern: 'modern' as const,
      floatingEmojis: ['🗼', '🍜', '🎌', '🎮', '🌸'],
    };
  }
  
  // Santorini - 海滩主题（粉色/蓝色）
  if (dest.includes('santorini') || dest.includes('圣托里尼')) {
    return {
      gradient: {
        from: '#FCE7F3',
        via: '#FBCFE8',
        to: '#F9A8D4',
      },
      accent1: '#EC4899',
      accent2: '#DB2777',
      accent3: '#BE185D',
      pattern: 'beach' as const,
      floatingEmojis: ['🏖️', '⛵', '🌅', '🏛️', '🍷'],
    };
  }
  
  // 默认主题（紫色渐变）
  return {
    gradient: {
      from: '#F5F3FF',
      via: '#EDE9FE',
      to: '#DDD6FE',
    },
    accent1: '#8B5CF6',
    accent2: '#7C3AED',
    accent3: '#6D28D9',
    pattern: 'nature' as const,
    floatingEmojis: ['✨', '🌟', '💫', '🎨', '🌈'],
  };
}

function AncientPattern() {
  return (
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="ancient" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="50" r="30" fill="currentColor" opacity="0.1" />
          <rect x="120" y="20" width="60" height="60" fill="currentColor" opacity="0.1" />
          <polygon points="50,150 80,180 20,180" fill="currentColor" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ancient)" />
    </svg>
  );
}

function NaturePattern() {
  return (
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="nature" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="40" r="25" fill="currentColor" opacity="0.08" />
          <circle cx="110" cy="80" r="20" fill="currentColor" opacity="0.08" />
          <circle cx="70" cy="120" r="30" fill="currentColor" opacity="0.08" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#nature)" />
    </svg>
  );
}

function ModernPattern() {
  return (
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="modern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect x="10" y="10" width="30" height="80" fill="currentColor" opacity="0.1" />
          <rect x="50" y="30" width="40" height="60" fill="currentColor" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#modern)" />
    </svg>
  );
}

function BeachPattern() {
  return (
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="beach" x="0" y="0" width="200" height="100" patternUnits="userSpaceOnUse">
          <path d="M0,50 Q50,30 100,50 T200,50" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.1" />
          <path d="M0,70 Q50,50 100,70 T200,70" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#beach)" />
    </svg>
  );
}
