import { NextRequest, NextResponse } from 'next/server';
import { searchPlacesWithGemini } from '@/lib/gemini-service';

export async function POST(request: NextRequest) {
  try {
    const { query, destination } = await request.json();
    
    console.log('🔍 API: Raw request body:', { query, destination });
    console.log('🔍 API: Destination type:', typeof destination);
    console.log('🔍 API: Destination value:', destination);
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🔍 API: Searching places with Gemini for:', query);
    console.log('🎯 API: Destination context:', destination || 'NO DESTINATION');
    
    // 直接使用传入的查询，不再添加额外的地理限制
    // 因为 gemini-itinerary-service.ts 中已经通过 buildLocationRestrictedQuery 处理了地理限制
    const enhancedQuery = query;
    
    console.log('📍 API: Using query as-is (geo restrictions already applied):', enhancedQuery);
    
    const results = await searchPlacesWithGemini(enhancedQuery);
    
    console.log('🔍 Raw Gemini API results:', results.length);
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.name} - ${result.address}`);
    });
    
    // 基本的服务器端验证和地理过滤
    let filteredResults = results.filter(result => {
      // 基本验证：确保结果有名称和地址
      const hasValidName = result.name && result.name.trim().length > 0;
      const hasValidAddress = result.address && result.address.trim().length > 5;
      
      if (!hasValidName || !hasValidAddress) {
        console.log('⚠️ Filtered out invalid result:', result.name, result.address);
        return false;
      }
      
      return true;
    });
    
    console.log('✅ API: Valid results after basic filtering:', filteredResults.length, 'out of', results.length);
    
    // 如果有目的地上下文，应用地理过滤
    if (destination && filteredResults.length > 0) {
      console.log('🎯 Applying destination filter for:', destination);
      
      const geoFilteredResults = filteredResults.filter(result => {
        const resultAddress = (result.address || '').toLowerCase();
        const destLower = destination.toLowerCase();
        
        console.log(`🔍 Checking: ${result.name}`);
        console.log(`   Address: ${resultAddress}`);
        console.log(`   Target destination: ${destLower}`);
        
        // 改进的地理匹配 - 支持中英文对照
        const isInDestination = (
          resultAddress.includes(destLower) ||
          resultAddress.includes(destLower + '市') ||
          resultAddress.includes(destLower + '省') ||
          resultAddress.includes(destLower + '区') ||
          isInCorrectRegion(resultAddress, destLower) ||
          // 添加中英文对照匹配
          matchChineseEnglishLocation(resultAddress, destLower)
        );
        
        console.log(`   Match result: ${isInDestination ? 'KEEP' : 'FILTER'}`);
        return isInDestination;
      });
      
      console.log('✅ Geo-filtered results:', geoFilteredResults.length, 'out of', filteredResults.length);
      
      // 只有在有匹配结果时才使用过滤后的结果
      if (geoFilteredResults.length > 0) {
        filteredResults = geoFilteredResults;
        console.log('✅ Using geo-filtered results');
      } else {
        console.log('⚠️ No results match destination, using all results without geo-filtering');
        // 如果地理过滤后没有结果，直接使用所有有效结果，不使用fallback
        console.log('✅ Using all valid results without geo-filtering');
      }
    }
    
    // 辅助函数：中英文地名对照匹配
    function matchChineseEnglishLocation(address: string, destination: string): boolean {
      const locationMap: Record<string, string[]> = {
        '香港': ['hong kong', 'hongkong', 'hk'],
        '澳门': ['macau', 'macao'],
        '台湾': ['taiwan', 'taipei'],
        '北京': ['beijing', 'peking'],
        '上海': ['shanghai'],
        '广州': ['guangzhou', 'canton'],
        '深圳': ['shenzhen'],
        '杭州': ['hangzhou'],
        '西安': ['xian', "xi'an"],
        '成都': ['chengdu'],
        '重庆': ['chongqing'],
        '天津': ['tianjin'],
        '南京': ['nanjing'],
        '武汉': ['wuhan'],
        '青岛': ['qingdao'],
        '大连': ['dalian'],
        '厦门': ['xiamen'],
        '苏州': ['suzhou'],
        '无锡': ['wuxi'],
        '宁波': ['ningbo'],
        '东京': ['tokyo'],
        '大阪': ['osaka'],
        '京都': ['kyoto'],
        '首尔': ['seoul'],
        '釜山': ['busan'],
        '曼谷': ['bangkok'],
        '清迈': ['chiang mai', 'chiangmai'],
        '新加坡': ['singapore'],
        '吉隆坡': ['kuala lumpur'],
        '雅加达': ['jakarta'],
        '马尼拉': ['manila'],
        '胡志明市': ['ho chi minh', 'saigon'],
        '河内': ['hanoi'],
        '金边': ['phnom penh'],
        '万象': ['vientiane'],
        '仰光': ['yangon'],
        '内比都': ['naypyidaw']
      };
      
      const englishNames = locationMap[destination] || [];
      return englishNames.some(englishName => 
        address.includes(englishName.toLowerCase())
      );
    }

    // 辅助函数：检查是否在正确的行政区域
    function isInCorrectRegion(address: string, destination: string): boolean {
      const regionMap: Record<string, string[]> = {
        '西安': ['陕西', '西安', '长安', '雁塔', '碑林', '莲湖', '新城', '未央', '灞桥', '阎良', '临潼', '高陵'],
        '北京': ['北京', '朝阳', '海淀', '西城', '东城', '丰台', '石景山', '门头沟', '房山', '通州', '顺义', '昌平', '大兴', '怀柔', '平谷', '密云', '延庆'],
        '上海': ['上海', '黄浦', '徐汇', '长宁', '静安', '普陀', '虹口', '杨浦', '闵行', '宝山', '嘉定', '浦东', '金山', '松江', '青浦', '奉贤', '崇明'],
        '杭州': ['浙江', '杭州', '上城', '下城', '江干', '拱墅', '西湖', '滨江', '萧山', '余杭', '富阳', '临安', '桐庐', '淳安', '建德'],
        '成都': ['四川', '成都', '锦江', '青羊', '金牛', '武侯', '成华', '龙泉驿', '青白江', '新都', '温江', '双流', '郫都'],
        '清迈': ['泰国', '清迈', 'chiang mai', 'เชียงใหม่'],
      };
      
      const regions = regionMap[destination] || [];
      return regions.some(region => address.includes(region.toLowerCase()));
    }
    
    // 辅助函数：为特定目的地提供备选结果
    function getFallbackResultsForDestination(destination: string): any[] {
      const fallbackMap: Record<string, any[]> = {
        '杭州': [
          {
            name: '浙江省博物馆',
            address: '浙江省杭州市西湖区孤山路25号',
            coordinates: { lat: 30.2516, lng: 120.1394 },
            type: 'museum',
            rating: 4.5,
            description: '浙江省最大的综合性博物馆'
          },
          {
            name: '中国丝绸博物馆',
            address: '浙江省杭州市西湖区玉皇山路73-1号',
            coordinates: { lat: 30.2089, lng: 120.1267 },
            type: 'museum',
            rating: 4.4,
            description: '世界上最大的丝绸专业博物馆'
          },
          {
            name: '杭州博物馆',
            address: '浙江省杭州市上城区粮道山18号',
            coordinates: { lat: 30.2456, lng: 120.1689 },
            type: 'museum',
            rating: 4.3,
            description: '展示杭州历史文化的综合性博物馆'
          }
        ],
        '西安': [
          {
            name: '陕西历史博物馆',
            address: '陕西省西安市雁塔区小寨东路91号',
            coordinates: { lat: 34.2318, lng: 108.9533 },
            type: 'museum',
            rating: 4.7,
            description: '中国第一座大型现代化国家级博物馆'
          },
          {
            name: '西安博物院',
            address: '陕西省西安市碑林区友谊西路72号',
            coordinates: { lat: 34.2456, lng: 108.9398 },
            type: 'museum',
            rating: 4.5,
            description: '展示西安历史文化的综合性博物馆'
          }
        ],
        '北京': [
          {
            name: '故宫博物院',
            address: '北京市东城区景山前街4号',
            coordinates: { lat: 39.9163, lng: 116.3972 },
            type: 'museum',
            rating: 4.8,
            description: '明清两朝的皇家宫殿，世界文化遗产'
          },
          {
            name: '中国国家博物馆',
            address: '北京市东城区东长安街16号',
            coordinates: { lat: 39.9026, lng: 116.3974 },
            type: 'museum',
            rating: 4.6,
            description: '中国历史文化艺术的最高殿堂'
          }
        ]
      };
      
      const results = fallbackMap[destination] || [];
      console.log('🤖 Using fallback results for', destination, ':', results.length);
      return results;
    }
    
    return NextResponse.json({
      success: true,
      results: filteredResults,
      query: enhancedQuery,
      originalQuery: query,
      destination
    });
    
  } catch (error) {
    console.error('❌ Gemini search API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to search places',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}