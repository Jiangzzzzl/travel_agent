'use client';

import { Quote } from 'lucide-react';

interface QuoteCardProps {
  text: string;
  author?: string;
  color?: string;
}

export function QuoteCard({ text, author, color = '#8B5CF6' }: QuoteCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="absolute top-4 left-4 text-6xl opacity-10">
        <Quote className="w-16 h-16" />
      </div>
      
      <div className="relative">
        <p className="text-2xl font-bold text-slate-800 leading-relaxed mb-4 italic">
          "{text}"
        </p>
        {author && (
          <p className="text-sm font-semibold text-slate-600">
            — {author}
          </p>
        )}
      </div>
      
      <div 
        className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"
        style={{ color }}
      />
    </div>
  );
}
