'use client';

import { useState } from 'react';
import { ImmersiveDestinationExperience } from './immersive-destination-experience';
import { radicalUIGenerator } from '../../lib/radical-ui-generator';

// 测试数据 - 北京的8个景点
const testAttractions = [
  {
    name: '故宫博物院',
    location: '北京市东城区',
    description: '明清两代的皇家宫殿，世界文化遗产',
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
    description: '世界最大的城市广场，见证历史的地方',
    tags: ['历史', '政治', '地标'],
    vibeColor: '#FFD700',
    emoji: '🏛️',
    rating: 4.7,
    bestTime: '早晨',
    estimatedDuration: '1-2小时',
    attractionType: 'landmark'
  },
  {
    name: '长城',
    location: '北京市延庆区',
    description: '万里长城的精华段，世界七大奇迹之一',
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
    description: '清代皇家园林，中国古典园林艺术的杰作',
    tags: ['园林', '历史', '湖泊'],
    vibeColor: '#228B22',
    emoji: '🏞️',
    rating: 4.6,
    bestTime: '下午',
    estimatedDuration: '2-3小时',
    attractionType: 'cultural'
  },
  {
    name: '天坛',
    location: '北京市东城区',
    description: '明清皇帝祭天的场所，建筑艺术的瑰宝',
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
    description: '中国现存最古老的皇家园林之一',
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
    description: '北京最大的藏传佛教寺院',
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
    description: '老北京风情的胡同和酒吧街',
    tags: ['胡同', '夜生活', '文化'],
    vibeColor: '#FF6347',
    emoji: '🛶',
    rating: 4.2,
    bestTime: '傍晚',
    estimatedDuration: '2-3小时',
    attractionType: 'cultural'
  }
];

export function ImmersiveTest() {
  const [showImmersive, setShowImmersive] = useState(false);
  
  const destination = '北京';
  const personality = radicalUIGenerator.analyzeCityPersonality(destination);
  const theme = radicalUIGenerator.generateRadicalTheme(personality);

  if (showImmersive) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowImmersive(false)}
          className="fixed top-4 right-4 z-50 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
        >
          返回测试页面
        </button>
        <ImmersiveDestinationExperience
          destination={destination}
          attractions={testAttractions}
          personality={personality}
          theme={theme}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🌟 沉浸式体验系统测试
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">系统信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>目的地:</strong> {destination}
            </div>
            <div>
              <strong>景点数量:</strong> {testAttractions.length}
            </div>
            <div>
              <strong>城市个性:</strong> {personality.soul} ({personality.essence})
            </div>
            <div>
              <strong>主题类型:</strong> {theme.layout.type}
            </div>
            <div>
              <strong>主色调:</strong> 
              <span 
                className="inline-block w-4 h-4 rounded ml-2"
                style={{ backgroundColor: personality.colors.primary }}
              />
              {personality.colors.primary}
            </div>
            <div>
              <strong>背景类型:</strong> {theme.visuals.backgroundType}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">测试景点列表</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testAttractions.map((attraction, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{attraction.emoji}</span>
                  <h3 className="font-bold text-lg">{attraction.name}</h3>
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm">{attraction.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{attraction.description}</p>
                <div className="flex flex-wrap gap-1">
                  {attraction.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowImmersive(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl text-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🚀 启动沉浸式体验
          </button>
          <p className="text-gray-600 mt-4 text-sm">
            点击按钮体验AI生成的沉浸式目的地界面
          </p>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">⚠️ 注意事项</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• 需要配置即梦AI的API密钥才能生成图片</li>
            <li>• 图片生成可能需要几秒钟时间</li>
            <li>• 如果没有API密钥，界面仍会显示但不会有背景图片</li>
            <li>• 系统会在景点数量≥8时自动启用沉浸式体验</li>
          </ul>
        </div>
      </div>
    </div>
  );
}