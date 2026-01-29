'use client';

import { GenUIAttractionSystem } from '@/components/travel/genui-attraction-system';

export default function TestGenUIPage() {
  // 测试数据 - 模拟从AI生成的景点数据
  const testAttractions = [
    {
      name: '故宫博物院',
      location: '北京市东城区',
      description: '明清两代的皇家宫殿，世界文化遗产，拥有丰富的历史文物和建筑艺术。',
      tags: ['历史', '文化', '建筑', '博物馆'],
      vibeColor: '#8B5CF6',
      emoji: '🏛️',
      rating: 4.8,
      bestTime: '上午9-11点',
      estimatedDuration: '3-4小时',
      attractionType: 'historical'
    },
    {
      name: '天坛公园',
      location: '北京市东城区',
      description: '明清皇帝祭天的场所，建筑精美，园林优雅，是北京的标志性景点。',
      tags: ['历史', '建筑', '公园', '祭祀'],
      vibeColor: '#10B981',
      emoji: '⛩️',
      rating: 4.6,
      bestTime: '早晨6-8点',
      estimatedDuration: '2-3小时',
      attractionType: 'historical'
    },
    {
      name: '颐和园',
      location: '北京市海淀区',
      description: '清朝皇家园林，以昆明湖和万寿山为主体，是中国古典园林艺术的杰作。',
      tags: ['园林', '历史', '湖泊', '建筑'],
      vibeColor: '#3B82F6',
      emoji: '🏞️',
      rating: 4.7,
      bestTime: '下午2-5点',
      estimatedDuration: '3-4小时',
      attractionType: 'nature'
    },
    {
      name: '南锣鼓巷',
      location: '北京市东城区',
      description: '保存完整的胡同街区，汇集了众多特色小店、咖啡馆和传统小吃。',
      tags: ['胡同', '购物', '美食', '文化'],
      vibeColor: '#F59E0B',
      emoji: '🏘️',
      rating: 4.3,
      bestTime: '下午3-7点',
      estimatedDuration: '2-3小时',
      attractionType: 'cultural'
    },
    {
      name: '王府井步行街',
      location: '北京市东城区',
      description: '北京最著名的商业街之一，汇集了各种品牌店铺和传统小吃。',
      tags: ['购物', '美食', '商业', '步行街'],
      vibeColor: '#EF4444',
      emoji: '🛍️',
      rating: 4.2,
      bestTime: '晚上6-9点',
      estimatedDuration: '2-3小时',
      attractionType: 'modern'
    },
    {
      name: '北京烤鸭店',
      location: '北京市朝阳区',
      description: '品尝正宗北京烤鸭的最佳去处，传统工艺制作，口感鲜美。',
      tags: ['美食', '烤鸭', '传统', '餐厅'],
      vibeColor: '#DC2626',
      emoji: '🦆',
      rating: 4.5,
      bestTime: '晚餐时间',
      estimatedDuration: '1-2小时',
      attractionType: 'food'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            GenUI 景点推荐系统测试
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            基于 Flutter GenUI 设计理念的动态 UI 系统，支持多种视图模式、智能筛选和响应式布局
          </p>
        </div>

        {/* GenUI 系统 */}
        <GenUIAttractionSystem
          attractions={testAttractions}
          destination="北京"
          layout="adaptive"
        />

        {/* 返回按钮 */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            ← 返回主页
          </a>
        </div>
      </div>
    </div>
  );
}