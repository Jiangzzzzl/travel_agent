// Gemini 行程规划服务 - 使用 Gemini API 搜索景点并规划行程
// 集成目的地上下文，限制搜索范围到指定地区
import { AttractionWithMetrics } from './smart-itinerary-planner';
import { destinationContext } from './destination-context';

export interface GeminiAttractionSearch {
  query: string;
  city?: string;
  type?: 'cultural' | 'nature' | 'shopping' | 'entertainment' | 'religious' | 'historical' | 'all';
  limit?: number;
}

export interface GeminiItineraryRequest {
  destination: string;
  days: number;
  interests?: string[];
  budget?: 'low' | 'medium' | 'high';
  travelStyle?: 'relaxed' | 'moderate' | 'intensive';
}

/**
 * 使用 Gemini 搜索景点信息
 * 替代本地景点数据库，集成目的地限制
 */
export async function searchAttractionsWithGemini(
  searchParams: GeminiAttractionSearch
): Promise<AttractionWithMetrics[]> {
  try {
    console.log('🔍 Searching attractions with Gemini:', searchParams);
    
    // 获取当前目的地上下文 - 直接从全局实例获取
    const currentDestination = destinationContext.getCurrentDestination();
    console.log('🎯 Current destination context:', currentDestination);
    
    if (!currentDestination) {
      console.warn('⚠️ No destination context found! Search will be global.');
    } else {
      console.log('📍 Destination name:', currentDestination.name);
      console.log('📍 Destination country:', currentDestination.country);
    }
    
    // 构建地理限制的搜索查询
    let searchQuery = searchParams.query;
    
    // 应用目的地限制
    if (currentDestination) {
      searchQuery = destinationContext.buildLocationRestrictedQuery(searchQuery);
      console.log('📍 Location-restricted query:', searchQuery);
    } else if (searchParams.city) {
      // 如果没有上下文但指定了城市，使用城市参数
      searchQuery = `${searchParams.city} ${searchQuery}`;
    }
    
    // 添加景点类型限制
    if (searchParams.type && searchParams.type !== 'all') {
      const typeMap = {
        cultural: '文化景点 博物馆 历史建筑',
        nature: '自然景观 公园 山水',
        shopping: '购物中心 商业街',
        entertainment: '娱乐场所 主题公园',
        religious: '寺庙 教堂 宗教场所',
        historical: '历史遗迹 古迹'
      };
      searchQuery += ` ${typeMap[searchParams.type]}`;
    }
    
    console.log('🔍 Final search query:', searchQuery);
    
    // 调用 API 路由，传递目的地信息
    console.log('📡 Making API request to /api/gemini-search...');
    console.log('📡 Current destination object:', currentDestination);
    console.log('📡 Destination name to send:', currentDestination?.name);
    
    const destinationName = currentDestination?.name || null;
    console.log('📡 Final destination name:', destinationName);
    
    const response = await fetch('/api/gemini-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        destination: destinationName // 确保只传递字符串
      })
    });
    
    console.log('📡 API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📡 API response data:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Search failed');
    }
    
    const geminiResults = data.results;
    console.log('📡 Gemini results from API:', geminiResults.length);
    
    // 转换为 AttractionWithMetrics 格式
    const attractions: AttractionWithMetrics[] = geminiResults.map((result: any, index: number) => ({
      id: `gemini-${Date.now()}-${index}`,
      name: result.name,
      location: result.address,
      coordinates: result.coordinates,
      estimatedDuration: result.estimatedDuration || result.openingHours ? estimateDurationFromHours(result.openingHours) : '2-3小时',
      suggestedTime: getBestVisitTime(result.type),
      emoji: getEmojiForType(result.type),
      vibeColor: getColorForType(result.type),
      priority: calculatePriority(result.rating, result.type)
    }));
    
    console.log('✅ Converted to attractions format:', attractions.length);
    
    // 暂时禁用额外的目的地过滤，因为服务器端已经处理了
    /*
    // 应用目的地过滤（双重保险）
    const filteredAttractions = currentDestination 
      ? attractions.filter(attraction => 
          destinationContext.isAttractionInDestination(attraction.name, attraction.location)
        )
      : attractions;
    
    console.log('✅ Found attractions:', filteredAttractions.length, '(filtered from', attractions.length, ')');
    return filteredAttractions.slice(0, searchParams.limit || 10);
    */
    
    // 直接返回转换后的结果
    const finalResults = attractions.slice(0, searchParams.limit || 10);
    console.log('✅ Final attractions to return:', finalResults.length);
    return finalResults;
    
  } catch (error) {
    console.error('❌ Gemini attraction search failed:', error);
    return [];
  }
}

/**
 * 使用 Gemini 生成完整的行程规划
 */
export async function generateItineraryWithGemini(
  request: GeminiItineraryRequest
): Promise<AttractionWithMetrics[]> {
  try {
    console.log('📅 Generating itinerary with Gemini:', request);
    
    // 构建详细的行程规划查询
    const itineraryQuery = buildItineraryQuery(request);
    
    // 调用 API 路由搜索相关景点
    const response = await fetch('/api/gemini-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: itineraryQuery
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Search failed');
    }
    
    const geminiResults = data.results;
    
    // 转换并优化结果
    const attractions: AttractionWithMetrics[] = geminiResults.map((result, index) => ({
      id: `itinerary-${Date.now()}-${index}`,
      name: result.name,
      location: result.address,
      coordinates: result.coordinates,
      estimatedDuration: estimateVisitDuration(result.type, request.travelStyle),
      suggestedTime: getBestVisitTime(result.type),
      emoji: getEmojiForType(result.type),
      vibeColor: getColorForType(result.type),
      priority: calculateItineraryPriority(result, request)
    }));
    
    console.log('✅ Generated itinerary attractions:', attractions.length);
    return attractions;
    
  } catch (error) {
    console.error('❌ Gemini itinerary generation failed:', error);
    return [];
  }
}

/**
 * 构建行程规划查询
 */
function buildItineraryQuery(request: GeminiItineraryRequest): string {
  let query = `${request.destination} 旅游景点 必去景点`;
  
  // 添加兴趣标签
  if (request.interests && request.interests.length > 0) {
    query += ` ${request.interests.join(' ')}`;
  }
  
  // 根据预算调整
  if (request.budget === 'low') {
    query += ' 免费景点 公园 广场';
  } else if (request.budget === 'high') {
    query += ' 高端景点 特色体验';
  }
  
  // 根据旅行风格调整
  if (request.travelStyle === 'relaxed') {
    query += ' 休闲景点 公园 咖啡厅';
  } else if (request.travelStyle === 'intensive') {
    query += ' 热门景点 必去景点 经典路线';
  }
  
  return query;
}

/**
 * 从开放时间估算游览时长
 */
function estimateDurationFromHours(openingHours: string): string {
  // 简单的启发式规则
  if (openingHours.includes('全天') || openingHours.includes('24')) {
    return '2-4小时';
  }
  
  // 提取开放时间长度
  const hourMatch = openingHours.match(/(\d+):?\d*\s*[-到]\s*(\d+):?\d*/);
  if (hourMatch) {
    const startHour = parseInt(hourMatch[1]);
    const endHour = parseInt(hourMatch[2]);
    const duration = endHour - startHour;
    
    if (duration >= 10) return '3-5小时';
    if (duration >= 8) return '2-4小时';
    if (duration >= 6) return '1-3小时';
  }
  
  return '2-3小时';
}

/**
 * 根据景点类型估算游览时长
 */
function estimateVisitDuration(type: string, travelStyle?: string): string {
  const baseDurations: Record<string, string> = {
    museum: '2-3小时',
    university: '1-2小时',
    landmark: '1-2小时',
    scenic_area: '3-4小时',
    historic_site: '2-3小时',
    tourist_attraction: '2-4小时',
    place: '1-2小时'
  };
  
  let duration = baseDurations[type] || '2小时';
  
  // 根据旅行风格调整
  if (travelStyle === 'intensive') {
    // 紧凑行程，缩短时间
    duration = duration.replace(/(\d+)-(\d+)/, (match, start, end) => {
      return `${start}-${Math.max(parseInt(start), parseInt(end) - 1)}`;
    });
  } else if (travelStyle === 'relaxed') {
    // 休闲行程，延长时间
    duration = duration.replace(/(\d+)-(\d+)/, (match, start, end) => {
      return `${Math.min(parseInt(start) + 1, 5)}-${Math.min(parseInt(end) + 1, 6)}`;
    });
  }
  
  return duration;
}

/**
 * 获取最佳游览时间
 */
function getBestVisitTime(type: string): string {
  const timeMap: Record<string, string> = {
    museum: '上午',
    university: '上午或下午',
    landmark: '傍晚',
    scenic_area: '上午或傍晚',
    historic_site: '上午',
    tourist_attraction: '上午或下午',
    place: '上午或下午'
  };
  
  return timeMap[type] || '上午或下午';
}

/**
 * 根据类型获取表情符号
 */
function getEmojiForType(type: string): string {
  const emojiMap: Record<string, string> = {
    museum: '🏛️',
    university: '🎓',
    landmark: '🗼',
    scenic_area: '🌊',
    historic_site: '🏯',
    tourist_attraction: '🎢',
    place: '📍'
  };
  
  return emojiMap[type] || '📍';
}

/**
 * 根据类型获取颜色
 */
function getColorForType(type: string): string {
  const colorMap: Record<string, string> = {
    museum: '#DC2626',
    university: '#059669',
    landmark: '#F59E0B',
    scenic_area: '#0284C7',
    historic_site: '#7C2D12',
    tourist_attraction: '#EC4899',
    place: '#6B7280'
  };
  
  return colorMap[type] || '#6B7280';
}

/**
 * 计算景点优先级
 */
function calculatePriority(rating?: number, type?: string): number {
  let priority = 3; // 默认优先级
  
  // 根据评分调整
  if (rating) {
    if (rating >= 4.5) priority = 5;
    else if (rating >= 4.0) priority = 4;
    else if (rating >= 3.5) priority = 3;
    else priority = 2;
  }
  
  // 根据类型调整
  const highPriorityTypes = ['landmark', 'historic_site', 'scenic_area'];
  if (type && highPriorityTypes.includes(type)) {
    priority = Math.min(priority + 1, 5);
  }
  
  return priority;
}

/**
 * 计算行程规划中的景点优先级
 */
function calculateItineraryPriority(
  result: any,
  request: GeminiItineraryRequest
): number {
  let priority = calculatePriority(result.rating, result.type);
  
  // 根据用户兴趣调整优先级
  if (request.interests) {
    const interestKeywords = request.interests.join(' ').toLowerCase();
    const resultText = `${result.name} ${result.description || ''}`.toLowerCase();
    
    // 如果景点描述包含用户兴趣关键词，提高优先级
    if (request.interests.some(interest => 
      resultText.includes(interest.toLowerCase())
    )) {
      priority = Math.min(priority + 1, 5);
    }
  }
  
  // 根据预算调整
  if (request.budget === 'low' && !result.description?.includes('免费')) {
    priority = Math.max(priority - 1, 1);
  }
  
  return priority;
}

/**
 * 智能景点推荐 - 基于位置和兴趣
 */
export async function getSmartRecommendations(
  location: string,
  interests: string[] = [],
  limit: number = 8
): Promise<AttractionWithMetrics[]> {
  try {
    console.log('🎯 Getting smart recommendations for:', location, interests);
    
    // 构建推荐查询
    let query = `${location} 推荐景点 热门景点`;
    
    if (interests.length > 0) {
      query += ` ${interests.join(' ')}`;
    }
    
    const searchParams: GeminiAttractionSearch = {
      query,
      limit,
      type: 'all'
    };
    
    return await searchAttractionsWithGemini(searchParams);
    
  } catch (error) {
    console.error('❌ Smart recommendations failed:', error);
    return [];
  }
}

/**
 * 获取附近景点推荐
 */
export async function getNearbyAttractions(
  centerAttraction: AttractionWithMetrics,
  radius: number = 10,
  limit: number = 5
): Promise<AttractionWithMetrics[]> {
  try {
    console.log('📍 Getting nearby attractions for:', centerAttraction.name);
    
    // 提取城市信息
    const cityMatch = centerAttraction.location.match(/([\u4e00-\u9fa5]+市)/);
    const city = cityMatch ? cityMatch[1] : '';
    
    const query = `${city} ${centerAttraction.name} 附近景点 周边景点`;
    
    const searchParams: GeminiAttractionSearch = {
      query,
      city,
      limit,
      type: 'all'
    };
    
    const nearbyAttractions = await searchAttractionsWithGemini(searchParams);
    
    // 过滤掉中心景点本身
    return nearbyAttractions.filter(attraction => 
      attraction.name !== centerAttraction.name
    );
    
  } catch (error) {
    console.error('❌ Nearby attractions search failed:', error);
    return [];
  }
}