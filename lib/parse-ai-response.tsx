import React from 'react';
import { DestinationHero } from '@/components/travel/destination-hero';
import { EnhancedAttractionCard } from '@/components/travel/enhanced-attraction-card';
import { ActivityShowcase } from '@/components/travel/activity-showcase';
import { ItineraryCard } from '@/components/travel/itinerary-card';
import { destinationContext } from '@/lib/destination-context';

// 解析 AI 响应，提取结构化信息并生成组件
export function parseAIResponse(content: string): React.ReactElement[] {
  const components: React.ReactElement[] = [];
  
  // 扩展的目的地检测（支持中英文）
  const destinationPatterns = [
    /(?:plan.*trip to|visit|explore|travel to|go to|想去|去|游览|旅游|打算去)\s*([A-Za-z\u4e00-\u9fa5]+(?:\s+[A-Za-z\u4e00-\u9fa5]+)?)/gi,
    /([A-Za-z\u4e00-\u9fa5]{2,})\s*(?:的景点|景点|有什么好玩|attractions?|places?|博物馆|寺庙|古迹)/gi,
    /([A-Za-z\u4e00-\u9fa5]{2,})\s*(?:\d+日游|\d+天|\d+日行程|itinerary|trip)/gi,
    // 新增：更直接的城市名检测
    /\b(西安|北京|上海|杭州|成都|大理|清迈|东京|巴黎|伦敦|纽约)\b/gi,
  ];
  
  let destination = '';
  for (const pattern of destinationPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const potentialDest = match[1];
      if (potentialDest && isValidDestination(potentialDest)) {
        destination = potentialDest;
        break;
      }
    }
    if (destination) break;
  }
  
  // 如果检测到目的地，设置到上下文中
  if (destination) {
    console.log('🎯 Detected destination from AI response:', destination);
    console.log('🎯 Destination type:', typeof destination);
    
    // 确保传递的是字符串
    const destinationStr = typeof destination === 'string' ? destination : String(destination);
    console.log('🎯 Destination string:', destinationStr);
    
    const detectedInfo = destinationContext.detectAndSetDestination(destinationStr);
    console.log('📍 Destination info set:', detectedInfo);
    
    const themeColor = getDestinationColor(destination);
    const emoji = getDestinationEmoji(destination);
    
    components.push(
      <DestinationHero
        key="destination"
        destination={destination}
        tagline={getDestinationTagline(destination)}
        highlights={getDestinationHighlights(destination)}
        themeColor={themeColor}
        emoji={emoji}
        backgroundPattern={getBackgroundPattern(destination)}
      />
    );
    
    // 自动添加活动展示
    components.push(
      <ActivityShowcase
        key="activities"
        destination={destination}
        activities={getDestinationActivities(destination)}
        themeColor={themeColor}
      />
    );
  }
  
  // 检测具体景点（扩展列表）
  const attractionKeywords = [
    { pattern: /西湖|West Lake/i, info: 'West Lake' },
    { pattern: /兵马俑|Terracotta Army/i, info: 'Terracotta Army' },
    { pattern: /城墙|City Wall/i, info: 'City Wall' },
    { pattern: /长城|Great Wall/i, info: 'Great Wall' },
    { pattern: /故宫|Forbidden City/i, info: 'Forbidden City' },
    { pattern: /洱海|Erhai Lake/i, info: 'Erhai Lake' },
    { pattern: /古城|Ancient Town/i, info: 'Ancient Town' },
    { pattern: /雷峰塔|Leifeng Pagoda/i, info: 'Leifeng Pagoda' },
    { pattern: /灵隐寺|Lingyin Temple/i, info: 'Lingyin Temple' },
    { pattern: /三潭印月|Three Pools/i, info: 'Three Pools' },
  ];
  
  attractionKeywords.forEach((item, idx) => {
    if (item.pattern.test(content)) {
      const attraction = getAttractionInfo(item.info);
      if (attraction) {
        components.push(
          <EnhancedAttractionCard
            key={`attraction-${idx}`}
            {...attraction}
          />
        );
      }
    }
  });
  
  return components;
}

// 验证是否是有效的目的地
function isValidDestination(text: string): boolean {
  const validDestinations = [
    'xi\'an', 'xian', '西安',
    'dali', '大理',
    'beijing', '北京',
    'shanghai', '上海',
    'hangzhou', '杭州',
    'chengdu', '成都',
    'lijiang', '丽江',
    'tokyo', '东京',
    'paris', '巴黎',
    'santorini', '圣托里尼',
    'london', '伦敦',
    'new york', '纽约',
    'chiang mai', '清迈',
    'guangzhou', '广州',
    'shenzhen', '深圳',
    'nanjing', '南京',
    'suzhou', '苏州',
    'tianjin', '天津',
    'chongqing', '重庆'
  ];
  
  const lower = text.toLowerCase().trim();
  
  // 直接匹配预定义城市
  const isKnownCity = validDestinations.some(dest => 
    lower === dest || 
    lower.includes(dest) || 
    dest.includes(lower)
  );
  
  if (isKnownCity) {
    return true;
  }
  
  // 对于未知城市，进行基本验证
  if (text.length < 2 || text.length > 15) {
    return false;
  }
  
  // 排除明显的非城市词汇
  const excludeWords = ['景点', '博物馆', '寺庙', '公园', '什么', '哪里', '推荐'];
  if (excludeWords.some(word => lower.includes(word))) {
    return false;
  }
  
  return /^[\u4e00-\u9fa5A-Za-z\s]{2,15}$/.test(text);
}

function getDestinationColor(destination: string): string {
  const colorMap: Record<string, string> = {
    'xi\'an': '#F59E0B', 'xian': '#F59E0B', '西安': '#F59E0B',
    'dali': '#3B82F6', '大理': '#3B82F6',
    'beijing': '#EF4444', '北京': '#EF4444',
    'shanghai': '#06B6D4', '上海': '#06B6D4',
    'hangzhou': '#14B8A6', '杭州': '#14B8A6',
    'chengdu': '#10B981', '成都': '#10B981',
    'lijiang': '#8B5CF6', '丽江': '#8B5CF6',
    'tokyo': '#A855F7', '东京': '#A855F7',
    'paris': '#F43F5E', '巴黎': '#F43F5E',
    'santorini': '#EC4899', '圣托里尼': '#EC4899',
  };
  
  const key = destination.toLowerCase().trim();
  for (const [dest, color] of Object.entries(colorMap)) {
    if (key.includes(dest) || dest.includes(key)) {
      return color;
    }
  }
  
  return '#8B5CF6';
}

function getDestinationEmoji(destination: string): string {
  const emojiMap: Record<string, string> = {
    'xi\'an': '🏛️', 'xian': '🏛️', '西安': '🏛️',
    'dali': '🌊', '大理': '🌊',
    'beijing': '🏯', '北京': '🏯',
    'shanghai': '🏙️', '上海': '🏙️',
    'hangzhou': '🌸', '杭州': '🌸',
    'chengdu': '🐼', '成都': '🐼',
    'lijiang': '🏔️', '丽江': '🏔️',
    'tokyo': '🗼', '东京': '🗼',
    'paris': '🗼', '巴黎': '🗼',
    'santorini': '🏖️', '圣托里尼': '🏖️',
  };
  
  const key = destination.toLowerCase().trim();
  for (const [dest, emoji] of Object.entries(emojiMap)) {
    if (key.includes(dest) || dest.includes(key)) {
      return emoji;
    }
  }
  return '✨';
}

function getDestinationTagline(destination: string): string {
  const taglineMap: Record<string, string> = {
    '杭州': 'Paradise on Earth - West Lake Beauty',
    'hangzhou': 'Paradise on Earth - West Lake Beauty',
    '西安': 'Ancient Capital of 13 Dynasties',
    'xian': 'Ancient Capital of 13 Dynasties',
    '大理': 'Romantic Erhai Lake & Ancient Town',
    'dali': 'Romantic Erhai Lake & Ancient Town',
    '北京': 'Imperial Capital with 3000 Years History',
    'beijing': 'Imperial Capital with 3000 Years History',
    '成都': 'Land of Abundance & Panda Hometown',
    'chengdu': 'Land of Abundance & Panda Hometown',
  };
  
  const key = destination.toLowerCase().trim();
  for (const [dest, tagline] of Object.entries(taglineMap)) {
    if (key.includes(dest) || dest.includes(key)) {
      return tagline;
    }
  }
  return `Discover the wonders of ${destination}`;
}

function getBackgroundPattern(destination: string): 'mountains' | 'waves' | 'city' | 'nature' {
  const dest = destination.toLowerCase();
  if (dest.includes('dali') || dest.includes('santorini')) return 'waves';
  if (dest.includes('tokyo') || dest.includes('shanghai')) return 'city';
  if (dest.includes('xi\'an') || dest.includes('xian') || dest.includes('beijing')) return 'city';
  return 'nature';
}

function getDestinationHighlights(destination: string): string[] {
  const highlightsMap: Record<string, string[]> = {
    'xi\'an': ['Terracotta Army', 'Ancient City Wall', 'Muslim Quarter', 'Tang Dynasty Culture'],
    'xian': ['Terracotta Army', 'Ancient City Wall', 'Muslim Quarter', 'Tang Dynasty Culture'],
    '西安': ['Terracotta Army', 'Ancient City Wall', 'Muslim Quarter', 'Tang Dynasty Culture'],
    'dali': ['Erhai Lake', 'Ancient Town', 'Three Pagodas', 'Cangshan Mountain'],
    '大理': ['Erhai Lake', 'Ancient Town', 'Three Pagodas', 'Cangshan Mountain'],
    'beijing': ['Forbidden City', 'Great Wall', 'Temple of Heaven', 'Summer Palace'],
    '北京': ['Forbidden City', 'Great Wall', 'Temple of Heaven', 'Summer Palace'],
    'hangzhou': ['West Lake', 'Lingyin Temple', 'Leifeng Pagoda', 'Longjing Tea'],
    '杭州': ['West Lake', 'Lingyin Temple', 'Leifeng Pagoda', 'Longjing Tea'],
    'chengdu': ['Giant Pandas', 'Jinli Street', 'Wuhou Temple', 'Hotpot Culture'],
    '成都': ['Giant Pandas', 'Jinli Street', 'Wuhou Temple', 'Hotpot Culture'],
    'tokyo': ['Shibuya Crossing', 'Senso-ji Temple', 'Tokyo Tower', 'Akihabara'],
    '东京': ['Shibuya Crossing', 'Senso-ji Temple', 'Tokyo Tower', 'Akihabara'],
  };
  
  const key = destination.toLowerCase().trim();
  for (const [dest, highlights] of Object.entries(highlightsMap)) {
    if (key.includes(dest) || dest.includes(key)) {
      return highlights;
    }
  }
  return ['Historic Sites', 'Local Culture', 'Scenic Views', 'Delicious Food'];
}

function getAttractionInfo(pattern: string): any {
  const attractions: Record<string, any> = {
    'Terracotta Army': {
      name: 'Terracotta Army',
      location: 'Lintong District, Xi\'an',
      tags: ['UNESCO', 'History', 'Photography'],
      description: 'One of the greatest archaeological discoveries. Over 8,000 life-sized terracotta soldiers guard the tomb of China\'s first emperor.',
      vibeColor: '#F59E0B',
      rating: 4.9,
      bestTime: 'Morning (8-10 AM)',
      type: 'historical' as const,
      emoji: '⚔️',
    },
    'City Wall': {
      name: 'Xi\'an Ancient City Wall',
      location: 'Central Xi\'an',
      tags: ['Historic', 'Cycling', 'Sunset'],
      description: 'The most complete ancient city wall in China. Rent a bike and ride along the 14km fortification for stunning views.',
      vibeColor: '#F59E0B',
      rating: 4.7,
      bestTime: 'Late Afternoon',
      type: 'historical' as const,
      emoji: '🏰',
    },
    'Erhai Lake': {
      name: 'Erhai Lake',
      location: 'Dali, Yunnan',
      tags: ['Nature', 'Cycling', 'Photography'],
      description: 'A stunning alpine lake surrounded by mountains. Perfect for cycling around the 140km scenic route.',
      vibeColor: '#3B82F6',
      rating: 4.8,
      bestTime: 'All Day',
      type: 'nature' as const,
      emoji: '🌊',
    },
    'West Lake': {
      name: 'West Lake (Xi Hu)',
      location: 'Hangzhou, Zhejiang',
      tags: ['UNESCO', 'Nature', 'Romantic', 'Photography'],
      description: 'A UNESCO World Heritage site, West Lake is renowned for its scenic beauty with pagodas, gardens, and bridges creating a poetic landscape.',
      vibeColor: '#14B8A6',
      rating: 4.9,
      bestTime: 'Early Morning or Sunset',
      type: 'nature' as const,
      emoji: '🌸',
    },
    'Lingyin Temple': {
      name: 'Lingyin Temple',
      location: 'Hangzhou, Zhejiang',
      tags: ['Buddhist', 'Historic', 'Culture'],
      description: 'One of China\'s most famous Buddhist temples, nestled in lush forests with ancient rock carvings and peaceful atmosphere.',
      vibeColor: '#14B8A6',
      rating: 4.7,
      bestTime: 'Morning',
      type: 'cultural' as const,
      emoji: '🛕',
    },
    'Leifeng Pagoda': {
      name: 'Leifeng Pagoda',
      location: 'West Lake, Hangzhou',
      tags: ['Historic', 'Sunset', 'Legend'],
      description: 'A five-story pagoda with legendary tales, offering panoramic views of West Lake. Especially beautiful at sunset.',
      vibeColor: '#14B8A6',
      rating: 4.6,
      bestTime: 'Sunset',
      type: 'historical' as const,
      emoji: '🗼',
    },
  };
  
  for (const [key, info] of Object.entries(attractions)) {
    if (pattern.includes(key) || key.toLowerCase().includes(pattern.toLowerCase())) {
      return info;
    }
  }
  
  return null;
}

function getDestinationActivities(destination: string): any[] {
  const activitiesMap: Record<string, any[]> = {
    'xi\'an': [
      { name: 'Dumpling Feast', description: 'Try 18+ varieties of traditional dumplings', icon: 'food', color: '#EF4444' },
      { name: 'City Wall Cycling', description: 'Bike along ancient fortifications', icon: 'bike', color: '#10B981' },
      { name: 'Tang Dynasty Show', description: 'Traditional music and dance', icon: 'music', color: '#8B5CF6' },
      { name: 'Muslim Quarter', description: 'Explore vibrant street food', icon: 'shopping', color: '#F59E0B' },
    ],
    'xian': [
      { name: 'Dumpling Feast', description: 'Try 18+ varieties of traditional dumplings', icon: 'food', color: '#EF4444' },
      { name: 'City Wall Cycling', description: 'Bike along ancient fortifications', icon: 'bike', color: '#10B981' },
      { name: 'Tang Dynasty Show', description: 'Traditional music and dance', icon: 'music', color: '#8B5CF6' },
      { name: 'Muslim Quarter', description: 'Explore vibrant street food', icon: 'shopping', color: '#F59E0B' },
    ],
    '西安': [
      { name: 'Dumpling Feast', description: 'Try 18+ varieties of traditional dumplings', icon: 'food', color: '#EF4444' },
      { name: 'City Wall Cycling', description: 'Bike along ancient fortifications', icon: 'bike', color: '#10B981' },
      { name: 'Tang Dynasty Show', description: 'Traditional music and dance', icon: 'music', color: '#8B5CF6' },
      { name: 'Muslim Quarter', description: 'Explore vibrant street food', icon: 'shopping', color: '#F59E0B' },
    ],
    'dali': [
      { name: 'Erhai Cycling', description: 'Bike around the beautiful lake', icon: 'bike', color: '#3B82F6' },
      { name: 'Photography Tour', description: 'Capture stunning landscapes', icon: 'camera', color: '#EC4899' },
      { name: 'Local Cuisine', description: 'Taste Bai ethnic dishes', icon: 'food', color: '#EF4444' },
      { name: 'Ancient Town Walk', description: 'Explore historic streets', icon: 'shopping', color: '#8B5CF6' },
    ],
    '大理': [
      { name: 'Erhai Cycling', description: 'Bike around the beautiful lake', icon: 'bike', color: '#3B82F6' },
      { name: 'Photography Tour', description: 'Capture stunning landscapes', icon: 'camera', color: '#EC4899' },
      { name: 'Local Cuisine', description: 'Taste Bai ethnic dishes', icon: 'food', color: '#EF4444' },
      { name: 'Ancient Town Walk', description: 'Explore historic streets', icon: 'shopping', color: '#8B5CF6' },
    ],
    'hangzhou': [
      { name: 'West Lake Cruise', description: 'Boat ride on the scenic lake', icon: 'water', color: '#14B8A6' },
      { name: 'Tea Tasting', description: 'Sample famous Longjing tea', icon: 'coffee', color: '#10B981' },
      { name: 'Temple Visit', description: 'Explore ancient Buddhist temples', icon: 'art', color: '#8B5CF6' },
      { name: 'Local Cuisine', description: 'Try Hangzhou specialties', icon: 'food', color: '#EF4444' },
    ],
    '杭州': [
      { name: 'West Lake Cruise', description: 'Boat ride on the scenic lake', icon: 'water', color: '#14B8A6' },
      { name: 'Tea Tasting', description: 'Sample famous Longjing tea', icon: 'coffee', color: '#10B981' },
      { name: 'Temple Visit', description: 'Explore ancient Buddhist temples', icon: 'art', color: '#8B5CF6' },
      { name: 'Local Cuisine', description: 'Try Hangzhou specialties', icon: 'food', color: '#EF4444' },
    ],
  };
  
  const key = destination.toLowerCase().trim();
  for (const [dest, activities] of Object.entries(activitiesMap)) {
    if (key.includes(dest) || dest.includes(key)) {
      return activities;
    }
  }
  
  return [
    { name: 'Sightseeing', description: 'Explore local attractions', icon: 'camera', color: '#3B82F6' },
    { name: 'Local Food', description: 'Try authentic cuisine', icon: 'food', color: '#EF4444' },
    { name: 'Shopping', description: 'Browse local markets', icon: 'shopping', color: '#F59E0B' },
    { name: 'Cultural Shows', description: 'Watch performances', icon: 'music', color: '#8B5CF6' },
  ];
}
