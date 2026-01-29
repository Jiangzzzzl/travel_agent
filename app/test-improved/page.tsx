'use client';

import { useState } from 'react';
import { ImmersiveDestinationExperience } from '../../components/travel/immersive-destination-experience';
import { ImmersiveFullscreenWrapper } from '../../components/travel/immersive-fullscreen-wrapper';
import { radicalUIGenerator } from '../../lib/radical-ui-generator';

// 测试数据 - 北京的8个景点
const testAttractions = [
  {
    name: '故宫博物院',
    location: '北京市东城区',
    description: '明清两代的皇家宫殿，世界文化遗产，见证了中华文明的辉煌历史',
    tags: ['历史', '文化', '建筑'],
    vibeColor: '#DC143C',
    emoji: '🏯',
    rating: 4.8,
    bestTime: '上午',
    estimatedDuration: '3-4小时',
    attractionType: 'cultural'
  },
  {
    name: '天安门广场',
    location: '北京市东城区',
    description: '世界最大的城市广场，见证历史的地方，中华民族的象征',
    tags: ['历史', '政治', '地标'],
    vibeColor: '#FFD700',
    emoji: '🏛️',
    rating: 4.7,
    bestTime: '早晨',
    estimatedDuration: '1-2小时',
    attractionType: 'landmark'
  },
  {
    name: '万里长城',
    location: '北京市延庆区',
    description: '万里长城的精华段，世界七大奇迹之一，中华民族的脊梁',
    tags: ['历史', '自然', '徒步'],
    vibeColor: '#8B4513',
    emoji: '🏔️',
    rating: 4.9,
    bestTime: '全天',
    estimatedDuration: '半天',
    attractionType: 'natural'
  },
  {
    name: '颐和园',
    location: '北京市海淀区',
    description: '清代皇家园林，中国古典园林艺术的杰作，山水与建筑的完美融合',
    tags: ['园林', '历史', '湖泊'],
    vibeColor: '#228B22',
    emoji: '🏞️',
    rating: 4.6,
    bestTime: '下午',
    estimatedDuration: '2-3小时',
    attractionType: 'cultural'
  },
  {
    name: '天坛公园',
    location: '北京市东城区',
    description: '明清皇帝祭天的场所，建筑艺术的瑰宝，天人合一的哲学体现',
    tags: ['历史', '建筑', '宗教'],
    vibeColor: '#4682B4',
    emoji: '⛩️',
    rating: 4.5,
    bestTime: '上午',
    estimatedDuration: '2小时',
    attractionType: 'cultural'
  },
  {
    name: '北海公园',
    location: '北京市西城区',
    description: '中国现存最古老的皇家园林之一，白塔倒影，诗情画意',
    tags: ['园林', '湖泊', '历史'],
    vibeColor: '#20B2AA',
    emoji: '🌸',
    rating: 4.4,
    bestTime: '下午',
    estimatedDuration: '2-3小时',
    attractionType: 'natural'
  },
  {
    name: '雍和宫',
    location: '北京市东城区',
    description: '北京最大的藏传佛教寺院，香火鼎盛，建筑精美',
    tags: ['宗教', '建筑', '文化'],
    vibeColor: '#DAA520',
    emoji: '🏮',
    rating: 4.3,
    bestTime: '上午',
    estimatedDuration: '1-2小时',
    attractionType: 'cultural'
  },
  {
    name: '什刹海',
    location: '北京市西城区',
    description: '老北京风情的胡同和酒吧街，传统与现代的完美交融',
    tags: ['胡同', '夜生活', '文化'],
    vibeColor: '#FF6347',
    emoji: '🛶',
    rating: 4.2,
    bestTime: '傍晚',
    estimatedDuration: '2-3小时',
    attractionType: 'cultural'
  }
];

export default function TestImprovedPage() {
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  const destination = '北京';
  const personality = radicalUIGenerator.analyzeCityPersonality(destination);
  const theme = radicalUIGenerator.generateRadicalTheme(personality);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-6">
            🌟 改进版沉浸式体验测试
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            测试所有改进功能：美观界面、爱心保存、图片生成、全屏体验
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 功能列表 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">✅ 改进功能</h2>
            <div className="space-y-4 text-white/90">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>全新Apple风格界面设计</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>爱心点击保存功能（localStorage）</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>改进的图片生成系统</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>全屏沉浸式体验</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>优雅的动画效果</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>响应式设计优化</span>
              </div>
            </div>
          </div>

          {/* 系统信息 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">🎨 系统信息</h2>
            <div className="space-y-3 text-sm text-white/90">
              <div className="flex justify-between">
                <span>目的地:</span>
                <span className="font-bold">{destination}</span>
              </div>
              <div className="flex justify-between">
                <span>景点数量:</span>
                <span className="font-bold">{testAttractions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>城市个性:</span>
                <span className="font-bold">{personality.soul}</span>
              </div>
              <div className="flex justify-between">
                <span>主题类型:</span>
                <span className="font-bold">{theme.layout.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>主色调:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: personality.colors.primary }}
                  />
                  <span className="font-mono text-xs">{personality.colors.primary}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 测试按钮 */}
        <div className="text-center space-y-6">
          <button
            onClick={() => setShowFullscreen(true)}
            className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 rounded-3xl text-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <span className="text-3xl">🚀</span>
              <span>启动改进版沉浸式体验</span>
            </div>
          </button>
          
          <p className="text-white/60 text-lg">
            点击按钮体验全屏沉浸式界面，测试所有新功能
          </p>
        </div>

        {/* 全屏沉浸式体验 */}
        {showFullscreen && (
          <ImmersiveFullscreenWrapper onClose={() => setShowFullscreen(false)}>
            <ImmersiveDestinationExperience
              destination={destination}
              attractions={testAttractions}
              personality={personality}
              theme={theme}
            />
          </ImmersiveFullscreenWrapper>
        )}
      </div>
    </div>
  );
}