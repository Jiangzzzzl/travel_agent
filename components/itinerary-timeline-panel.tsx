'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, X, GripVertical, Plus, Minus, Sparkles, Clock, Copy, Lock, RefreshCw, Search, Edit3, Check, XIcon } from 'lucide-react';
import { itineraryStore, DayPlan, ItineraryAttraction } from '@/lib/itinerary-store';
import { intelligentAttractionAnalysis, intelligentAttractionAnalysisSync } from '@/lib/attraction-intelligence';
import { searchAttractionsWithGemini, getSmartRecommendations, GeminiAttractionSearch } from '@/lib/gemini-itinerary-service';
import { destinationContext, useDestinationContext } from '@/lib/destination-context';
import { useActions, useUIState } from '@ai-sdk/rsc';
import { nanoid } from 'nanoid';

interface GeminiPlaceResult {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  type?: string;
  description?: string;
  rating?: number;
}

export function ItineraryTimelinePanel({ forceVisible = false }: { forceVisible?: boolean }) {
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [totalDays, setTotalDays] = useState(3);
  const [manuallyMovedAttractions, setManuallyMovedAttractions] = useState<string[]>([]); // 新增：跟踪手动移动的景点
  const [draggedItem, setDraggedItem] = useState<{ attraction: ItineraryAttraction; fromDay: number; fromIndex: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeminiPlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // 新增：跟踪是否已执行过搜索
  const [useAITimeEstimate, setUseAITimeEstimate] = useState(true); // 新增：AI时间估算开关
  const [editingTime, setEditingTime] = useState<{day: number, index: number, value: string} | null>(null); // 新增：编辑时间状态
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false); // 新增：面板折叠状态
  const { submitUserMessage } = useActions();
  const [conversation, setConversation] = useUIState();
  
  // 使用目的地上下文 - 始终执行，不管面板是否可见
  const { destination, buildRestrictedQuery, isInDestination } = useDestinationContext();
  
  // 添加详细的调试信息
  useEffect(() => {
    console.log('🔗 ItineraryPanel: useDestinationContext hook initialized');
    console.log('🔗 ItineraryPanel: Current destination:', destination?.name || 'None');
    console.log('🔗 ItineraryPanel: Destination object:', destination);
  }, [destination]);
  
  // 只有在用户开始对话后才显示面板，并且考虑折叠状态
  // 在规划页面中，可以通过 forceVisible 强制显示面板
  const isVisible = (conversation.length > 0 || forceVisible) && !isPanelCollapsed;

  // 简化：完全依赖AI生成的destinationHero组件来设置目的地
  // 不再进行重复的对话历史解析
  useEffect(() => {
    console.log('🔍 ItineraryPanel: Destination context updated:', destination?.name || 'None');
  }, [destination]);

  useEffect(() => {
    setDayPlans(itineraryStore.getAllDayPlans());
    setTotalDays(itineraryStore.getTotalDays());
    setManuallyMovedAttractions(itineraryStore.getManuallyMovedAttractions()); // 初始化手动移动的景点
    
    const unsubscribe = itineraryStore.subscribe(() => {
      const plans = itineraryStore.getAllDayPlans();
      const days = itineraryStore.getTotalDays();
      const movedAttractions = itineraryStore.getManuallyMovedAttractions();
      
      // 只在数据真正变化时才更新状态
      setDayPlans(prevPlans => {
        if (JSON.stringify(prevPlans) !== JSON.stringify(plans)) {
          return plans;
        }
        return prevPlans;
      });
      
      setTotalDays(prevDays => {
        if (prevDays !== days) {
          return days;
        }
        return prevDays;
      });
      
      // 更新手动移动的景点状态
      setManuallyMovedAttractions(prevMoved => {
        if (JSON.stringify(prevMoved) !== JSON.stringify(movedAttractions)) {
          return movedAttractions;
        }
        return prevMoved;
      });
    });
    
    return unsubscribe;
  }, []);

  // Gemini 搜索功能 - 使用目的地上下文
  const handleGeminiSearch = async () => {
    console.log('🎯 Search started:', searchQuery);
    console.log('🎯 Current destination from hook:', destination);
    
    if (!searchQuery.trim() || isSearching) {
      console.log('🚫 Search blocked');
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true); // 标记已执行搜索
    
    try {
      // 直接使用 hook 提供的目的地
      const currentDestination = destination?.name;
      
      console.log('🎯 Final destination for search:', currentDestination || 'GLOBAL');
      
      // 调试信息
      console.log('🔍 Debug info:');
      console.log('  - searchQuery:', searchQuery);
      console.log('  - currentDestination:', currentDestination);
      console.log('  - destination from hook:', destination);
      
      // 使用预定义结果
      const predefinedResults = getPredefinedResults(searchQuery, currentDestination);
      
      console.log('🏛️ Predefined results returned:', predefinedResults.length);
      predefinedResults.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.name} - ${result.address}`);
      });
      
      if (predefinedResults.length > 0) {
        console.log('✅ Using predefined results:', predefinedResults.length);
        setSearchResults(predefinedResults);
      } else {
        console.log('⚠️ No predefined results found, calling Gemini API...');
        
        // 调用真正的 Gemini API 搜索，带重试机制
        let apiResults: any[] = [];
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries && apiResults.length === 0) {
          try {
            console.log(`🔍 Calling Gemini API (attempt ${retryCount + 1}/${maxRetries + 1}) with query:`, searchQuery);
            
            const searchParams: GeminiAttractionSearch = {
              query: searchQuery,
              city: currentDestination,
              type: 'all',
              limit: 10
            };
            
            apiResults = await searchAttractionsWithGemini(searchParams);
            console.log(`🎯 Gemini API returned (attempt ${retryCount + 1}):`, apiResults.length, 'results');
            
            if (apiResults.length === 0 && retryCount < maxRetries) {
              console.log('⏳ No results, waiting before retry...');
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
          } catch (error) {
            console.error(`❌ Gemini API search failed (attempt ${retryCount + 1}):`, error);
            if (retryCount < maxRetries) {
              console.log('⏳ Retrying after error...');
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          retryCount++;
        }
        
        if (apiResults.length > 0) {
          // 转换 API 结果为组件需要的格式
          const convertedResults: GeminiPlaceResult[] = await Promise.all(
            apiResults.map(async (result, index) => {
              let description = `预计游览时间: ${result.estimatedDuration || '未知'}`;
              
              // 如果启用了AI时间估算，获取AI估算的时间
              if (useAITimeEstimate) {
                try {
                  console.log('🤖 Getting AI time estimate for search result:', result.name);
                  const response = await fetch('/api/estimate-time', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      attractionName: result.name,
                      attractionType: 'cultural', // 默认类型
                      location: result.location
                    })
                  });

                  if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                      description = `预计游览时间: ${data.timeEstimate}`;
                      console.log('🤖 AI time estimate for search result:', result.name, '→', data.timeEstimate);
                    }
                  }
                } catch (error) {
                  console.warn('⚠️ Failed to get AI time estimate for search result:', error);
                }
              }
              
              return {
                id: `gemini-api-${Date.now()}-${index}`,
                name: result.name,
                address: result.location || '',
                coordinates: result.coordinates,
                type: 'attraction',
                description,
                rating: 4.0 // 默认评分
              };
            })
          );
          
          // 如果有目的地限制，过滤结果
          let filteredResults = convertedResults;
          if (currentDestination) {
            filteredResults = convertedResults.filter(result => 
              isInDestination(result.name, result.address)
            );
            console.log('🔍 Filtered results for', currentDestination, ':', filteredResults.length);
          }
          
          setSearchResults(filteredResults);
        } else {
          console.log('❌ No results after all retries');
          setSearchResults([]);
        }
      }
      
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 预定义结果函数
  const getPredefinedResults = (query: string, destination?: string): GeminiPlaceResult[] => {
    const queryLower = query.toLowerCase();
    const results: GeminiPlaceResult[] = [];
    
    console.log('🔍 getPredefinedResults called with:');
    console.log('  - query:', query);
    console.log('  - destination:', destination);
    
    // 标准化目的地名称 - 移除常见的动词后缀
    let normalizedDestination = destination;
    if (destination) {
      normalizedDestination = destination
        .replace(/[玩游览旅游参观]$/, '') // 移除末尾的动词
        .replace(/[，。！？\s]+$/, '') // 移除末尾的标点和空格
        .trim();
      
      console.log('🔧 Normalized destination from', destination, 'to', normalizedDestination);
    } else {
      console.log('⚠️ No destination provided to getPredefinedResults');
    }
    
    // 澳门景点搜索 - 强制使用API，不使用预定义结果
    if (normalizedDestination === '澳门') {
      console.log('🏛️ Macau destination detected - skipping predefined results, will use API search');
      // 直接返回空结果，强制使用API搜索
      return [];
    }
    
    // 博物馆结果
    if (queryLower.includes('博物馆') || queryLower.includes('museum')) {
      console.log('🏛️ Processing museum query...');
      console.log('  - normalizedDestination === "杭州":', normalizedDestination === '杭州');
      console.log('  - normalizedDestination === "西安":', normalizedDestination === '西安');
      console.log('  - normalizedDestination === "宁波":', normalizedDestination === '宁波');
      console.log('  - normalizedDestination === "北京":', normalizedDestination === '北京');
      
      if (normalizedDestination === '杭州') {
        console.log('✅ Returning Hangzhou museums');
        results.push(
          {
            id: 'hangzhou-museum-1',
            name: '浙江省博物馆',
            address: '浙江省杭州市西湖区孤山路25号',
            coordinates: { lat: 30.2516, lng: 120.1394 },
            type: 'museum',
            description: '浙江省最大的综合性博物馆'
          },
          {
            id: 'hangzhou-museum-2',
            name: '中国丝绸博物馆',
            address: '浙江省杭州市西湖区玉皇山路73-1号',
            coordinates: { lat: 30.2089, lng: 120.1267 },
            type: 'museum',
            description: '世界上最大的丝绸专业博物馆'
          }
        );
      } else if (normalizedDestination === '西安') {
        console.log('✅ Returning Xi\'an museums');
        results.push(
          {
            id: 'xian-museum-1',
            name: '陕西历史博物馆',
            address: '陕西省西安市雁塔区小寨东路91号',
            coordinates: { lat: 34.2318, lng: 108.9533 },
            type: 'museum',
            description: '中国第一座大型现代化国家级博物馆'
          },
          {
            id: 'xian-museum-2',
            name: '西安博物院',
            address: '陕西省西安市碑林区友谊西路72号',
            coordinates: { lat: 34.2456, lng: 108.9398 },
            type: 'museum',
            description: '展示西安历史文化的综合性博物馆'
          }
        );
      } else if (normalizedDestination === '宁波') {
        console.log('✅ Returning Ningbo museums');
        results.push(
          {
            id: 'ningbo-museum-1',
            name: '宁波博物馆',
            address: '浙江省宁波市鄞州区首南中路1000号',
            coordinates: { lat: 29.8197, lng: 121.5590 },
            type: 'museum',
            description: '宁波市最大的综合性博物馆，展示宁波历史文化'
          },
          {
            id: 'ningbo-museum-2',
            name: '中国港口博物馆',
            address: '浙江省宁波市北仑区春晓洋沙山',
            coordinates: { lat: 29.9108, lng: 121.8482 },
            type: 'museum',
            description: '中国首个以港口为主题的博物馆'
          }
        );
      } else if (normalizedDestination === '北京') {
        console.log('✅ Returning Beijing museums');
        results.push(
          {
            id: 'beijing-museum-1',
            name: '故宫博物院',
            address: '北京市东城区景山前街4号',
            coordinates: { lat: 39.9163, lng: 116.3972 },
            type: 'museum',
            description: '明清两朝的皇家宫殿'
          },
          {
            id: 'beijing-museum-2',
            name: '中国国家博物馆',
            address: '北京市东城区东长安街16号',
            coordinates: { lat: 39.9026, lng: 116.3974 },
            type: 'museum',
            description: '中国最大的综合性博物馆'
          }
        );
      } else if (normalizedDestination && normalizedDestination.length > 0) {
        // 对于其他城市，不添加预定义结果，让系统调用API搜索
        console.log('⚠️ City not in predefined museum list, will use API search');
      } else {
        console.log('⚠️ No destination specified, returning global museums');
        // 全球博物馆
        results.push(
          {
            id: 'global-museum-1',
            name: '故宫博物院',
            address: '北京市东城区景山前街4号',
            coordinates: { lat: 39.9163, lng: 116.3972 },
            type: 'museum',
            description: '明清两朝的皇家宫殿'
          },
          {
            id: 'global-museum-2',
            name: '卢浮宫',
            address: 'Rue de Rivoli, 75001 Paris, France',
            coordinates: { lat: 48.8606, lng: 2.3376 },
            type: 'museum',
            description: '世界著名艺术博物馆'
          }
        );
      }
    }
    
    // 公园结果
    if (queryLower.includes('公园') || queryLower.includes('park')) {
      console.log('🌳 Processing park query...');
      
      if (normalizedDestination === '杭州') {
        console.log('✅ Returning Hangzhou parks');
        results.push(
          {
            id: 'hangzhou-park-1',
            name: '西湖',
            address: '浙江省杭州市西湖区',
            coordinates: { lat: 30.2741, lng: 120.1551 },
            type: 'park',
            description: '中国著名的淡水湖，世界文化遗产'
          },
          {
            id: 'hangzhou-park-2',
            name: '太子湾公园',
            address: '浙江省杭州市西湖区南山路5-1号',
            coordinates: { lat: 30.2234, lng: 120.1267 },
            type: 'park',
            description: '杭州著名的赏花公园'
          }
        );
      } else if (normalizedDestination === '西安') {
        console.log('✅ Returning Xi\'an parks');
        results.push(
          {
            id: 'xian-park-1',
            name: '大唐芙蓉园',
            address: '陕西省西安市雁塔区芙蓉西路99号',
            coordinates: { lat: 34.2089, lng: 108.9789 },
            type: 'park',
            description: '盛唐文化大型主题公园'
          },
          {
            id: 'xian-park-2',
            name: '兴庆宫公园',
            address: '陕西省西安市碑林区咸宁西路55号',
            coordinates: { lat: 34.2598, lng: 108.9789 },
            type: 'park',
            description: '唐代兴庆宫遗址公园'
          }
        );
      } else if (normalizedDestination === '宁波') {
        console.log('✅ Returning Ningbo parks');
        results.push(
          {
            id: 'ningbo-park-1',
            name: '月湖公园',
            address: '浙江省宁波市海曙区镇明路月湖西区',
            coordinates: { lat: 29.8747, lng: 121.5440 },
            type: 'park',
            description: '宁波市中心的历史文化公园'
          },
          {
            id: 'ningbo-park-2',
            name: '日湖公园',
            address: '浙江省宁波市鄞州区日丽中路',
            coordinates: { lat: 29.8156, lng: 121.5731 },
            type: 'park',
            description: '宁波新城区的现代化公园'
          }
        );
      } else if (normalizedDestination === '北京') {
        console.log('✅ Returning Beijing parks');
        results.push(
          {
            id: 'beijing-park-1',
            name: '颐和园',
            address: '北京市海淀区新建宫门路19号',
            coordinates: { lat: 39.9999, lng: 116.2755 },
            type: 'park',
            description: '中国古典园林之首'
          },
          {
            id: 'beijing-park-2',
            name: '天坛公园',
            address: '北京市东城区天坛路甲1号',
            coordinates: { lat: 39.8823, lng: 116.4066 },
            type: 'park',
            description: '明清皇帝祭天的场所'
          }
        );
      } else if (normalizedDestination && normalizedDestination.length > 0) {
        // 对于其他城市，不添加预定义结果，让系统调用API搜索
        console.log('⚠️ City not in predefined park list, will use API search');
      } else {
        console.log('⚠️ No destination specified, returning global parks');
        // 全球公园
        results.push(
          {
            id: 'global-park-1',
            name: '中央公园',
            address: 'New York, NY 10024, United States',
            coordinates: { lat: 40.7829, lng: -73.9654 },
            type: 'park',
            description: '纽约著名的城市公园'
          },
          {
            id: 'global-park-2',
            name: '海德公园',
            address: 'London W2 2UH, United Kingdom',
            coordinates: { lat: 51.5073, lng: -0.1657 },
            type: 'park',
            description: '伦敦最大的皇家公园之一'
          }
        );
      }
    }
    
    // 美术馆结果
    if (queryLower.includes('美术馆') || queryLower.includes('art museum') || queryLower.includes('gallery')) {
      console.log('🎨 Processing art museum query...');
      
      if (normalizedDestination === '杭州') {
        console.log('✅ Returning Hangzhou art museums');
        results.push(
          {
            id: 'hangzhou-art-1',
            name: '浙江美术馆',
            address: '浙江省杭州市西湖区南山路138号',
            coordinates: { lat: 30.2389, lng: 120.1267 },
            type: 'art-museum',
            description: '浙江省最大的美术馆，展示现当代艺术作品'
          },
          {
            id: 'hangzhou-art-2',
            name: '中国美术学院美术馆',
            address: '浙江省杭州市西湖区南山路218号',
            coordinates: { lat: 30.2356, lng: 120.1289 },
            type: 'art-museum',
            description: '中国美术学院的专业美术馆'
          }
        );
      } else if (normalizedDestination === '宁波') {
        console.log('✅ Returning Ningbo art museums');
        results.push(
          {
            id: 'ningbo-art-1',
            name: '宁波美术馆',
            address: '浙江省宁波市海曙区解放北路82号',
            coordinates: { lat: 29.8747, lng: 121.5440 },
            type: 'art-museum',
            description: '宁波市主要的美术展览场所'
          },
          {
            id: 'ningbo-art-2',
            name: '宁波当代美术馆',
            address: '浙江省宁波市鄞州区日丽中路',
            coordinates: { lat: 29.8156, lng: 121.5731 },
            type: 'art-museum',
            description: '展示当代艺术作品的现代美术馆'
          }
        );
      } else if (normalizedDestination === '北京') {
        console.log('✅ Returning Beijing art museums');
        results.push(
          {
            id: 'beijing-art-1',
            name: '中国美术馆',
            address: '北京市东城区五四大街一号',
            coordinates: { lat: 39.9289, lng: 116.4081 },
            type: 'art-museum',
            description: '中国国家级美术馆'
          },
          {
            id: 'beijing-art-2',
            name: '今日美术馆',
            address: '北京市朝阳区百子湾路32号',
            coordinates: { lat: 39.8947, lng: 116.4774 },
            type: 'art-museum',
            description: '中国第一家民营当代美术馆'
          }
        );
      } else if (normalizedDestination && normalizedDestination.length > 0) {
        // 对于其他城市，不添加预定义结果，让系统调用API搜索
        console.log('⚠️ City not in predefined art museum list, will use API search');
      }
    }
    
    console.log('🏛️ Predefined results for', query, 'in', normalizedDestination || 'global', ':', results.length);
    return results;
  };

  // 辅助函数：检查地址中是否包含其他城市
  const hasOtherCityInAddress = (address: string, currentCity: string): boolean => {
    const otherCities = ['北京', '上海', '西安', '杭州', '成都', '大理', '广州', '深圳', '南京', '苏州', '天津', '重庆'];
    const addressLower = address.toLowerCase();
    const currentLower = currentCity.toLowerCase();
    
    return otherCities
      .filter(city => city.toLowerCase() !== currentLower)
      .some(city => addressLower.includes(city.toLowerCase()));
  };

  // 处理 Gemini 搜索结果选择
  const handleGeminiSelect = async (place: GeminiPlaceResult) => {
    console.log('🏛️ Adding Gemini place to itinerary:', place);
    console.log('🎛️ AI Time Estimate setting:', useAITimeEstimate);
    
    const attractionId = `gemini-${Date.now()}`;
    
    // 从搜索结果的description中提取时间估算，避免重复调用AI
    let estimatedDuration = '2小时'; // 默认值
    
    if (place.description && place.description.includes('预计游览时间:')) {
      const timeMatch = place.description.match(/预计游览时间:\s*(.+?)(?:\s|$)/);
      if (timeMatch && timeMatch[1]) {
        estimatedDuration = timeMatch[1].trim();
        console.log('🕒 Extracted time from search result:', estimatedDuration);
      }
    }
    
    // 使用智能分析获取其他信息，但保持时间估算一致
    try {
      const intelligence = intelligentAttractionAnalysisSync(place.name);
      console.log('🧠 Intelligence analysis (sync):', intelligence);
      
      const newAttraction = {
        id: attractionId,
        name: place.name,
        location: place.address,
        emoji: intelligence.emoji,
        vibeColor: intelligence.color,
        estimatedDuration: estimatedDuration, // 使用搜索结果中的时间
        coordinates: place.coordinates,
        priority: intelligence.priority
      };
      
      console.log('🎯 New attraction object with preserved time:', newAttraction);
      
      const targetDay = await itineraryStore.addAttractionAuto(newAttraction);
      console.log('✅ Added to itinerary store, target day:', targetDay);
    } catch (error) {
      console.error('❌ Failed to add attraction:', error);
    }
    
    // 清空搜索
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleDragStart = (attraction: ItineraryAttraction, fromDay: number, fromIndex: number) => {
    setDraggedItem({ attraction, fromDay, fromIndex });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (toDay: number) => {
    if (draggedItem) {
      itineraryStore.moveAttraction(draggedItem.attraction.id, draggedItem.fromDay, toDay, draggedItem.fromIndex);
      setDraggedItem(null);
    }
  };

  const handleRemove = (day: number, attractionId: string, index: number) => {
    itineraryStore.removeAttractionFromDay(day, attractionId, index);
  };

  const handleCopy = (attraction: ItineraryAttraction, toDay: number) => {
    itineraryStore.copyAttraction(attraction, toDay);
  };

  const handleAddDay = () => {
    if (totalDays < 14) {
      itineraryStore.setTotalDays(totalDays + 1);
    }
  };

  const handleRemoveDay = () => {
    if (totalDays > 1) {
      itineraryStore.setTotalDays(totalDays - 1);
    }
  };

  const handleReoptimize = async () => {
    try {
      await itineraryStore.reoptimizeItinerary();
    } catch (error) {
      console.error('❌ Reoptimization failed:', error);
    }
  };

  const handleToggleLock = (day: number) => {
    const dayPlan = dayPlans.find(d => d.day === day);
    if (dayPlan?.isManuallyAdjusted) {
      itineraryStore.unlockDay(day);
    } else {
      // 手动锁定该天（通过标记为手动调整）
      const attractions = itineraryStore.getDayPlan(day);
      if (attractions.length > 0) {
        // 触发一个假的移动操作来标记为手动调整
        itineraryStore.moveAttraction(attractions[0].id, day, day, 0);
      }
    }
  };

  // 处理时间编辑
  const handleEditTime = (day: number, index: number, currentDuration: string) => {
    setEditingTime({
      day,
      index,
      value: currentDuration || '2小时'
    });
  };

  const handleSaveTime = () => {
    if (editingTime) {
      const { day, index, value } = editingTime;
      const dayAttractions = itineraryStore.getDayPlan(day);
      if (dayAttractions[index]) {
        itineraryStore.updateAttractionDuration(day, dayAttractions[index].id, value, index);
      }
      setEditingTime(null);
    }
  };

  const handleCancelEditTime = () => {
    setEditingTime(null);
  };

  const handleTimeInputChange = (value: string) => {
    if (editingTime) {
      setEditingTime({
        ...editingTime,
        value
      });
    }
  };

  const handleQuickTimeSelect = (duration: string) => {
    if (editingTime) {
      setEditingTime({
        ...editingTime,
        value: duration
      });
    }
  };

  // 处理点击外部区域时自动保存编辑
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingTime) {
        const target = event.target as Element;
        // 检查点击是否在编辑区域外
        if (!target.closest('.time-edit-container')) {
          handleSaveTime();
        }
      }
    };

    if (editingTime) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingTime]);

  // 预设时间选项
  const quickTimeOptions = ['1小时', '2小时', '3小时', '半天', '全天'];

  const handleGenerateItinerary = async () => {
    const allDayPlans = itineraryStore.getAllDayPlans();
    
    // 构建详细的行程描述（用于后台AI处理）
    let detailedItineraryDescription = `IMPORTANT: Generate ONLY itinerary components, NO attraction cards or destination hero components.

I have planned a ${totalDays}-day itinerary with the following arrangement:

`;
    
    allDayPlans.forEach((dayPlan) => {
      if (dayPlan.attractions.length > 0) {
        detailedItineraryDescription += `Day ${dayPlan.day}: ${dayPlan.attractions.map(a => a.name).join(', ')}\n`;
      } else {
        detailedItineraryDescription += `Day ${dayPlan.day}: To be arranged\n`;
      }
    });
    
    detailedItineraryDescription += `
Please generate ONLY an itinerary component (no destinationHero, no attraction cards) with detailed daily plans including:
1. Visit time and sequence for each attraction
2. Transportation methods and time between attractions  
3. Dining recommendations
4. Important notes
5. If any day has no attractions, recommend suitable attractions for that day

CRITICAL REQUIREMENTS:
- Generate ONLY itinerary components in JSON format
- Do NOT generate destinationHero components
- Do NOT generate attraction cards or attraction components
- Do NOT repeat the attractions I already have - just organize them into a detailed schedule
- Focus on timing, logistics, dining, and practical travel advice

Please ensure the generated itinerary completely follows my day allocation, with attractions for each specific day appearing in that day's plan.`;
    
    // 构建简洁的用户显示消息
    const userDisplayMessage = `请根据我规划的${totalDays}天行程生成详细的旅行计划`;
    
    // 添加简洁的用户消息到对话（前端显示）
    setConversation((current: any) => [
      ...current,
      {
        id: nanoid(),
        role: 'user',
        display: <div className="text-sm leading-relaxed">{userDisplayMessage}</div>,
        content: detailedItineraryDescription, // 后台处理用详细描述
        text: detailedItineraryDescription, // 后台处理用详细描述
      },
    ]);
    
    try {
      // 发送详细描述给AI处理
      const response = await submitUserMessage(detailedItineraryDescription);
      setConversation((current: any) => [...current, response]);
    } catch (error) {
      console.error('Failed to generate itinerary:', error);
    }
  };

  const totalAttractions = itineraryStore.getTotalAttractions();

  return (
    <>
      <div 
        className={`fixed right-0 top-0 h-screen bg-white/95 backdrop-blur-xl border-l border-gray-200/30 shadow-xl z-50 flex flex-col transition-all duration-300 ${
          isVisible ? 'w-[360px]' : 'w-0 border-l-0'
        }`}
      >
        {isVisible && (
          <>
            {/* 头部 - 紧凑设计 */}
            <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">My Itinerary</h2>
                  <p className="text-xs text-gray-500">
                    {totalAttractions} places
                    {destination && (
                      <span className="ml-2 text-blue-600">• {destination.name}</span>
                    )}
                  </p>
                </div>
              </div>
              {/* 关闭按钮 */}
              <button
                onClick={() => setIsPanelCollapsed(true)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Hide itinerary panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* 天数控制 - 更紧凑 */}
            <div className="flex items-center gap-2 bg-gray-50/80 rounded-lg p-2 border border-gray-200/50">
              <button
                onClick={handleRemoveDay}
                disabled={totalDays <= 1}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/80 disabled:opacity-30 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <div className="flex-1 text-center">
                <div className="text-lg font-bold text-gray-900">{totalDays}</div>
                <div className="text-xs text-gray-500">days</div>
              </div>
              <button
                onClick={handleAddDay}
                disabled={totalDays >= 14}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/80 disabled:opacity-30 disabled:cursor-not-allowed rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 添加景点搜索 - 紧凑设计 */}
          <div className="flex-shrink-0 p-3 bg-gray-50/50 border-b border-gray-200/50">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-3 h-3 text-gray-600" />
              <h4 className="font-medium text-gray-900 text-xs">Add Places</h4>
              
              {/* 搜索范围切换按钮 */}
              <div className="ml-auto">
                <button
                  onClick={() => {
                    if (destination) {
                      destinationContext.clearDestination();
                      setSearchResults([]); // 清空搜索结果
                    } else {
                      // 简化：不再进行复杂的对话历史检测
                      // 用户可以通过重新提问来让AI设置目的地
                      console.log('💡 No destination set. User can ask a new question to set destination via AI.');
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    destination 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={destination ? `当前: ${destination.name} (点击切换到全球)` : '全球搜索 (点击切换到当前地点)'}
                >
                  <div className={`w-4 h-4 rounded-full border-2 relative ${
                    destination ? 'border-blue-500' : 'border-gray-400'
                  }`}>
                    <div className={`absolute w-2 h-2 rounded-full top-0.5 transition-all duration-200 ${
                      destination 
                        ? 'left-0.5 bg-blue-500' 
                        : 'right-0.5 bg-gray-400'
                    }`} />
                  </div>
                  <span>
                    {destination ? destination.name : '全球'}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Gemini 地点搜索 - 紧凑设计 */}
            <div className="mb-2">
              <div className="flex gap-1.5 mb-1.5">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHasSearched(false); // 重置搜索状态
                  }}
                  placeholder={destination 
                    ? `Search places in ${destination.name}...` 
                    : "Search places worldwide..."
                  }
                  className="flex-1 px-2 py-1.5 bg-white/80 border border-gray-300/50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-transparent text-xs"
                  onKeyDown={(e) => e.key === 'Enter' && handleGeminiSearch()}
                  onFocus={() => {
                    // 添加调试信息
                    console.log('🔍 Search input focused, current destination:', destination);
                    console.log('🔍 Destination name:', destination?.name);
                  }}
                />
                <button
                  onClick={handleGeminiSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  {isSearching ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-3 h-3" />
                  )}
                </button>
              </div>
              
              {/* 搜索结果 - 更紧凑 */}
              {searchResults.length > 0 && (
                <div className="mt-1.5 bg-white border border-gray-200 rounded-md shadow-sm max-h-40 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleGeminiSelect(result)}
                      className="w-full p-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900 text-xs">{result.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">{result.address}</div>
                      {result.description && (
                        <div className="text-xs text-blue-600 mt-0.5">{result.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {/* 简化的无结果提示 */}
              {searchQuery && !isSearching && searchResults.length === 0 && hasSearched && (
                <div className="mt-1.5 p-1.5 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="text-gray-600 text-xs text-center">
                    No results found for "{searchQuery}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 时间轴内容 - 更大的显示区域 */}
          <div className="flex-1 overflow-y-auto p-3">
            {totalAttractions === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="text-5xl mb-3">📅</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Start Planning Your Trip</h3>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>Use the search function above to add places</p>
                  <p>AI will automatically plan them into suitable days</p>
                  <p>You can also drag to adjust the order</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {dayPlans.map((dayPlan) => (
                  <div
                    key={dayPlan.day}
                    className="relative"
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(dayPlan.day)}
                  >
                    {/* 日期标题 - 更紧凑 */}
                    <div className={`px-3 py-2 rounded-lg mb-2 flex items-center gap-2 ${
                      dayPlan.isManuallyAdjusted 
                        ? 'bg-orange-100 border border-orange-200' 
                        : 'bg-blue-100 border border-blue-200'
                    }`}>
                      <span className="text-base">📍</span>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900 text-sm">Day {dayPlan.day}</span>
                        {dayPlan.isManuallyAdjusted && (
                          <span className="ml-2 text-xs text-orange-600">Locked</span>
                        )}
                      </div>
                      {dayPlan.isManuallyAdjusted && (
                        <button
                          onClick={() => handleToggleLock(dayPlan.day)}
                          className="p-1 text-orange-600 hover:text-orange-700 hover:bg-orange-200 rounded transition-colors"
                          title="Click to unlock"
                        >
                          <Lock className="w-3 h-3" />
                        </button>
                      )}
                      <span className="text-xs text-gray-500">
                        {dayPlan.attractions.length} places
                      </span>
                    </div>

                    {/* 景点列表 - 保持景点卡片大小，但减少间距 */}
                    <div className="space-y-1.5 ml-3">
                      {dayPlan.attractions.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-xs text-gray-500">
                          Drag places here
                        </div>
                      ) : (
                        dayPlan.attractions.map((attraction, index) => (
                          <div
                            key={`${attraction.id}-${index}`}
                            draggable={!editingTime}
                            onDragStart={() => handleDragStart(attraction, dayPlan.day, index)}
                            className={`group bg-white border rounded-lg p-3 transition-colors hover:shadow-sm ${
                              editingTime?.day === dayPlan.day && editingTime?.index === index
                                ? 'border-blue-300 bg-blue-50 cursor-default'
                                : 'border-gray-200 hover:border-gray-300 cursor-move'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                              </div>
                              
                              <div className="flex-shrink-0 text-2xl">
                                {attraction.emoji || '📍'}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900 text-sm truncate">
                                    {attraction.name}
                                  </h4>
                                  {manuallyMovedAttractions.includes(attraction.id) && (
                                    <button
                                      onClick={() => {
                                        console.log(`🔓 UI: Unlocking attraction ${attraction.id} (${attraction.name})`);
                                        itineraryStore.unlockAttraction(attraction.id);
                                      }}
                                      className="flex-shrink-0 p-1 bg-orange-100 hover:bg-orange-200 rounded-full transition-colors group/lock"
                                      title="Manually positioned - click to unlock"
                                    >
                                      <Lock className="w-3 h-3 text-orange-600 group-hover/lock:text-orange-700" />
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{attraction.location}</span>
                                </div>
                                {attraction.estimatedDuration && (
                                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {editingTime?.day === dayPlan.day && editingTime?.index === index ? (
                                      // 编辑模式
                                      <div className="flex flex-col gap-1 time-edit-container">
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="text"
                                            value={editingTime.value}
                                            onChange={(e) => handleTimeInputChange(e.target.value)}
                                            className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                            placeholder="2小时"
                                            autoFocus
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                handleSaveTime();
                                              } else if (e.key === 'Escape') {
                                                handleCancelEditTime();
                                              }
                                            }}
                                          />
                                          <button
                                            onClick={handleSaveTime}
                                            className="p-0.5 text-green-600 hover:text-green-700 rounded"
                                            title="Save"
                                          >
                                            <Check className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={handleCancelEditTime}
                                            className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
                                            title="Cancel"
                                          >
                                            <XIcon className="w-3 h-3" />
                                          </button>
                                        </div>
                                        {/* 快速选择按钮 */}
                                        <div className="flex gap-1 flex-wrap">
                                          {quickTimeOptions.map((option) => (
                                            <button
                                              key={option}
                                              onClick={() => handleQuickTimeSelect(option)}
                                              className={`px-1.5 py-0.5 text-xs rounded border transition-colors ${
                                                editingTime.value === option
                                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                              }`}
                                            >
                                              {option}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      // 显示模式
                                      <button
                                        onClick={() => handleEditTime(dayPlan.day, index, attraction.estimatedDuration || '')}
                                        className="flex items-center gap-1 hover:text-blue-600 transition-colors group/time"
                                        title="Click to edit duration"
                                      >
                                        <span>{attraction.estimatedDuration}</span>
                                        <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover/time:opacity-100 transition-opacity" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-shrink-0 flex gap-1">
                                <button
                                  onClick={() => handleCopy(attraction, dayPlan.day === totalDays ? 1 : dayPlan.day + 1)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Copy to next day"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRemove(dayPlan.day, attraction.id, index)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部操作 */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white space-y-3">
            <button
              onClick={async () => {
                try {
                  await itineraryStore.reoptimizeItinerary();
                } catch (error) {
                  console.error('❌ Reoptimization failed:', error);
                }
              }}
              disabled={totalAttractions === 0}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2 text-sm"
              title="Re-optimize itinerary (preserve locked attractions)"
            >
              <RefreshCw className="w-4 h-4" />
              Smart Optimize
            </button>
            
            {/* 解锁所有景点按钮 */}
            {manuallyMovedAttractions.length > 0 && (
              <button
                onClick={() => {
                  console.log(`🔓 UI: Unlocking all ${manuallyMovedAttractions.length} manually moved attractions`);
                  itineraryStore.clearAllManuallyMovedAttractions();
                }}
                className="w-full py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-md transition-colors flex items-center justify-center gap-2 text-sm"
                title="Unlock all manually moved attractions"
              >
                <Lock className="w-4 h-4" />
                Unlock All ({manuallyMovedAttractions.length})
              </button>
            )}
            
            <button
              onClick={handleGenerateItinerary}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Generate Itinerary
            </button>
            <button
              onClick={() => itineraryStore.clear()}
              disabled={totalAttractions === 0}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium rounded-md transition-colors text-sm"
            >
              Clear All
            </button>
          </div>
        </>
      )}
    </div>

    {/* 浮动显示按钮 - 当面板被隐藏时显示 */}
    {conversation.length > 0 && isPanelCollapsed && (
      <button
        onClick={() => setIsPanelCollapsed(false)}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-110"
        title="Show itinerary panel"
      >
        <Calendar className="w-5 h-5" />
      </button>
    )}
  </>
  );
}