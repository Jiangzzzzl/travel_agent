import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, Eye } from 'lucide-react';

interface WeatherWidgetProps {
  city: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  humidity: number;
  windSpeed: number;
  forecast?: Array<{ day: string; temp: number; condition: string }>;
}

export function WeatherWidget({ 
  city, 
  temperature, 
  condition, 
  humidity, 
  windSpeed,
  forecast = []
}: WeatherWidgetProps) {
  const weatherConfig = {
    sunny: {
      icon: <Sun className="w-20 h-20" />,
      gradient: 'from-amber-400 via-orange-400 to-red-400',
      bg: 'from-amber-50 via-orange-50 to-red-50',
      text: '晴朗',
      color: '#F59E0B'
    },
    cloudy: {
      icon: <Cloud className="w-20 h-20" />,
      gradient: 'from-slate-400 via-gray-400 to-slate-500',
      bg: 'from-slate-50 via-gray-50 to-slate-100',
      text: '多云',
      color: '#64748B'
    },
    rainy: {
      icon: <CloudRain className="w-20 h-20" />,
      gradient: 'from-blue-400 via-cyan-400 to-blue-500',
      bg: 'from-blue-50 via-cyan-50 to-blue-100',
      text: '雨天',
      color: '#3B82F6'
    },
  };

  const config = weatherConfig[condition];

  return (
    <div className="my-6 relative group">
      {/* 外层光晕 */}
      <div 
        className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} rounded-[2rem] opacity-20 group-hover:opacity-30 blur-2xl transition-opacity duration-500`}
      />
      
      <div className={`relative rounded-[2rem] bg-gradient-to-br ${config.bg} border-2 border-white shadow-2xl overflow-hidden`}>
        {/* 装饰性背景图案 */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-full blur-3xl`} />
        </div>

        <div className="relative p-7">
          {/* 头部 */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-3xl font-black text-slate-900 mb-1">{city}</h3>
              <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                实时天气预报
              </p>
            </div>
            <div className={`px-5 py-2.5 rounded-2xl bg-gradient-to-r ${config.gradient} text-white text-sm font-black shadow-xl flex items-center gap-2`}>
              <Thermometer className="w-4 h-4" />
              适合出行
            </div>
          </div>

          {/* 主要天气信息 */}
          <div className="flex items-center justify-between mb-8 p-6 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg">
            <div className="flex items-center gap-6">
              <div className={`text-${condition === 'sunny' ? 'amber' : condition === 'rainy' ? 'blue' : 'slate'}-500`}>
                {config.icon}
              </div>
              <div>
                <div className="text-6xl font-black text-slate-900 mb-1">{temperature}°</div>
                <div className="text-lg font-bold" style={{ color: config.color }}>{config.text}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-md">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">湿度</p>
                  <p className="text-lg font-black text-slate-900">{humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-md">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <Wind className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">风速</p>
                  <p className="text-lg font-black text-slate-900">{windSpeed} km/h</p>
                </div>
              </div>
            </div>
          </div>

          {/* 未来天气预报 */}
          {forecast.length > 0 && (
            <div>
              <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                <div className={`w-1 h-4 rounded-full bg-gradient-to-b ${config.gradient}`} />
                未来天气趋势
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {forecast.map((day, idx) => (
                  <div 
                    key={idx}
                    className="group/day bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-default"
                  >
                    <div className="text-xs text-slate-600 font-bold mb-2">{day.day}</div>
                    <div className="text-2xl font-black text-slate-900 mb-1">{day.temp}°</div>
                    <div className="text-xs font-medium" style={{ color: config.color }}>{day.condition}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
