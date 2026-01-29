import { MapPin, Navigation, Clock, TrendingUp, Flag, Share2, Download } from 'lucide-react';

interface RouteStop {
  name: string;
  time: string;
  duration: string;
  description: string;
}

interface RouteMapProps {
  title: string;
  stops: RouteStop[];
  totalDistance?: string;
  totalTime?: string;
  themeColor?: string;
}

export function RouteMap({ 
  title, 
  stops, 
  totalDistance = "15km",
  totalTime = "1天",
  themeColor = "#8B5CF6"
}: RouteMapProps) {
  return (
    <div className="my-6 relative group">
      {/* 外层光晕 */}
      <div 
        className="absolute -inset-1 rounded-[2rem] opacity-30 group-hover:opacity-40 blur-2xl transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}88)` }}
      />
      
      <div className="relative rounded-[2rem] bg-white border-2 shadow-2xl overflow-hidden" style={{ borderColor: `${themeColor}30` }}>
        {/* 头部横幅 */}
        <div 
          className="relative p-8 text-white overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }}
        >
          {/* 装饰性背景 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold opacity-90">智能路线规划</span>
                </div>
                <h3 className="text-4xl font-black mb-2 leading-tight">{title}</h3>
                <p className="text-white/80 text-sm font-medium">为你精心设计的旅行路线</p>
              </div>
              <div className="text-right bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-4xl font-black mb-1">{stops.length}</div>
                <div className="text-sm font-bold opacity-90">个站点</div>
              </div>
            </div>
            
            <div className="flex gap-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs opacity-80 font-medium">总距离</p>
                  <p className="text-lg font-black">{totalDistance}</p>
                </div>
              </div>
              <div className="w-px bg-white/30" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs opacity-80 font-medium">预计时长</p>
                  <p className="text-lg font-black">{totalTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 路线站点 */}
        <div className="p-7">
          <div className="relative">
            {stops.map((stop, idx) => (
              <div key={idx} className="relative flex gap-5 pb-6 last:pb-0">
                {/* 时间线 */}
                <div className="relative flex flex-col items-center">
                  <div 
                    className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-2xl z-10 text-lg"
                    style={{ 
                      background: idx === 0 
                        ? `linear-gradient(135deg, #10B981, #059669)` 
                        : idx === stops.length - 1 
                        ? `linear-gradient(135deg, #EF4444, #DC2626)`
                        : `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` 
                    }}
                  >
                    {idx === 0 ? <Flag className="w-6 h-6" /> : idx === stops.length - 1 ? <MapPin className="w-6 h-6" /> : idx + 1}
                  </div>
                  {idx < stops.length - 1 && (
                    <div 
                      className="w-1 h-full absolute top-12 rounded-full"
                      style={{ 
                        background: `linear-gradient(180deg, ${themeColor}80, ${themeColor}40)` 
                      }}
                    />
                  )}
                </div>

                {/* 内容卡片 */}
                <div className="flex-1 pt-1">
                  <div 
                    className="group/card bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 hover:from-white hover:to-slate-50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02] border-2 border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-xl font-black text-slate-900 mb-2">{stop.name}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm font-bold text-slate-700">
                            <Clock className="w-4 h-4" style={{ color: themeColor }} />
                            {stop.time}
                          </span>
                          <span className="px-3 py-1.5 bg-white rounded-xl shadow-sm font-bold" style={{ color: themeColor }}>
                            {stop.duration}
                          </span>
                        </div>
                      </div>
                      <div 
                        className="p-3 rounded-2xl shadow-md"
                        style={{ backgroundColor: `${themeColor}15` }}
                      >
                        <MapPin className="w-6 h-6" style={{ color: themeColor }} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {stop.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 底部操作栏 */}
          <div className="mt-8 pt-6 border-t-2 border-slate-100 flex gap-3">
            <button 
              className="flex-1 py-4 rounded-2xl font-black text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-base"
              style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }}
            >
              <Navigation className="w-5 h-5" />
              开始导航
            </button>
            <button className="px-6 py-4 rounded-2xl font-black text-slate-700 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              分享
            </button>
            <button className="px-6 py-4 rounded-2xl font-black text-slate-700 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
