import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { z } from 'zod';
import { searchPlacesWithGemini } from '@/lib/gemini-service';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-2.5-flash'),
    messages,
    tools: {
      // 地点搜索工具 - 使用Google Maps API
      searchPlaces: {
        description: '当用户需要搜索特定地点、获取地点详细信息时调用。支持全球地点搜索',
        inputSchema: z.object({
          query: z.string().describe('搜索查询，如：故宫博物院、北京大学、Eiffel Tower'),
        }),
        execute: async ({ query }) => {
          try {
            const results = await searchPlacesWithGemini(query);
            return {
              success: true,
              query,
              results: results.map(place => ({
                name: place.name,
                address: place.address,
                coordinates: place.coordinates,
                type: place.type,
                rating: place.rating,
                description: place.description,
                openingHours: place.openingHours,
                website: place.website,
                phoneNumber: place.phoneNumber
              }))
            };
          } catch (error) {
            console.error('Gemini place search error:', error);
            return {
              success: false,
              query,
              error: 'Failed to search places',
              results: []
            };
          }
        },
      },

      // 定义推荐景点的工具
      recommendAttraction: {
        description: '当用户询问特定地点的景点或需要旅游建议时调用',
        inputSchema: z.object({
          name: z.string().describe('景点名称'),
          location: z.string().describe('具体位置'),
          tags: z.array(z.string()).describe('标签，如：古迹、摄影、美食'),
          description: z.string().describe('个性化的推荐理由'),
          vibeColor: z.string().describe('根据景点氛围返回一个十六进制颜色代码'),
          imageUrl: z.string().describe('景点的示意图描述'),
          coordinates: z.object({
            lat: z.number().describe('纬度'),
            lng: z.number().describe('经度')
          }).optional().describe('景点坐标（如果知道的话）'),
          estimatedDuration: z.string().describe('建议游览时长，如：2小时、半天'),
          bestTimeToVisit: z.string().describe('最佳游览时间，如：上午、傍晚'),
        }),
        execute: async (props) => {
          return {
            type: 'attraction_recommendation',
            data: props
          };
        },
      },

      // 显示地图和路线规划
      showMap: {
        description: '当用户需要查看景点位置、规划路线或了解地理分布时调用',
        inputSchema: z.object({
          center: z.object({
            lat: z.number().describe('地图中心纬度'),
            lng: z.number().describe('地图中心经度')
          }).describe('地图中心点'),
          zoom: z.number().describe('地图缩放级别1-20'),
          places: z.array(z.object({
            name: z.string().describe('地点名称'),
            lat: z.number().describe('纬度'),
            lng: z.number().describe('经度'),
            type: z.string().describe('地点类型：attraction, hotel, restaurant, transport'),
            description: z.string().describe('地点描述')
          })).describe('要在地图上显示的地点列表'),
          title: z.string().describe('地图标题'),
        }),
        execute: async (props) => {
          return {
            type: 'map_display',
            data: props
          };
        },
      },

      // 路线规划工具
      planRoute: {
        description: '当用户需要规划两个或多个地点之间的路线时调用',
        inputSchema: z.object({
          origin: z.object({
            name: z.string().describe('起点名称'),
            lat: z.number().describe('起点纬度'),
            lng: z.number().describe('起点经度')
          }).describe('起点'),
          destination: z.object({
            name: z.string().describe('终点名称'),
            lat: z.number().describe('终点纬度'),
            lng: z.number().describe('终点经度')
          }).describe('终点'),
          waypoints: z.array(z.object({
            name: z.string().describe('途经点名称'),
            lat: z.number().describe('途经点纬度'),
            lng: z.number().describe('途经点经度')
          })).optional().describe('途经点列表'),
          travelMode: z.enum(['driving', 'walking', 'transit', 'bicycling']).describe('出行方式'),
          estimatedTime: z.string().describe('预估时间'),
          estimatedDistance: z.string().describe('预估距离'),
          tips: z.array(z.string()).describe('路线建议和注意事项'),
        }),
        execute: async (props) => {
          return {
            type: 'route_plan',
            data: props
          };
        },
      },

      // 附近搜索工具
      searchNearby: {
        description: '当用户想要搜索某个地点附近的餐厅、酒店、景点等时调用',
        inputSchema: z.object({
          location: z.object({
            name: z.string().describe('搜索中心点名称'),
            lat: z.number().describe('搜索中心点纬度'),
            lng: z.number().describe('搜索中心点经度')
          }).describe('搜索中心点'),
          type: z.enum(['restaurant', 'hotel', 'attraction', 'shopping', 'transport']).describe('搜索类型'),
          radius: z.number().describe('搜索半径（公里）'),
          results: z.array(z.object({
            name: z.string().describe('地点名称'),
            address: z.string().describe('地址'),
            rating: z.number().describe('评分'),
            priceLevel: z.string().describe('价格水平'),
            distance: z.string().describe('距离'),
            description: z.string().describe('描述')
          })).describe('搜索结果列表'),
        }),
        execute: async (props) => {
          return {
            type: 'nearby_search',
            data: props
          };
        },
      },
    },
  });

  return result.toTextStreamResponse();
}
