import { Calendar, MapPin, Clock, Star, Utensils, Camera, Info } from 'lucide-react';

interface ItineraryDay {
  day: string;
  title: string;
  activities: Array<{
    time: string;
    location: string;
    description: string;
    type: 'attraction' | 'food' | 'rest' | 'photo';
    imageUrl?: string;
  }>;
}

interface ItineraryCardProps {
  destination: string;
  days: ItineraryDay[];
  themeColor?: string;
}

export function ItineraryCard({ destination, days, themeColor = '#8B5CF6' }: ItineraryCardProps) {
  const typeIcons = {
    attraction: <MapPin className="w-4 h-4" />,
    food: <Utensils className="w-4 h-4" />,
    rest: <Clock className="w-4 h-4" />,
    photo: <Camera className="w-4 h-4" />,
  };

  const typeColors = {
    attraction: '#3B82F6',
    food: '#F59E0B',
    rest: '#10B981',
    photo: '#EC4899',
  };
  
  const typeEmojis = {
    attraction: ['🎯', '📍', '🗺️', '🧭'],
    food: ['🍽️', '🥘', '🍜', '🥢'],
    rest: ['☕', '🛋️', '🌙', '💤'],
    photo: ['📸', '🎨', '🌅', '✨'],
  };
  
  const dayEmojis = ['☀️', '🌤️', '⭐', '🌙', '🌈', '🎪', '🎉'];

  return (
    <div className="my-6 relative group">
      <div 
        className="absolute -inset-1 rounded-[2rem] opacity-30 group-hover:opacity-40 blur-2xl transition-opacity"
        style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}88)` }}
      />
      
      <div className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden border-2" style={{ borderColor: `${themeColor}30` }}>
        {/* 头部 */}
        <div 
          className="p-8 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          
          {/* 浮动装饰 emoji */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            {dayEmojis.map((emoji, idx) => (
              <div
                key={idx}
                className="absolute text-5xl animate-float"
                style={{
                  left: `${10 + idx * 15}%`,
                  top: `${20 + (idx % 3) * 25}%`,
                  animationDelay: `${idx * 0.8}s`,
                  animationDuration: `${10 + idx * 2}s`,
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
          
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6" />
                <span className="text-sm font-bold opacity-90">行程规划</span>
              </div>
              <h3 className="text-4xl font-black mb-2">{destination}</h3>
              <p className="text-white/80 font-medium">{days.length} 天深度游</p>
            </div>
            <div className="text-right bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-4xl font-black">{days.length}</div>
              <div className="text-sm font-bold opacity-90">天</div>
            </div>
          </div>
        </div>

        {/* 行程内容 */}
        <div className="p-7">
          <div className="space-y-6">
            {days.map((day, dayIdx) => (
              <div key={dayIdx} className="relative">
                {/* 日期标题 */}
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="px-5 py-2 rounded-2xl text-white font-black shadow-lg flex items-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }}
                  >
                    <span className="text-2xl">{dayEmojis[dayIdx % dayEmojis.length]}</span>
                    <span>{day.day}</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900">{day.title}</h4>
                </div>

                {/* 活动列表 */}
                <div className="space-y-3 ml-4 pl-6 border-l-2" style={{ borderColor: `${themeColor}30` }}>
                  {day.activities.map((activity, actIdx) => (
                    <div 
                      key={actIdx}
                      className="group/activity relative bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-slate-200"
                    >
                      {/* 时间线圆点 */}
                      <div 
                        className="absolute -left-[2.15rem] top-6 w-4 h-4 rounded-full border-4 border-white shadow-lg"
                        style={{ backgroundColor: typeColors[activity.type] }}
                      />

                      <div className="flex items-start gap-4">
                        {/* 活动缩略图 */}
                        {activity.imageUrl && (
                          <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-lg bg-slate-100">
                            <img 
                              src={activity.imageUrl} 
                              alt={activity.location}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/activity:scale-110"
                              loading="lazy"
                            />
                          </div>
                        )}
                        
                        <div 
                          className="flex-shrink-0 p-3 rounded-xl shadow-md relative"
                          style={{ backgroundColor: `${typeColors[activity.type] || typeColors.attraction}15` }}
                        >
                          <div className="absolute -top-1 -right-1 text-lg">
                            {typeEmojis[activity.type] 
                              ? typeEmojis[activity.type][actIdx % typeEmojis[activity.type].length]
                              : typeEmojis.attraction[actIdx % typeEmojis.attraction.length]
                            }
                          </div>
                          <div style={{ color: typeColors[activity.type] || typeColors.attraction }}>
                            {typeIcons[activity.type] || typeIcons.attraction}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-black text-slate-600">{activity.time}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-sm font-bold text-slate-900">{activity.location}</span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 底部提示 */}
          <div 
            className="mt-8 p-5 rounded-2xl flex items-start gap-3"
            style={{ background: `linear-gradient(135deg, ${themeColor}08, ${themeColor}15)` }}
          >
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: themeColor }} />
            <div className="text-sm text-slate-700 leading-relaxed">
              <strong className="font-black" style={{ color: themeColor }}>温馨提示：</strong>
              以上行程仅供参考，实际游玩时间可根据个人喜好调整。建议提前预订门票和住宿。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
