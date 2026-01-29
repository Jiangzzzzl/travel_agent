// Gemini API 服务 - Vercel 兼容版本
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { setupGoogleApiProxy, forceIPv4 } from './proxy-setup';

export interface GeminiPlaceResult {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: string;
  rating?: number;
  description: string;
  openingHours?: string;
  website?: string;
  phoneNumber?: string;
}

// 定义 Gemini 返回的地点搜索结果结构
const PlaceSearchSchema = z.object({
  places: z.array(z.object({
    name: z.string(),
    address: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }),
    type: z.string(),
    rating: z.number().optional(),
    description: z.string(),
    openingHours: z.string().optional(),
    website: z.string().optional(),
    phoneNumber: z.string().optional()
  }))
});

/**
 * 初始化代理设置（只在本地开发环境执行）
 */
let proxyInitialized = false;

function initializeProxy() {
  if (!proxyInitialized && typeof window === 'undefined') {
    // 只在非Vercel 环境初始化代理
    if (!process.env.VERCEL) {
      setupGoogleApiProxy();
      forceIPv4();
    }
    proxyInitialized = true;
  }
}

/**
 * 直接使用 Gemini API 搜索地点
 * 避免通过 /api/chat 的自循环调用
 * 注意：这个函数只能在服务器端使用，因为需要API 密钥
 */
export async function searchPlacesWithGemini(query: string): Promise<GeminiPlaceResult[]> {
  // 检查是否在服务器端运行
  if (typeof window !== 'undefined') {
    console.error('❌ searchPlacesWithGemini can only be called on the server side');
    throw new Error('This function can only be called on the server side');
  }

  try {
    console.log('🔍 Searching places with Gemini API:', query);
    
    // 初始化代理设置
    initializeProxy();
    
    const prompt = `请搜索"${query}"相关的地点信息。请提供详细准确的地点信息，包括：
- 地点名称（必须准确）
- 详细地址（必须是真实完整的地址，不能是占位符）
- 经纬度坐标（必须准确）
- 地点类型（如：museum, university, restaurant, tourist_attraction等）
- 评分（1-5分，如果有的话）
- 简短描述
- 开放时间（如果知道的话）
- 官方网站（如果有的话）
- 联系电话（如果有的话）

重要要求：
1. 地址必须是真实完整的地址，包含街道、门牌号等详细信息
2. 坐标必须准确对应该地点的实际位置
3. 优先返回知名度高、信息准确的地点
4. 如果是国外地点，请提供英文地址
5. 不要使用任何占位符或模糊的地址信息

请返回最多5个最相关的地点。`;

    console.log('🤖 Calling Gemini API with prompt...');
    
    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      prompt,
      schema: PlaceSearchSchema,
    });

    console.log('✅ Gemini API response received:', result.object.places.length, 'places');
    
    // 详细记录每个结果
    result.object.places.forEach((place, index) => {
      console.log(`  ${index + 1}. ${place.name}`);
      console.log(`     Address: ${place.address}`);
      console.log(`     Type: ${place.type}`);
      console.log(`     Coordinates: ${place.coordinates.lat}, ${place.coordinates.lng}`);
    });
    
    // 验证返回的地址是否为占位符
    const validPlaces = result.object.places.filter(place => {
      const isValidAddress = place.address && 
        !place.address.includes('的地址信息') && 
        !place.address.includes('地址信息') &&
        !place.address.includes('具体地址') &&
        place.address.length > 10; // 确保地址足够详细
      
      if (!isValidAddress) {
        console.warn('⚠️ Filtered out place with invalid address:', place.name, place.address);
      }
      
      return isValidAddress;
    });
    
    console.log('✅ Valid places after filtering:', validPlaces.length);
    return validPlaces;
    
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    console.log('🤖 Falling back to predefined results...');
    
    // 如果 Gemini API 失败，返回基于查询的智能推测
    const fallbackResults = generateFallbackResults(query);
    console.log('🤖 Fallback results generated:', fallbackResults.length);
    
    if (fallbackResults.length === 0) {
      console.log('⚠️ No fallback results available, generating generic results...');
      
      // 如果连fallback 都没有结果，生成一些通用的示例
      if (query.toLowerCase().includes('博物馆') || query.toLowerCase().includes('museum')) {
        return [{
          name: '示例博物馆',
          address: '请指定具体城市以获取准确结果',
          coordinates: { lat: 39.9042, lng: 116.4074 },
          type: 'museum',
          description: '搜索功能正在调试中，请稍后再试',
          openingHours: '调试模式'
        }];
      }
    }
    
    return fallbackResults;
  }
}

/**
 * 生成备选结果（当Gemini API 不可用时）
 */
function generateFallbackResults(query: string): GeminiPlaceResult[] {
  console.log('🤖 Generating fallback results for:', query);
  
  const results: GeminiPlaceResult[] = [];
  const queryLower = query.toLowerCase();
  
  // 西安景点
  if (queryLower.includes('西安') || queryLower.includes('xian')) {
    if (queryLower.includes('博物馆') || queryLower.includes('museum')) {
      results.push({
        name: '陕西历史博物馆',
        address: '陕西省西安市雁塔区小寨东路91号',
        coordinates: { lat: 34.2318, lng: 108.9533 },
        type: 'museum',
        rating: 4.7,
        description: '中国第一座大型现代化国家级博物馆',
        openingHours: '9:00-17:30（周一闭馆）'
      });
      
      results.push({
        name: '西安博物院',
        address: '陕西省西安市碑林区友谊西路72号',
        coordinates: { lat: 34.2456, lng: 108.9398 },
        type: 'museum',
        rating: 4.5,
        description: '展示西安历史文化的综合性博物馆',
        openingHours: '9:00-17:00'
      });
      
      results.push({
        name: '碑林博物馆',
        address: '陕西省西安市碑林区三学街15号',
        coordinates: { lat: 34.2567, lng: 108.9456 },
        type: 'museum',
        rating: 4.6,
        description: '收藏历代碑石、墓志的艺术宝库',
        openingHours: '8:00-18:00'
      });
    }
    
    if (queryLower.includes('寺庙') || queryLower.includes('temple')) {
      results.push({
        name: '大雁塔',
        address: '陕西省西安市雁塔区雁塔路',
        coordinates: { lat: 34.2186, lng: 108.9647 },
        type: 'place_of_worship',
        rating: 4.5,
        description: '唐代佛教建筑艺术杰作',
        openingHours: '8:00-17:30'
      });
      
      results.push({
        name: '小雁塔',
        address: '陕西省西安市碑林区友谊西路72号',
        coordinates: { lat: 34.2456, lng: 108.9398 },
        type: 'place_of_worship',
        rating: 4.3,
        description: '唐代密檐式砖塔',
        openingHours: '9:00-17:00'
      });
    }
    
    if (queryLower.includes('公园') || queryLower.includes('park')) {
      results.push({
        name: '大唐芙蓉园',
        address: '陕西省西安市雁塔区芙蓉西路99号',
        coordinates: { lat: 34.2089, lng: 108.9789 },
        type: 'park',
        rating: 4.4,
        description: '盛唐文化大型主题公园',
        openingHours: '9:00-22:00'
      });
      
      results.push({
        name: '兴庆宫公园',
        address: '陕西省西安市碑林区咸宁西路55号',
        coordinates: { lat: 34.2598, lng: 108.9789 },
        type: 'park',
        rating: 4.2,
        description: '唐代兴庆宫遗址公园',
        openingHours: '6:00-22:00'
      });
    }
  }
  
  // 北京景点
  if (queryLower.includes('北京') || queryLower.includes('beijing')) {
    if (queryLower.includes('博物馆') || queryLower.includes('museum')) {
      results.push({
        name: '故宫博物院',
        address: '北京市东城区景山前街4号',
        coordinates: { lat: 39.9163, lng: 116.3972 },
        type: 'museum',
        rating: 4.8,
        description: '明清两朝的皇家宫殿，世界文化遗产',
        openingHours: '8:30-17:00'
      });
      
      results.push({
        name: '中国国家博物馆',
        address: '北京市东城区东长安街16号',
        coordinates: { lat: 39.9026, lng: 116.3974 },
        type: 'museum',
        rating: 4.6,
        description: '中国历史文化艺术的最高殿堂',
        openingHours: '9:00-17:00'
      });
    }
  }
  
  // 杭州景点
  if (queryLower.includes('杭州') || queryLower.includes('hangzhou')) {
    if (queryLower.includes('博物馆') || queryLower.includes('museum')) {
      results.push({
        name: '浙江省博物馆',
        address: '浙江省杭州市西湖区孤山路25号',
        coordinates: { lat: 30.2516, lng: 120.1394 },
        type: 'museum',
        rating: 4.5,
        description: '浙江省最大的综合性博物馆',
        openingHours: '9:00-17:00'
      });
    }
    
    if (queryLower.includes('寺庙') || queryLower.includes('temple')) {
      results.push({
        name: '灵隐寺',
        address: '浙江省杭州市西湖区灵隐路法云弄1号',
        coordinates: { lat: 30.2408, lng: 120.1014 },
        type: 'place_of_worship',
        rating: 4.6,
        description: '中国佛教著名寺院',
        openingHours: '7:00-18:15'
      });
    }
  }
  
  // 如果没有匹配的预设结果，返回通用结果
  if (results.length === 0) {
    console.log('⚠️ No specific fallback results found for query:', query);
    
    // 尝试基于查询类型生成通用结果
    if (queryLower.includes('博物馆') || queryLower.includes('museum')) {
      results.push({
        name: '当地博物馆',
        address: '请搜索具体城市的博物馆信息',
        coordinates: { lat: 39.9042, lng: 116.4074 },
        type: 'museum',
        description: '建议指定具体城市来搜索博物馆',
        openingHours: '请查询具体营业时间'
      });
    }
  }
  
  console.log('🤖 Generated fallback results:', results.length);
  return results;
}

/**
 * 简化的搜索接口，兼容现有的 PlaceSearchResult 格式
 */
export async function searchWithGemini(query: string, limit: number = 10) {
  const results = await searchPlacesWithGemini(query);
  
  // 转换为兼容格式
  return results.slice(0, limit).map((result, index) => ({
    id: `gemini-${Date.now()}-${index}`,
    name: result.name,
    address: result.address,
    coordinates: result.coordinates,
    type: result.type,
    description: result.description,
    rating: result.rating,
    source: 'gemini' as const
  }));
}