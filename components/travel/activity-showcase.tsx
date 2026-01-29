"use client";

import { Coffee, Camera, Utensils, ShoppingBag, Music, Palette, Bike, Waves } from 'lucide-react';
import React from 'react';

interface Activity {
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface ActivityShowcaseProps {
  destination: string;
  activities: Activity[];
  themeColor: string;
}

export function ActivityShowcase({ destination, activities, themeColor }: ActivityShowcaseProps) {
  const iconMap: Record<string, React.ReactElement> = {
    coffee: <Coffee className="w-6 h-6" />,
    camera: <Camera className="w-6 h-6" />,
    food: <Utensils className="w-6 h-6" />,
    shopping: <ShoppingBag className="w-6 h-6" />,
    music: <Music className="w-6 h-6" />,
    art: <Palette className="w-6 h-6" />,
    bike: <Bike className="w-6 h-6" />,
    water: <Waves className="w-6 h-6" />,
  };

  return (
    <div className="my-6 relative group">
      <div 
        className="absolute -inset-1 rounded-[2rem] opacity-30 group-hover:opacity-40 blur-2xl transition-opacity"
        style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}88)` }}
      />
      
      <div className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden border-2" style={{ borderColor: `${themeColor}30` }}>
        {/* Header */}
        <div className="p-7 border-b-2 border-slate-100">
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            Things to Do in {destination}
          </h3>
          <p className="text-slate-600 font-medium">Curated experiences for you</p>
        </div>

        {/* Activities Grid */}
        <div className="p-7 grid grid-cols-2 md:grid-cols-4 gap-4">
          {activities.map((activity, idx) => (
            <div
              key={idx}
              className="group/card relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${activity.color}15, ${activity.color}25)` }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover/card:opacity-10 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${activity.color}, ${activity.color}dd)` }}
              />
              
              <div className="relative">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg text-white"
                  style={{ background: `linear-gradient(135deg, ${activity.color}, ${activity.color}dd)` }}
                >
                  {iconMap[activity.icon] || <Camera className="w-6 h-6" />}
                </div>
                <h4 className="text-base font-black text-slate-900 mb-2">{activity.name}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
