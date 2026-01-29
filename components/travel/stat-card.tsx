'use client';

interface StatCardProps {
  value: string;
  label: string;
  emoji: string;
  color?: string;
}

export function StatCard({ value, label, emoji, color = '#8B5CF6' }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div 
        className="absolute inset-0 opacity-5"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
      />
      
      <div className="relative p-6 text-center">
        <div className="text-5xl mb-3">{emoji}</div>
        <div 
          className="text-4xl font-black mb-2"
          style={{ color }}
        >
          {value}
        </div>
        <div className="text-sm font-bold text-slate-600 uppercase tracking-wide">
          {label}
        </div>
      </div>
      
      <div 
        className="h-1.5 bg-gradient-to-r from-transparent via-current to-transparent"
        style={{ color }}
      />
    </div>
  );
}
