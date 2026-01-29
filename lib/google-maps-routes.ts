// Google Maps Routes API 集成服务
// 使用 Gemini API 调用 Google Maps Routes API 获取真实的交通时间和路线信息

import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// 路线查询接口
export interface RouteQuery {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  travelMode?: 'DRIVE' | 'WALK' | 'TRANSIT' | 'BICYCLE';
  departureTime?: string; // ISO 8601 格式
  trafficModel?: 'BEST_GUESS' | 'PESSIMISTIC' | 'OPTIMISTIC';
}

// 路线响应接口
export interface RouteResponse {
  duration: {
    text: string;      // "25 分钟"
    value: number;     // 1500 (秒)
  };
  distance: {
    text: string;      // "8.5 公里"
    value: number;     // 8500 (米)
  };
  steps?: RouteStep[];
  trafficInfo?: {
    currentTravelTime: number;  // 当前交通状况下的时间
    historicalAverage: number;  // 历史平均时间(秒)
    trafficCondition: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'SEVERE';
  };
}

export interface RouteStep {
  instruction: string;
  duration: { text: string; value: number };
  distance: { text: string; value: number };
  travelMode: string;
}

// Gemini API 响应结构
const RouteResponseSchema = z.object({
  routes: z.array(z.object({
    duration: z.object({
      text: z.string(),
      value: z.number()
    }),
    distance: z.object({
      text: z.string(),
      value: z.number()
    }),
    steps: z.array(z.object({
      instruction: z.string(),
      duration: z.object({
        text: z.string(),
        value: z.number()
      }),
      distance: z.object({
        text: z.string(),
        value: z.number()
      }),
      travelMode: z.string()
    })).optional(),
    trafficInfo: z.object({
      currentTravelTime: z.number(),
      historicalAverage: z.number(),
      trafficCondition: z.enum(['LIGHT', 'MODERATE', 'HEAVY', 'SEVERE'])
    }).optional()
  }))
});

/**
 * 使用 Gemini API 调用 Google Maps Routes API
 * 获取两点间的真实路线和交通信息
 */
export async function getRouteWithGemini(query: RouteQuery): Promise<RouteResponse | null> {
  // 检查是否在服务器端运行
  if (typeof window !== 'undefined') {
    console.error('❌ getRouteWithGemini can only be called on the server side');
    throw new Error('This function can only be called on the server side');
  }

  try {
    console.log('🗺️ Getting route with Gemini API:', query);
    
    const prompt = `请使用Google Maps Routes API 获取以下路线信息：

起点坐标: ${query.origin.lat}, ${query.origin.lng}
终点坐标: ${query.destination.lat}, ${query.destination.lng}
交通方式: ${query.travelMode || 'DRIVE'}
出发时间: ${query.departureTime || '现在'}
交通模型: ${query.trafficModel || 'BEST_GUESS'}

请调用Google Maps Routes API 并返回详细的路线信息，包括：
1. 行程时间（考虑实时交通状况）
2. 行程距离
3. 详细的导航步骤
4. 交通状况信息（如果是驾车模式）

重要要求：
1. 时间必须考虑实时交通状况
2. 如果是步行模式，提供步行路线
3. 如果是公共交通，包含换乘信息
4. 如果是驾车，包含交通拥堵信息
5. 返回的时间单位为秒，距离单位为米

请确保返回准确的实时数据，不要使用估算值。`;

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      prompt,
      schema: RouteResponseSchema,
      temperature: 0.1, // 低温度确保准确性
    });

    console.log('✅ Gemini Routes API response received');
    
    if (result.object.routes && result.object.routes.length > 0) {
      const route = result.object.routes[0];
      return {
        duration: route.duration,
        distance: route.distance,
        steps: route.steps,
        trafficInfo: route.trafficInfo
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Gemini Routes API error:', error);
    
    // 返回基于直线距离的备选计算
    return getFallbackRoute(query);
  }
}

/**
 * 批量获取多个路线信息
 * 优化性能，减少API调用次数
 */
export async function getBatchRoutesWithGemini(queries: RouteQuery[]): Promise<(RouteResponse | null)[]> {
  if (typeof window !== 'undefined') {
    console.error('❌ getBatchRoutesWithGemini can only be called on the server side');
    throw new Error('This function can only be called on the server side');
  }

  try {
    console.log('🗺️ Getting batch routes with Gemini API:', queries.length, 'routes');
    
    const batchPrompt = `请使用Google Maps Routes API 批量获取以下 ${queries.length} 条路线信息：

${queries.map((query, index) => `
路线 ${index + 1}:
- 起点: ${query.origin.lat}, ${query.origin.lng}
- 终点: ${query.destination.lat}, ${query.destination.lng}
- 交通方式: ${query.travelMode || 'DRIVE'}
- 出发时间: ${query.departureTime || '现在'}
`).join('')}

请为每条路线返回：
1. 实时行程时间（秒）
2. 行程距离（米）
3. 交通状况信息
4. 详细导航步骤

重要：请确保返回的是实时数据，考虑当前交通状况。`;

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      prompt: batchPrompt,
      schema: RouteResponseSchema,
      temperature: 0.1,
    });

    console.log('✅ Gemini batch routes response received');
    
    if (result.object.routes) {
      return result.object.routes.map(route => ({
        duration: route.duration,
        distance: route.distance,
        steps: route.steps,
        trafficInfo: route.trafficInfo
      }));
    }
    
    return queries.map(() => null);
    
  } catch (error) {
    console.error('❌ Gemini batch routes error:', error);
    
    // 返回备选计算结果
    return queries.map(query => getFallbackRoute(query));
  }
}

/**
 * 获取景点间的交通时间矩阵
 * 用于优化多个景点的访问顺序
 */
export async function getDistanceMatrix(
  origins: Array<{ lat: number; lng: number }>,
  destinations: Array<{ lat: number; lng: number }>,
  travelMode: 'DRIVE' | 'WALK' | 'TRANSIT' | 'BICYCLE' = 'DRIVE'
): Promise<number[][]> {
  if (typeof window !== 'undefined') {
    console.error('❌ getDistanceMatrix can only be called on the server side');
    throw new Error('This function can only be called on the server side');
  }

  try {
    console.log('📊 Getting distance matrix:', origins.length, 'x', destinations.length);
    
    const matrixPrompt = `请使用Google Maps Distance Matrix API 获取以下地点间的交通时间矩阵：

起点列表 (${origins.length} 个):
${origins.map((origin, i) => `${i + 1}. ${origin.lat}, ${origin.lng}`).join('\n')}

终点列表 (${destinations.length} 个):
${destinations.map((dest, i) => `${i + 1}. ${dest.lat}, ${dest.lng}`).join('\n')}

交通方式: ${travelMode}

请返回一个${origins.length}x${destinations.length} 的时间矩阵，其中每个元素表示从起点i到终点j的行程时间（秒）。
考虑实时交通状况，返回准确的时间数据。

返回格式：二维数组，每行代表一个起点到所有终点的时间。`;

    const MatrixSchema = z.object({
      matrix: z.array(z.array(z.number()))
    });

    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      prompt: matrixPrompt,
      schema: MatrixSchema,
      temperature: 0.1,
    });

    console.log('✅ Distance matrix received');
    return result.object.matrix;
    
  } catch (error) {
    console.error('❌ Distance matrix error:', error);
    
    // 返回基于直线距离的备选矩阵
    return getFallbackDistanceMatrix(origins, destinations);
  }
}

/**
 * 备选路线计算（基于直线距离和平均速度）
 */
function getFallbackRoute(query: RouteQuery): RouteResponse {
  const distance = calculateHaversineDistance(query.origin, query.destination);
  
  // 根据交通方式设置平均速度
  const speedMap = {
    'DRIVE': 30,      // 30 km/h (考虑城市交通)
    'WALK': 5,        // 5 km/h
    'TRANSIT': 25,    // 25 km/h (包含等车时间)
    'BICYCLE': 15     // 15 km/h
  };
  
  const speed = speedMap[query.travelMode || 'DRIVE'];
  const durationSeconds = Math.round((distance / speed) * 3600);
  const distanceMeters = Math.round(distance * 1000);
  
  return {
    duration: {
      text: formatDuration(durationSeconds),
      value: durationSeconds
    },
    distance: {
      text: formatDistance(distanceMeters),
      value: distanceMeters
    }
  };
}

/**
 * 备选距离矩阵计算
 */
function getFallbackDistanceMatrix(
  origins: Array<{ lat: number; lng: number }>,
  destinations: Array<{ lat: number; lng: number }>
): number[][] {
  return origins.map(origin =>
    destinations.map(destination => {
      const distance = calculateHaversineDistance(origin, destination);
      // 假设平均速度 30 km/h
      return Math.round((distance / 30) * 3600);
    })
  );
}

/**
 * 计算两点间的直线距离（公里）
 * 使用 Haversine 公式
 */
function calculateHaversineDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // 地球半径（公里）
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 格式化时间显示
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
}

/**
 * 格式化距离显示
 */
function formatDistance(meters: number): string {
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(1);
    return `${km}公里`;
  } else {
    return `${meters}米`;
  }
}

/**
 * 获取推荐的交通方式
 * 基于距离和时间自动选择最佳交通方式
 */
export function getRecommendedTravelMode(
  distance: number, // 公里
  availableModes: Array<'DRIVE' | 'WALK' | 'TRANSIT' | 'BICYCLE'> = ['DRIVE', 'WALK', 'TRANSIT']
): 'DRIVE' | 'WALK' | 'TRANSIT' | 'BICYCLE' {
  // 步行适合的距离
  if (distance <= 1 && availableModes.includes('WALK')) {
    return 'WALK';
  }
  
  // 自行车适合的距离
  if (distance <= 5 && availableModes.includes('BICYCLE')) {
    return 'BICYCLE';
  }
  
  // 公共交通适合的距离
  if (distance <= 20 && availableModes.includes('TRANSIT')) {
    return 'TRANSIT';
  }
  
  // 默认驾车
  return availableModes.includes('DRIVE') ? 'DRIVE' : availableModes[0];
}

/**
 * 分析交通状况并提供建议
 */
export function analyzeTrafficCondition(routeResponse: RouteResponse): {
  condition: string;
  suggestion: string;
  alternativeTime?: string;
} {
  if (!routeResponse.trafficInfo) {
    return {
      condition: '正常',
      suggestion: '按计划出行即可'
    };
  }
  
  const { currentTravelTime, historicalAverage, trafficCondition } = routeResponse.trafficInfo;
  const delayRatio = currentTravelTime / historicalAverage;
  
  const conditionMap = {
    'LIGHT': '畅通',
    'MODERATE': '缓慢',
    'HEAVY': '拥堵',
    'SEVERE': '严重拥堵'
  };
  
  const suggestionMap = {
    'LIGHT': '交通畅通，是出行的好时机',
    'MODERATE': '交通稍有缓慢，建议预留额外时间',
    'HEAVY': '交通拥堵，建议考虑其他路线或延后出行',
    'SEVERE': '交通严重拥堵，强烈建议改变出行计划'
  };
  
  return {
    condition: conditionMap[trafficCondition],
    suggestion: suggestionMap[trafficCondition],
    alternativeTime: delayRatio > 1.5 ? `建议延后 ${Math.round((delayRatio - 1) * 30)} 分钟出行` : undefined
  };
}