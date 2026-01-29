// 景点智能推测工具
// 根据景点名称智能推测位置类型、游览时长、图标和颜色

export interface AttractionIntelligence {
  location: string;
  estimatedDuration: string;
  emoji: string;
  color: string;
  type: 'cultural' | 'nature' | 'shopping' | 'entertainment' | 'religious' | 'historical';
  description: string;
  bestTimeToVisit?: string;
  priority?: number;
}

/**
 * 使用Gemini AI智能估算景点游览时间 - 服务端调用
 */
async function getGeminiTimeEstimate(attractionName: string, attractionType: string, location?: string): Promise<string> {
  try {
    console.log('🤖 Calling server API for time estimate:', attractionName);
    
    const response = await fetch('/api/estimate-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attractionName,
        attractionType,
        location
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('🤖 Server time estimate success:', data.timeEstimate);
      return data.timeEstimate;
    } else {
      console.warn('⚠️ Server time estimation failed, using fallback:', data.fallback);
      return data.fallback || getFallbackTimeEstimate(attractionType);
    }
    
  } catch (error) {
    console.error('❌ Server time estimation request failed:', error);
    return getFallbackTimeEstimate(attractionType);
  }
}

/**
 * 获取备用时间估算（当Gemini调用失败时使用）
 */
function getFallbackTimeEstimate(attractionType: string): string {
  const fallbackTimes: Record<string, string> = {
    'cultural': '2-3小时',
    'nature': '2-4小时',
    'shopping': '2-3小时',
    'entertainment': '3-5小时',
    'religious': '1-2小时',
    'historical': '3-4小时'
  };
  
  return fallbackTimes[attractionType] || '2小时';
}

// 景点关键词匹配规则
const attractionRules = [
  // 博物馆类
  {
    keywords: ['博物馆', '美术馆', '艺术馆', '纪念馆', '展览馆', '科技馆', '历史馆'],
    location: '博物馆',
    estimatedDuration: '2-3小时',
    emoji: '🏛️',
    color: '#DC2626',
    type: 'cultural' as const,
    description: '文化艺术场所',
    bestTimeToVisit: '上午或下午',
    priority: 4
  },
  
  // 公园类
  {
    keywords: ['公园', '植物园', '动物园', '森林公园', '湿地公园', '主题公园'],
    location: '公园',
    estimatedDuration: '2-4小时',
    emoji: '🌳',
    color: '#059669',
    type: 'nature' as const,
    description: '自然休闲场所',
    bestTimeToVisit: '上午或傍晚',
    priority: 3
  },
  
  // 宗教场所
  {
    keywords: ['寺', '庙', '教堂', '清真寺', '道观', '佛寺', '禅寺', '大雄宝殿'],
    location: '宗教场所',
    estimatedDuration: '1-2小时',
    emoji: '🏯',
    color: '#7C2D12',
    type: 'religious' as const,
    description: '宗教文化场所',
    bestTimeToVisit: '上午',
    priority: 3
  },
  
  // 山岳类
  {
    keywords: ['山', '峰', '岭', '峡', '谷', '崖', '石林', '地质公园'],
    location: '自然景观',
    estimatedDuration: '半天',
    emoji: '⛰️',
    color: '#065F46',
    type: 'nature' as const,
    description: '山岳自然景观',
    bestTimeToVisit: '早上',
    priority: 4
  },
  
  // 水景类
  {
    keywords: ['湖', '海', '河', '江', '溪', '瀑布', '泉', '池', '湾', '岛'],
    location: '水景',
    estimatedDuration: '2-3小时',
    emoji: '🌊',
    color: '#0284C7',
    type: 'nature' as const,
    description: '水景自然风光',
    bestTimeToVisit: '上午或傍晚',
    priority: 4
  },
  
  // 古迹类
  {
    keywords: ['古城', '古镇', '古村', '遗址', '故宫', '皇宫', '城墙', '古建筑', '文物'],
    location: '历史古迹',
    estimatedDuration: '3-4小时',
    emoji: '🏘️',
    color: '#92400E',
    type: 'historical' as const,
    description: '历史文化古迹',
    bestTimeToVisit: '上午',
    priority: 5
  },
  
  // 商业区
  {
    keywords: ['商场', '购物中心', '步行街', '商业街', '市场', '广场', '中心'],
    location: '商业区',
    estimatedDuration: '2-3小时',
    emoji: '🛍️',
    color: '#7C3AED',
    type: 'shopping' as const,
    description: '购物休闲区域',
    bestTimeToVisit: '下午或晚上',
    priority: 2
  },
  
  // 娱乐场所
  {
    keywords: ['游乐园', '乐园', '影城', '剧院', '音乐厅', '体育馆', '竞技场'],
    location: '娱乐场所',
    estimatedDuration: '3-5小时',
    emoji: '🎢',
    color: '#EC4899',
    type: 'entertainment' as const,
    description: '娱乐休闲场所',
    bestTimeToVisit: '下午',
    priority: 3
  },
  
  // 特殊地标
  {
    keywords: ['塔', '楼', '桥', '门', '广场', '中心', '大厦', '建筑'],
    location: '地标建筑',
    estimatedDuration: '1-2小时',
    emoji: '🗼',
    color: '#F59E0B',
    type: 'cultural' as const,
    description: '标志性建筑',
    bestTimeToVisit: '任何时间',
    priority: 3
  }
];

// 默认规则（当没有匹配时使用）
const defaultRule: AttractionIntelligence = {
  location: '待确认具体位置',
  estimatedDuration: '2小时',
  emoji: '📍',
  color: '#8B5CF6',
  type: 'cultural',
  description: '用户添加的景点',
  bestTimeToVisit: '建议时间',
  priority: 3
};

/**
 * 根据景点名称智能推测景点信息
 * @param attractionName 景点名称
 * @param useAITimeEstimate 是否使用AI估算时间（默认false，使用传统规则）
 * @returns 推测的景点信息
 */
export async function intelligentAttractionAnalysis(
  attractionName: string, 
  useAITimeEstimate: boolean = false
): Promise<AttractionIntelligence> {
  const name = attractionName.trim();
  
  // 遍历规则，找到第一个匹配的
  for (const rule of attractionRules) {
    for (const keyword of rule.keywords) {
      if (name.includes(keyword)) {
        // 尝试从名称中提取城市信息
        const location = extractLocationFromName(name) || rule.location;
        
        // 决定使用AI估算还是传统估算
        let estimatedDuration = rule.estimatedDuration;
        if (useAITimeEstimate) {
          try {
            estimatedDuration = await getGeminiTimeEstimate(name, rule.type, location);
          } catch (error) {
            console.warn('AI time estimation failed, using fallback:', error);
            estimatedDuration = rule.estimatedDuration;
          }
        }
        
        return {
          location,
          estimatedDuration,
          emoji: rule.emoji,
          color: rule.color,
          type: rule.type,
          description: `${rule.description} - ${name}`,
          bestTimeToVisit: rule.bestTimeToVisit,
          priority: rule.priority
        };
      }
    }
  }
  
  // 如果没有匹配，尝试提取位置信息
  const extractedLocation = extractLocationFromName(name);
  
  // 对于未匹配的景点，如果启用AI估算，也尝试获取AI时间估算
  let estimatedDuration = defaultRule.estimatedDuration;
  if (useAITimeEstimate) {
    try {
      estimatedDuration = await getGeminiTimeEstimate(name, 'cultural', extractedLocation || undefined);
    } catch (error) {
      console.warn('AI time estimation failed for unknown attraction, using default:', error);
    }
  }
  
  return {
    ...defaultRule,
    location: extractedLocation || defaultRule.location,
    description: `用户添加的景点 - ${name}`,
    estimatedDuration
  };
}

/**
 * 同步版本的景点分析（保持向后兼容）
 */
export function intelligentAttractionAnalysisSync(attractionName: string): AttractionIntelligence {
  const name = attractionName.trim();
  
  // 遍历规则，找到第一个匹配的
  for (const rule of attractionRules) {
    for (const keyword of rule.keywords) {
      if (name.includes(keyword)) {
        // 尝试从名称中提取城市信息
        const location = extractLocationFromName(name) || rule.location;
        
        return {
          location,
          estimatedDuration: rule.estimatedDuration,
          emoji: rule.emoji,
          color: rule.color,
          type: rule.type,
          description: `${rule.description} - ${name}`,
          bestTimeToVisit: rule.bestTimeToVisit,
          priority: rule.priority
        };
      }
    }
  }
  
  // 如果没有匹配，尝试提取位置信息
  const extractedLocation = extractLocationFromName(name);
  
  return {
    ...defaultRule,
    location: extractedLocation || defaultRule.location,
    description: `用户添加的景点 - ${name}`
  };
}

/**
 * 从景点名称中提取位置信息
 */
function extractLocationFromName(name: string): string | null {
  // 常见城市模式
  const cityPatterns = [
    /^(北京|上海|广州|深圳|杭州|南京|苏州|成都|重庆|西安|武汉|天津|青岛|大连|厦门|长沙|郑州|济南|哈尔滨|沈阳|石家庄|太原|呼和浩特|长春|合肥|南昌|福州|南宁|海口|贵阳|昆明|拉萨|西宁|银川|乌鲁木齐)/,
    /^(东京|大阪|京都|横滨|名古屋|神户|福冈|札幌|仙台|广岛)/,
    /^(首尔|釜山|大邱|仁川|光州|大田|蔚山)/,
    /^(纽约|洛杉矶|芝加哥|休斯顿|费城|凤凰城|圣安东尼奥|圣地亚哥|达拉斯|圣何塞)/,
    /^(伦敦|曼彻斯特|伯明翰|利兹|格拉斯哥|谢菲尔德|布拉德福德|爱丁堡|利物浦|布里斯托)/,
    /^(巴黎|马赛|里昂|图卢兹|尼斯|南特|斯特拉斯堡|蒙彼利埃|波尔多|里尔)/,
    /^(柏林|汉堡|慕尼黑|科隆|法兰克福|斯图加特|杜塞尔多夫|多特蒙德|埃森|莱比锡)/,
    /^(罗马|米兰|那不勒斯|都灵|巴勒莫|热那亚|博洛尼亚|佛罗伦萨|巴里|卡塔尼亚)/,
    /^(马德里|巴塞罗那|瓦伦西亚|塞维利亚|萨拉戈萨|马拉加|穆尔西亚|帕尔马|拉斯帕尔马斯|毕尔巴鄂)/,
    /^(莫斯科|圣彼得堡|新西伯利亚|叶卡捷琳堡|下诺夫哥罗德|喀山|车里雅宾斯克|鄂木斯克|萨马拉|顿河畔罗斯托夫)/,
    /^(悉尼|墨尔本|布里斯班|珀斯|阿德莱德|堪培拉|霍巴特|达尔文)/
  ];
  
  // 检查是否以城市名开头
  for (const pattern of cityPatterns) {
    const match = name.match(pattern);
    if (match) {
      return `${match[1]}市`;
    }
  }
  
  // 检查是否包含省份信息
  const provincePattern = /([\u4e00-\u9fa5]+省|[\u4e00-\u9fa5]+市|[\u4e00-\u9fa5]+区|[\u4e00-\u9fa5]+县)/;
  const provinceMatch = name.match(provincePattern);
  if (provinceMatch) {
    return provinceMatch[1];
  }
  
  // 检查是否包含国家信息
  const countryPattern = /(中国|日本|韩国|美国|英国|法国|德国|意大利|西班牙|俄罗斯|澳大利亚|加拿大|巴西|印度|泰国|新加坡|马来西亚|印度尼西亚|菲律宾|越南)/;
  const countryMatch = name.match(countryPattern);
  if (countryMatch) {
    return countryMatch[1];
  }
  
  return null;
}

/**
 * 获取景点类型的中文描述
 */
export function getAttractionTypeDescription(type: string): string {
  const typeMap: Record<string, string> = {
    cultural: '文化景点',
    nature: '自然景观',
    shopping: '购物场所',
    entertainment: '娱乐场所',
    religious: '宗教场所',
    historical: '历史古迹'
  };
  
  return typeMap[type] || '景点';
}

/**
 * 根据景点类型获取推荐的游览建议
 */
export function getAttractionTips(type: string, name: string): string[] {
  const tips: Record<string, string[]> = {
    cultural: [
      '建议提前了解相关历史背景',
      '可以租借语音导览设备',
      '注意开放时间和闭馆日'
    ],
    nature: [
      '建议穿着舒适的运动鞋',
      '注意天气变化，准备雨具',
      '保护环境，不要乱扔垃圾'
    ],
    shopping: [
      '可以比较不同商家的价格',
      '注意营业时间',
      '留意促销活动信息'
    ],
    entertainment: [
      '建议提前购票',
      '注意年龄限制和身高要求',
      '合理安排游玩时间'
    ],
    religious: [
      '保持安静，尊重宗教仪式',
      '注意着装要求',
      '可以了解相关宗教文化'
    ],
    historical: [
      '建议聘请导游或使用语音导览',
      '注意保护文物，不要触摸',
      '了解历史背景会更有收获'
    ]
  };
  
  return tips[type] || ['注意安全，享受旅程'];
}

// 导出常用的景点类型
export const ATTRACTION_TYPES = {
  CULTURAL: 'cultural',
  NATURE: 'nature',
  SHOPPING: 'shopping',
  ENTERTAINMENT: 'entertainment',
  RELIGIOUS: 'religious',
  HISTORICAL: 'historical'
} as const;