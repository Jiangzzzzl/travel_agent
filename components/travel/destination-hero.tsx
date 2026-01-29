import { MapPin, Calendar, Users, Star, Sparkles } from 'lucide-react';

interface DestinationHeroProps {
  destination: string;
  tagline: string;
  highlights: string[];
  themeColor: string;
  emoji: string;
  backgroundPattern?: 'mountains' | 'waves' | 'city' | 'nature';
  imageUrl?: string;
}

export function DestinationHero({ 
  destination, 
  tagline, 
  highlights, 
  themeColor,
  emoji,
  backgroundPattern = 'nature',
  imageUrl
}: DestinationHeroProps) {
  const patterns = {
    mountains: (
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 400">
        <path d="M0,300 L200,100 L400,200 L600,50 L800,150 L1000,100 L1200,200 L1200,400 L0,400 Z" fill="currentColor" />
      </svg>
    ),
    waves: (
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 400">
        <path d="M0,200 Q300,100 600,200 T1200,200 L1200,400 L0,400 Z" fill="currentColor" />
        <path d="M0,250 Q300,150 600,250 T1200,250 L1200,400 L0,400 Z" fill="currentColor" opacity="0.5" />
      </svg>
    ),
    city: (
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 400">
        <rect x="50" y="200" width="80" height="200" fill="currentColor" />
        <rect x="150" y="150" width="100" height="250" fill="currentColor" />
        <rect x="270" y="180" width="90" height="220" fill="currentColor" />
        <rect x="380" y="120" width="120" height="280" fill="currentColor" />
        <rect x="520" y="160" width="100" height="240" fill="currentColor" />
        <rect x="640" y="140" width="110" height="260" fill="currentColor" />
        <rect x="770" y="190" width="95" height="210" fill="currentColor" />
        <rect x="885" y="170" width="105" height="230" fill="currentColor" />
        <rect x="1010" y="130" width="90" height="270" fill="currentColor" />
      </svg>
    ),
    nature: (
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1200 400">
        <circle cx="200" cy="150" r="80" fill="currentColor" />
        <circle cx="500" cy="200" r="100" fill="currentColor" />
        <circle cx="800" cy="180" r="90" fill="currentColor" />
        <circle cx="1000" cy="220" r="70" fill="currentColor" />
      </svg>
    ),
  };

  return (
    <div className="my-6 relative group">
      <div 
        className="absolute -inset-1 rounded-[2.5rem] opacity-40 group-hover:opacity-50 blur-2xl transition-opacity"
        style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}88)` }}
      />
      
      <div 
        className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-2"
        style={{ borderColor: `${themeColor}30` }}
      >
        {/* Hero Section */}
        <div 
          className="relative p-12 text-white overflow-hidden min-h-[400px] flex items-center"
          style={{ background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)` }}
        >
          {/* Background Image */}
          {imageUrl && (
            <div className="absolute inset-0">
              <img 
                src={imageUrl} 
                alt={destination}
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            </div>
          )}
          
          {/* Background Pattern (fallback if no image) */}
          {!imageUrl && (
            <div className="absolute inset-0 text-white">
              {patterns[backgroundPattern]}
            </div>
          )}

          {/* Floating Emoji */}
          <div className="absolute top-8 right-8 text-8xl opacity-20 animate-pulse">
            {emoji}
          </div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold opacity-90 uppercase tracking-wider">Destination</span>
            </div>
            
            <h2 className="text-6xl font-black mb-4 leading-tight">{destination}</h2>
            <p className="text-2xl font-medium opacity-90 mb-8 max-w-2xl">{tagline}</p>

            {/* Highlights */}
            <div className="flex flex-wrap gap-3">
              {highlights.map((highlight, idx) => (
                <div 
                  key={idx}
                  className="px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-white/30 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white/95 backdrop-blur-sm p-6">
          <div className="grid grid-cols-3 gap-6 max-w-4xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5" style={{ color: themeColor }} />
                <span className="text-sm font-bold text-slate-600">Best Season</span>
              </div>
              <p className="text-lg font-black text-slate-900">All Year</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5" style={{ color: themeColor }} />
                <span className="text-sm font-bold text-slate-600">Recommended</span>
              </div>
              <p className="text-lg font-black text-slate-900">3-5 Days</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5" style={{ color: themeColor }} />
                <span className="text-sm font-bold text-slate-600">Rating</span>
              </div>
              <p className="text-lg font-black text-slate-900">4.9/5.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
