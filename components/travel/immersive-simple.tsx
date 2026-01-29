'use client';

import { useState, useEffect } from 'react';
import { CityPersonality, RadicalUITheme } from '../../lib/radical-ui-generator';
import { Sparkles, Clock, Star, Heart } from 'lucide-react';

interface ImmersiveSimpleProps {
  destination: string;
  attractions: any[];
  personality: CityPersonality;
  theme: RadicalUITheme;
  onAttractionSelect?: (attraction: any) => void;
}

export function ImmersiveSimple({
  destination,
  attractions,
  personality,
  theme,
  onAttractionSelect
}: ImmersiveSimpleProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">正在生成 {destination} 的视觉体验</h2>
          <p className="text-white/80">AI正在为您创造独一无二的旅行画面...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen overflow-y-auto"
      style={{ 
        background: getSimpleBackground(personality.soul)
      }}
    >
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="text-center text-white max-w-4xl px-8">
          <h1 
            className="text-8xl md:text-9xl font-black mb-6 tracking-tight"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.palette[0]}, ${theme.colors.palette[1]})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }}
          >
            {destination}
          </h1>
          
          <p className="text-2xl md:text-3xl font-light mb-12 leading-relaxed">
            {personality.essence}
          </p>

          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">{attractions.length} 个精选景点</span>
            </div>
          </div>
        </div>
      </section>

      {/* Attractions Section */}
      <section className="relative min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black mb-6 text-white">
              精选景点
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              探索{destination}的独特魅力
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {attractions.slice(0, 6).map((attraction, index) => (
              <SimpleAttractionCard
                key={attraction.name}
                attraction={attraction}
                theme={theme}
                index={index}
                onSelect={onAttractionSelect}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SimpleAttractionCard({ attraction, theme, index, onSelect }: any) {
  return (
    <div
      className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
      onClick={() => onSelect?.(attraction)}
    >
      <div className="relative h-96 rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
        {/* Placeholder for image */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
          <h3 className="text-2xl font-bold mb-2">{attraction.name}</h3>
          <p className="text-white/80 mb-4 line-clamp-2">{attraction.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {attraction.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{attraction.rating}</span>
                </div>
              )}
              
              {attraction.estimatedDuration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{attraction.estimatedDuration}</span>
                </div>
              )}
            </div>

            <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSimpleBackground(soul: string): string {
  const backgrounds = {
    'ancient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #374151 50%, #4B5563 75%, #6B7280 100%)',
    'romantic': 'linear-gradient(145deg, #1E1B4B 0%, #312E81 25%, #4C1D95 50%, #7C3AED 75%, #8B5CF6 100%)',
    'futuristic': 'linear-gradient(160deg, #0C0A09 0%, #1C1917 25%, #292524 50%, #44403C 75%, #57534E 100%)',
    'mystical': 'linear-gradient(170deg, #0C1445 0%, #1E1B4B 30%, #312E81 60%, #4338CA 80%, #4F46E5 100%)',
    'serene': 'linear-gradient(150deg, #064E3B 0%, #065F46 25%, #047857 50%, #059669 75%, #10B981 100%)',
    'vibrant': 'linear-gradient(140deg, #7C2D12 0%, #9A3412 25%, #C2410C 50%, #EA580C 75%, #F97316 100%)'
  };

  return backgrounds[soul as keyof typeof backgrounds] || backgrounds.ancient;
}

export default ImmersiveSimple;