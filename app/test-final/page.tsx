'use client';

import { useState, useEffect } from 'react';
import { ImmersiveDestinationExperience } from '../../components/travel/immersive-destination-experience';
import { ImmersiveFullscreenWrapper } from '../../components/travel/immersive-fullscreen-wrapper';
import { radicalUIGenerator } from '../../lib/radical-ui-generator';
import { jimengAIService } from '../../lib/jimeng-ai-service';
import { Sparkles, RefreshCw, Settings, Image, Heart, Eye } from 'lucide-react';

// 测试数据 - 不同城市的景点
const testDestinations = {
  '北京': [
    { name: '故宫博物院', description: '明清两朝的皇家宫殿，世界文化遗产', rating: 4.8, estimatedDuration: '3-4小时', emoji: '🏛️', tags: ['历史', '文化', '建筑'] },
    { name: '天安门广场', description: '世界最大的城市广场，见证历史的地方', rating: 4.7, estimatedDuration: '1-2小时', emoji: '🏛️', tags: ['历史', '政治', '地标'] },
    { name: '长城', description: '万里长城，中华民族的象征', rating: 4.9, estimatedDuration: '半天', emoji: '🏯', tags: ['历史', '奇迹', '徒步'] },
    { name: '颐和园', description: '清朝皇家园林，中国古典园林艺术的杰作', rating: 4.6, estimatedDuration: '2-3小时', emoji: '🏞️', tags: ['园林', '历史', '休闲'] },
    { name: '天坛', description: '明清皇帝祭天的场所，建筑艺术精品', rating: 4.5, estimatedDuration: '2小时', emoji: '⛩️', tags: ['历史', '建筑', '文化'] },
    { name: '雍和宫', description: '北京最大的藏传佛教寺院', rating: 4.4, estimatedDuration: '1-2小时', emoji: '🏯', tags: ['宗教', '文化', '建筑'] },
    { name: '南锣鼓巷', description: '保存完整的胡同街区，文艺青年聚集地', rating: 4.2, estimatedDuration: '2-3小时', emoji: '🏘️', tags: ['胡同', '文艺', '购物'] },
    { name: '798艺术区', description: '当代艺术的聚集地，创意文化园区', rating: 4.3, estimatedDuration: '2-4小时', emoji: '🎨', tags: ['艺术', '创意', '现代'] }
  ],
  '上海': [
    { name: '外滩', description: '上海的标志性景观，万国建筑博览群', rating: 4.7, estimatedDuration: '2-3小时', emoji: '🌃', tags: ['地标', '建筑', '夜景'] },
    { name: '东方明珠', description: '上海的象征，亚洲第一高塔', rating: 4.5, estimatedDuration: '2小时', emoji: '🗼', tags: ['地标', '观景', '现代'] },
    { name: '豫园', description: '明代私人花园，江南古典园林代表', rating: 4.4, estimatedDuration: '2小时', emoji: '🏮', tags: ['园林', '历史', '文化'] },
    { name: '田子坊', description: '石库门建筑群改造的创意园区', rating: 4.3, estimatedDuration: '2-3小时', emoji: '🏘️', tags: ['文艺', '创意', '购物'] },
    { name: '上海博物馆', description: '中国古代艺术品的宝库', rating: 4.6, estimatedDuration: '2-3小时', emoji: '🏛️', tags: ['博物馆', '文化', '艺术'] },
    { name: '新天地', description: '石库门建筑与现代商业的完美结合', rating: 4.2, estimatedDuration: '2-4小时', emoji: '🏢', tags: ['现代', '购物', '餐饮'] },
    { name: '朱家角古镇', description: '江南水乡古镇，小桥流水人家', rating: 4.4, estimatedDuration: '半天', emoji: '🛶', tags: ['古镇', '水乡', '历史'] },
    { name: '上海迪士尼', description: '梦幻王国，全家欢乐的主题乐园', rating: 4.8, estimatedDuration: '全天', emoji: '🏰', tags: ['娱乐', '家庭', '现代'] }
  ],
  '西安': [
    { name: '兵马俑', description: '世界第八大奇迹，秦始皇陵的守护者', rating: 4.9, estimatedDuration: '3-4小时', emoji: '🏺', tags: ['历史', '考古', '奇迹'] },
    { name: '大雁塔', description: '唐代佛教建筑，玄奘法师译经之地', rating: 4.6, estimatedDuration: '2小时', emoji: '🏯', tags: ['佛教', '历史', '建筑'] },
    { name: '西安城墙', description: '中国现存最完整的古代城垣建筑', rating: 4.7, estimatedDuration: '2-3小时', emoji: '🏰', tags: ['历史', '建筑', '骑行'] },
    { name: '华清宫', description: '唐代皇家温泉宫殿，杨贵妃沐浴之地', rating: 4.5, estimatedDuration: '2-3小时', emoji: '♨️', tags: ['历史', '温泉', '爱情'] },
    { name: '回民街', description: '西安著名的美食文化街区', rating: 4.3, estimatedDuration: '2-3小时', emoji: '🍜', tags: ['美食', '文化', '夜市'] },
    { name: '大明宫遗址', description: '唐朝皇宫遗址，盛唐文明的见证', rating: 4.4, estimatedDuration: '2-3小时', emoji: '🏛️', tags: ['历史', '遗址', '文化'] },
    { name: '陕西历史博物馆', description: '中华文明的宝库，古都文物荟萃', rating: 4.8, estimatedDuration: '2-3小时', emoji: '🏛️', tags: ['博物馆', '历史', '文物'] },
    { name: '华山', description: '五岳之一，奇险天下第一山', rating: 4.7, estimatedDuration: '全天', emoji: '⛰️', tags: ['自然', '登山', '险峻'] }
  ]
};

export default function TestFinalPage() {
  const [selectedDestination, setSelectedDestination] = useState('北京');
  const [personality, setPersonality] = useState<any>(null);
  const [theme, setTheme] = useState<any>(null);
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    generateExperience();
    checkServiceStatus();
    updateSavedCount();
  }, [selectedDestination]);

  const generateExperience = () => {
    const cityPersonality = radicalUIGenerator.analyzeCityPersonality(selectedDestination);
    const uiTheme = radicalUIGenerator.generateRadicalTheme(cityPersonality);
    setPersonality(cityPersonality);
    setTheme(uiTheme);
  };

  const checkServiceStatus = () => {
    const status = jimengAIService.getServiceStatus();
    setServiceStatus(status);
  };

  const updateSavedCount = () => {
    const saved = JSON.parse(localStorage.getItem('savedAttractions') || '[]');
    setSavedCount(saved.length);
  };

  const clearSavedAttractions = () => {
    localStorage.removeItem('savedAttractions');
    setSavedCount(0);
  };

  const attractions = testDestinations[selectedDestination as keyof typeof testDestinations] || [];

  if (!personality || !theme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-xl">正在生成体验...</p>
        </div>
      </div>
    );
  }

  const ExperienceContent = () => (
    <ImmersiveDestinationExperience
      destination={selectedDestination}
      attractions={attractions}
      personality={personality}
      theme={theme}
      onAttractionSelect={(attraction) => {
        console.log('Selected attraction:', attraction);
        updateSavedCount();
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* 控制面板 */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 目的地选择器 */}
          <div className="relative">
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="bg-black/50 backdrop-blur-xl text-white px-4 py-2 rounded-xl border border-white/20 focus:outline-none focus:border-white/40"
            >
              {Object.keys(testDestinations).map(dest => (
                <option key={dest} value={dest} className="bg-gray-800">{dest}</option>
              ))}
            </select>
          </div>

          {/* 重新生成按钮 */}
          <button
            onClick={generateExperience}
            className="bg-white/20 backdrop-blur-xl text-white p-2 rounded-xl border border-white/20 hover:bg-white/30 transition-all duration-300"
            title="重新生成体验"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* 设置按钮 */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-white/20 backdrop-blur-xl text-white p-2 rounded-xl border border-white/20 hover:bg-white/30 transition-all duration-300"
            title="显示设置"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* 状态指示器 */}
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20">
            <div className={`w-2 h-2 rounded-full ${serviceStatus?.isConfigured ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span className="text-white text-sm">
              {serviceStatus?.isConfigured ? 'AI已配置' : '使用备用图片'}
            </span>
          </div>

          {/* 收藏计数 */}
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-white text-sm">{savedCount} 已收藏</span>
          </div>

          {/* 全屏切换 */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-white/20 backdrop-blur-xl text-white p-2 rounded-xl border border-white/20 hover:bg-white/30 transition-all duration-300"
            title={isFullscreen ? '退出全屏' : '全屏模式'}
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed top-20 left-4 z-40 bg-black/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md">
          <h3 className="text-white font-bold text-lg mb-4">🎛️ 体验设置</h3>
          
          <div className="space-y-4 text-white/90">
            <div>
              <div className="text-sm text-white/60 mb-2">城市个性</div>
              <div className="text-sm bg-white/10 rounded-lg p-3">
                <div><strong>灵魂:</strong> {personality.soul}</div>
                <div><strong>能量:</strong> {personality.energy}</div>
                <div><strong>时代:</strong> {personality.era}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-white/60 mb-2">UI主题</div>
              <div className="text-sm bg-white/10 rounded-lg p-3">
                <div><strong>布局:</strong> {theme.layout.cardArrangement}</div>
                <div><strong>动画:</strong> {theme.animations.primary}</div>
                <div className="flex gap-2 mt-2">
                  {theme.colors.palette.slice(0, 3).map((color: string, i: number) => (
                    <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-white/60 mb-2">图片生成</div>
              <div className="text-sm bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  <span>{serviceStatus?.authMethod || 'Unsplash备用'}</span>
                </div>
                <div className="text-xs text-white/60 mt-1">
                  {serviceStatus?.isConfigured ? '使用AI生成图片' : '使用高质量备用图片'}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearSavedAttractions}
                className="flex-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
              >
                清空收藏
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-white/20 text-white px-3 py-2 rounded-lg text-sm hover:bg-white/30 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 主要内容 */}
      {isFullscreen ? (
        <ImmersiveFullscreenWrapper>
          <ExperienceContent />
        </ImmersiveFullscreenWrapper>
      ) : (
        <ExperienceContent />
      )}

      {/* 底部信息栏 */}
      <div className="fixed bottom-4 left-4 right-4 z-40 flex justify-center">
        <div className="bg-black/50 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20">
          <div className="flex items-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>AI生成式UI体验</span>
            </div>
            <div>•</div>
            <div>布局: {theme.layout.cardArrangement}</div>
            <div>•</div>
            <div>{attractions.length} 个景点</div>
            <div>•</div>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${serviceStatus?.isConfigured ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span>{serviceStatus?.isConfigured ? 'BytePlus AI' : 'Unsplash'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}