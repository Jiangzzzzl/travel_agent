// 智能行程规划器 - 根据景点间距离、游览时间等动态规划天数
// 集成 Google Maps Routes API 获取真实交通时间
// 客户端环境使用备用计算，服务器端环境使用完整 API

// 路线查询接口（从 google-maps-routes.ts 复制）
interface RouteQuery {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  travelMode?: 'DRIVE' | 'WALK' | 'TRANSIT' | 'BICYCLE';
  departureTime?: string;
  trafficModel?: 'BEST_GUESS' | 'PESSIMISTIC' | 'OPTIMISTIC';
}

// 路线响应接口（从 google-maps-routes.ts 复制）
interface RouteResponse {
  duration: {
    text: string;
    value: number;
  };
  distance: {
    text: string;
    value: number;
  };
  steps?: any[];
  trafficInfo?: {
    currentTravelTime: number;
    historicalAverage: number;
    trafficCondition: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'SEVERE';
  };
}

export interface AttractionWithMetrics {
  id: string;
  name: string;
  location: string;
  emoji?: string;
  vibeColor?: string;
  estimatedDuration?: string; // 预计游玩时长（如 "2小时"）
  suggestedTime?: string; // 建议时间段
  coordinates?: { lat: number; lng: number }; // 坐标（用于计算距离）
  priority?: number; // 优先级（1-5，5最高）
}

export interface DaySchedule {
  day: number;
  attractions: AttractionWithMetrics[];
  totalDuration: number; // 总游览时间（分钟）
  totalDistance: number; // 总移动距离（公里）
  totalTravelTime: number; // 总交通时间（分钟）- 新增
  isManuallyAdjusted: boolean; // 是否被用户手动调整过
  routeInfo?: RouteInfo[]; // 路线信息 - 新增
}

export interface RouteInfo {
  from: string;
  to: string;
  duration: number; // 分钟
  distance: number; // 公里
  travelMode: string;
  trafficCondition?: string;
}

class SmartItineraryPlanner {
  private readonly MAX_DAILY_HOURS = 10; // 每天最多游玩时间（小时）
  private readonly MAX_DAILY_DISTANCE = 50; // 每天最大移动距离（公里）
  private readonly MAX_DAILY_TRAVEL_TIME = 180; // 每天最大交通时间（分钟）- 新增
  private readonly DEFAULT_TRAVEL_SPEED = 30; // 备用平均移动速度（公里/小时）
  private manuallyAdjustedDays: Set<number> = new Set(); // 记录被手动调整的天数
  private manuallyMovedAttractions: Set<string> = new Set(); // 记录被手动移动的景点ID
  private routeCache: Map<string, RouteResponse> = new Map(); // 路线缓存

  /**
   * 解析时长字符串为分钟数
   */
  private parseDuration(duration?: string): number {
    if (!duration) return 120; // 默认2小时
    
    const durationLower = duration.toLowerCase();
    
    // 处理特殊时间描述
    if (durationLower.includes('全天') || durationLower.includes('整天') || durationLower.includes('一天') || durationLower.includes('一整天')) {
      return 600; // 10小时（全天）
    }
    if (durationLower.includes('半天')) {
      return 300; // 5小时
    }
    
    const hourMatch = duration.match(/(\d+\.?\d*)\s*[小时|hour|h]/i);
    const minMatch = duration.match(/(\d+)\s*[分钟|minute|min|m]/i);
    
    let minutes = 0;
    if (hourMatch) minutes += parseFloat(hourMatch[1]) * 60;
    if (minMatch) minutes += parseInt(minMatch[1]);
    
    return minutes || 120;
  }

  /**
   * 检查景点是否需要独占一天
   */
  private isFullDayAttraction(attraction: AttractionWithMetrics): boolean {
    const duration = this.parseDuration(attraction.estimatedDuration);
    const durationLower = (attraction.estimatedDuration || '').toLowerCase();
    
    // 如果游览时间超过8小时，或者明确标注为全天，则需要独占一天
    return duration >= 480 || 
           durationLower.includes('全天') || 
           durationLower.includes('整天') || 
           durationLower.includes('一天') || 
           durationLower.includes('一整天');
  }

  /**
   * 计算两个坐标点之间的距离（公里）
   * 使用 Haversine 公式
   */
  private calculateDistance(
    coord1?: { lat: number; lng: number },
    coord2?: { lat: number; lng: number }
  ): number {
    if (!coord1 || !coord2) return 10; // 默认距离

    const R = 6371; // 地球半径（公里）
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLng = this.toRad(coord2.lng - coord1.lng);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.lat)) *
        Math.cos(this.toRad(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 使用 Google Maps Routes API 计算真实交通时间
   * 客户端版本：直接使用备用计算，避免服务器端 API 调用
   */
  private async calculateRealTravelTime(
    coord1?: { lat: number; lng: number },
    coord2?: { lat: number; lng: number },
    travelMode: 'DRIVE' | 'WALK' | 'TRANSIT' | 'BICYCLE' = 'DRIVE'
  ): Promise<{ duration: number; distance: number }> {
    if (!coord1 || !coord2) {
      return { duration: 30, distance: 10 }; // 默认值（分钟，公里）
    }

    // 检查缓存
    const cacheKey = `${coord1.lat},${coord1.lng}-${coord2.lat},${coord2.lng}-${travelMode}`;
    const cached = this.routeCache.get(cacheKey);
    
    if (cached) {
      return {
        duration: Math.round(cached.duration.value / 60), // 转换为分钟
        distance: Math.round(cached.distance.value / 1000) // 转换为公里
      };
    }

    // 客户端环境：直接使用备用计算，避免服务器端 API 调用
    if (typeof window !== 'undefined') {
      console.log('🔄 Using fallback calculation in client environment');
      const distance = this.calculateDistance(coord1, coord2);
      const speedMap = {
        'DRIVE': 30,      // 30 km/h (考虑城市交通)
        'WALK': 5,        // 5 km/h
        'TRANSIT': 25,    // 25 km/h (包含等车时间)
        'BICYCLE': 15     // 15 km/h
      };
      
      const speed = speedMap[travelMode];
      const duration = (distance / speed) * 60; // 转换为分钟
      
      const result = {
        duration: Math.round(duration),
        distance: Math.round(distance)
      };
      
      // 缓存备用计算结果
      const mockCached = {
        duration: { value: result.duration * 60 },
        distance: { value: result.distance * 1000 }
      };
      this.routeCache.set(cacheKey, mockCached as any);
      
      return result;
    }

    // 服务器端环境：尝试使用 Google Maps API
    try {
      const { getRouteWithGemini } = await import('./google-maps-routes');
      
      const routeQuery: RouteQuery = {
        origin: coord1,
        destination: coord2,
        travelMode,
        trafficModel: 'BEST_GUESS'
      };

      const routeResponse = await getRouteWithGemini(routeQuery);
      
      if (routeResponse) {
        // 缓存结果
        this.routeCache.set(cacheKey, routeResponse);
        
        return {
          duration: Math.round(routeResponse.duration.value / 60), // 转换为分钟
          distance: Math.round(routeResponse.distance.value / 1000) // 转换为公里
        };
      }
    } catch (error) {
      console.warn('⚠️ Google Maps API failed, using fallback calculation:', error);
    }

    // 备用计算：使用 Haversine 距离和平均速度
    const distance = this.calculateDistance(coord1, coord2);
    const duration = (distance / this.DEFAULT_TRAVEL_SPEED) * 60; // 转换为分钟
    
    return { duration: Math.round(duration), distance };
  }

  /**
   * 批量计算多个景点间的交通时间
   * 优化性能，减少API调用
   * 客户端版本：使用备用计算
   */
  private async calculateBatchTravelTimes(
    attractions: AttractionWithMetrics[],
    travelMode: 'DRIVE' | 'WALK' | 'TRANSIT' | 'BICYCLE' = 'DRIVE'
  ): Promise<Map<string, { duration: number; distance: number }>> {
    const results = new Map<string, { duration: number; distance: number }>();
    
    if (attractions.length < 2) return results;

    // 客户端环境：使用简化的逐个计算
    if (typeof window !== 'undefined') {
      console.log('🔄 Using fallback batch calculation in client environment');
      
      for (let i = 0; i < attractions.length - 1; i++) {
        const from = attractions[i];
        const to = attractions[i + 1];
        
        if (from.coordinates && to.coordinates) {
          const key = `${from.id}-${to.id}`;
          const travelInfo = await this.calculateRealTravelTime(
            from.coordinates,
            to.coordinates,
            travelMode
          );
          results.set(key, travelInfo);
        }
      }
      
      return results;
    }

    // 服务器端环境：尝试使用批量 API
    try {
      const { getBatchRoutesWithGemini } = await import('./google-maps-routes');
      
      // 准备批量查询
      const queries: RouteQuery[] = [];
      const queryKeys: string[] = [];
      
      for (let i = 0; i < attractions.length - 1; i++) {
        const from = attractions[i];
        const to = attractions[i + 1];
        
        if (from.coordinates && to.coordinates) {
          const key = `${from.id}-${to.id}`;
          queryKeys.push(key);
          
          queries.push({
            origin: from.coordinates,
            destination: to.coordinates,
            travelMode,
            trafficModel: 'BEST_GUESS'
          });
        }
      }

      if (queries.length > 0) {
        const routeResponses = await getBatchRoutesWithGemini(queries);
        
        routeResponses.forEach((response, index) => {
          if (response) {
            const key = queryKeys[index];
            results.set(key, {
              duration: Math.round(response.duration.value / 60),
              distance: Math.round(response.distance.value / 1000)
            });
          }
        });
      }
    } catch (error) {
      console.warn('⚠️ Batch route calculation failed, using fallback:', error);
      
      // 降级到逐个计算
      for (let i = 0; i < attractions.length - 1; i++) {
        const from = attractions[i];
        const to = attractions[i + 1];
        
        if (from.coordinates && to.coordinates) {
          const key = `${from.id}-${to.id}`;
          const travelInfo = await this.calculateRealTravelTime(
            from.coordinates,
            to.coordinates,
            travelMode
          );
          results.set(key, travelInfo);
        }
      }
    }

    return results;
  }

  /**
   * 智能分配景点到各天
   * @param attractions 要分配的景点列表
   * @param totalDays 总天数
   * @param existingSchedule 现有的行程安排（用于增量添加）
   * @returns 优化后的每日行程
   */
  async planItinerary(
    attractions: AttractionWithMetrics[],
    totalDays: number,
    existingSchedule?: Map<number, AttractionWithMetrics[]>
  ): Promise<DaySchedule[]> {
    console.log(`🎯 planItinerary called with ${attractions.length} attractions for ${totalDays} days`);
    console.log(`🎯 Input attractions: ${attractions.map(a => a.name).join(', ')}`);
    
    // 初始化每日行程
    const schedule: DaySchedule[] = [];
    for (let i = 1; i <= totalDays; i++) {
      const existingAttractions = existingSchedule?.get(i) || [];
      schedule.push({
        day: i,
        attractions: [...existingAttractions],
        totalDuration: this.calculateDayDuration(existingAttractions),
        totalDistance: this.calculateDayDistance(existingAttractions),
        totalTravelTime: await this.calculateDayTravelTime(existingAttractions),
        isManuallyAdjusted: this.manuallyAdjustedDays.has(i),
        routeInfo: await this.generateRouteInfo(existingAttractions)
      });
      console.log(`📅 Day ${i} initialized with ${existingAttractions.length} existing attractions`);
    }

    // 分离全天景点和普通景点
    const fullDayAttractions = attractions.filter(attr => this.isFullDayAttraction(attr));
    const regularAttractions = attractions.filter(attr => !this.isFullDayAttraction(attr));
    
    console.log(`🔄 Separated attractions: ${fullDayAttractions.length} full-day, ${regularAttractions.length} regular`);
    
    // 按优先级排序，优先级相同时按 ID 排序以保证稳定性
    const sortedFullDayAttractions = [...fullDayAttractions].sort((a, b) => {
      const priorityA = a.priority || 3;
      const priorityB = b.priority || 3;
      if (priorityB !== priorityA) {
        return priorityB - priorityA;
      }
      return a.id.localeCompare(b.id);
    });
    
    const sortedRegularAttractions = [...regularAttractions].sort((a, b) => {
      const priorityA = a.priority || 3;
      const priorityB = b.priority || 3;
      if (priorityB !== priorityA) {
        return priorityB - priorityA;
      }
      return a.id.localeCompare(b.id);
    });

    console.log(`🎯 Sorted full-day attractions: ${sortedFullDayAttractions.map(a => a.name).join(', ')}`);
    console.log(`🎯 Sorted regular attractions: ${sortedRegularAttractions.map(a => a.name).join(', ')}`);

    // 首先分配全天景点
    for (const attraction of sortedFullDayAttractions) {
      const bestDay = await this.findBestDay(attraction, schedule);
      if (bestDay !== -1) {
        schedule[bestDay - 1].attractions.push(attraction);
        await this.updateDaySchedule(schedule[bestDay - 1]);
        console.log(`🎯 Initial assignment: full-day ${attraction.name} to day ${bestDay}`);
      } else {
        console.warn(`⚠️ Could not assign full-day attraction: ${attraction.name}`);
      }
    }

    // 然后分配普通景点 - 使用轮询方式确保均匀分配
    console.log(`🔄 Starting round-robin assignment for ${sortedRegularAttractions.length} regular attractions`);
    
    let assignedCount = 0;
    for (let i = 0; i < sortedRegularAttractions.length; i++) {
      const attraction = sortedRegularAttractions[i];
      
      // 找到没有全天景点的天数
      const availableDays = schedule.filter(day => 
        !day.isManuallyAdjusted && 
        !day.attractions.some(attr => this.isFullDayAttraction(attr))
      );
      
      console.log(`🔄 Available days for ${attraction.name}: ${availableDays.map(d => d.day).join(', ')}`);
      
      if (availableDays.length > 0) {
        // 轮询分配
        const targetDayIndex = i % availableDays.length;
        const targetDay = availableDays[targetDayIndex];
        
        // 检查时间限制
        const newDuration = targetDay.totalDuration + this.parseDuration(attraction.estimatedDuration);
        if (newDuration <= this.MAX_DAILY_HOURS * 60) {
          targetDay.attractions.push(attraction);
          await this.updateDaySchedule(targetDay);
          assignedCount++;
          console.log(`🎯 Round-robin initial assignment: ${attraction.name} (${i}) -> day ${targetDay.day} (index ${targetDayIndex})`);
        } else {
          // 如果轮询的天数时间不够，使用原来的findBestDay方法
          const bestDay = await this.findBestDay(attraction, schedule);
          if (bestDay !== -1) {
            schedule[bestDay - 1].attractions.push(attraction);
            await this.updateDaySchedule(schedule[bestDay - 1]);
            assignedCount++;
            console.log(`🎯 Fallback assignment: ${attraction.name} to day ${bestDay} (time constraint)`);
          } else {
            console.warn(`⚠️ Could not assign regular attraction: ${attraction.name}`);
          }
        }
      } else {
        // 如果所有天都有全天景点，使用原来的方法
        const bestDay = await this.findBestDay(attraction, schedule);
        if (bestDay !== -1) {
          schedule[bestDay - 1].attractions.push(attraction);
          await this.updateDaySchedule(schedule[bestDay - 1]);
          assignedCount++;
          console.log(`🎯 Fallback assignment: ${attraction.name} to day ${bestDay} (no available days)`);
        } else {
          console.warn(`⚠️ Could not assign regular attraction: ${attraction.name}`);
        }
      }
    }

    console.log(`📊 Assignment summary: ${assignedCount}/${attractions.length} attractions assigned`);

    // 验证所有景点都被分配了
    const scheduledAttractionIds = new Set<string>();
    schedule.forEach(daySchedule => {
      daySchedule.attractions.forEach(attr => {
        scheduledAttractionIds.add(attr.id);
      });
    });

    const missingAttractions = attractions.filter(attr => !scheduledAttractionIds.has(attr.id));
    if (missingAttractions.length > 0) {
      console.error(`❌ Missing attractions after planItinerary:`, missingAttractions.map(a => a.name));
      
      // 尝试强制分配缺失的景点到第一个可用天数
      for (const missingAttraction of missingAttractions) {
        const availableDays = schedule.filter(day => !day.isManuallyAdjusted);
        if (availableDays.length > 0) {
          const targetDay = availableDays[0];
          targetDay.attractions.push(missingAttraction);
          await this.updateDaySchedule(targetDay);
          console.log(`🔧 Force-assigned missing attraction: ${missingAttraction.name} to day ${targetDay.day}`);
        }
      }
    }

    // 后处理：重新平衡景点分配
    await this.rebalanceSchedule(schedule);

    // 最终验证
    const finalScheduledIds = new Set<string>();
    schedule.forEach(daySchedule => {
      daySchedule.attractions.forEach(attr => {
        finalScheduledIds.add(attr.id);
      });
    });

    const finalMissingAttractions = attractions.filter(attr => !finalScheduledIds.has(attr.id));
    if (finalMissingAttractions.length > 0) {
      console.error(`❌ Still missing attractions after rebalancing:`, finalMissingAttractions.map(a => a.name));
    } else {
      console.log(`✅ All ${attractions.length} attractions successfully assigned`);
    }

    return schedule;
  }

  /**
   * 更新单天行程的统计信息
   */
  private async updateDaySchedule(daySchedule: DaySchedule): Promise<void> {
    daySchedule.totalDuration = this.calculateDayDuration(daySchedule.attractions);
    daySchedule.totalDistance = this.calculateDayDistance(daySchedule.attractions);
    daySchedule.totalTravelTime = await this.calculateDayTravelTime(daySchedule.attractions);
    daySchedule.routeInfo = await this.generateRouteInfo(daySchedule.attractions);
  }

  /**
   * 重新平衡行程安排
   * 将孤立的景点移动到更合适的天数，并确保景点均匀分配
   */
  private async rebalanceSchedule(schedule: DaySchedule[]): Promise<void> {
    console.log('🔄 Rebalancing schedule...');
    
    // 找出空的天数（没有景点的天数）
    const emptyDays = schedule.filter(day => 
      !day.isManuallyAdjusted && 
      day.attractions.length === 0
    );
    
    // 找出只有一个景点且不是全天景点的天数（排除被手动移动的景点）
    const lonelyDays = schedule.filter(day => 
      !day.isManuallyAdjusted && 
      day.attractions.length === 1 && 
      !this.isFullDayAttraction(day.attractions[0]) &&
      !this.isAttractionManuallyMoved(day.attractions[0].id) // 排除被手动移动的景点
    );
    
    // 找出景点过多的天数（超过3个景点或有多个全天景点）
    const crowdedDays = schedule.filter(day => 
      !day.isManuallyAdjusted && 
      (day.attractions.length > 3 || 
       day.attractions.filter(attr => this.isFullDayAttraction(attr)).length > 1)
    );
    
    console.log(`📊 Found ${emptyDays.length} empty days, ${lonelyDays.length} lonely days, ${crowdedDays.length} crowded days`);
    
    // 第一步：强制重新分配，确保每天都有景点（如果有足够的景点）
    const allAttractions = schedule.flatMap(day => 
      day.isManuallyAdjusted ? [] : day.attractions.filter(attr => 
        !this.isAttractionManuallyMoved(attr.id) // 排除被手动移动的景点
      )
    );
    const nonManualDays = schedule.filter(day => !day.isManuallyAdjusted);
    
    console.log(`📊 Total attractions: ${allAttractions.length}, Non-manual days: ${nonManualDays.length}`);
    console.log(`📊 Attractions: ${allAttractions.map(a => a.name).join(', ')}`);
    console.log(`📊 Empty days: ${emptyDays.map(d => d.day).join(', ')}`);
    console.log(`🔒 Manually moved attractions: ${this.getManuallyMovedAttractions().join(', ')}`);
    
    // 强制重新分配：只要有空天数就触发
    if (emptyDays.length > 0 && allAttractions.length > 0) {
      console.log('🔄 Aggressive rebalancing: redistributing all attractions evenly');
      
      // 清空所有非手动调整的天数，但保留被手动移动的景点
      nonManualDays.forEach(day => {
        const manuallyMovedAttractions = day.attractions.filter(attr => 
          this.isAttractionManuallyMoved(attr.id)
        );
        day.attractions = manuallyMovedAttractions; // 只保留被手动移动的景点
      });
      
      // 按优先级和类型排序景点，确保一致性
      const sortedAttractions = [...allAttractions].sort((a, b) => {
        const aIsFullDay = this.isFullDayAttraction(a);
        const bIsFullDay = this.isFullDayAttraction(b);
        
        // 全天景点优先
        if (aIsFullDay && !bIsFullDay) return -1;
        if (!aIsFullDay && bIsFullDay) return 1;
        
        // 然后按优先级
        const aPriority = a.priority || 3;
        const bPriority = b.priority || 3;
        if (aPriority !== bPriority) return bPriority - aPriority;
        
        // 最后按名称排序确保一致性
        return a.name.localeCompare(b.name);
      });
      
      console.log(`🔄 Sorted attractions for redistribution: ${sortedAttractions.map(a => `${a.name}(${this.isFullDayAttraction(a) ? 'full' : 'regular'})`).join(', ')}`);
      
      // 重新分配景点 - 使用轮询方式确保均匀分配
      for (let i = 0; i < sortedAttractions.length; i++) {
        const attraction = sortedAttractions[i];
        const isFullDay = this.isFullDayAttraction(attraction);
        
        console.log(`🎯 Processing attraction ${i + 1}/${sortedAttractions.length}: ${attraction.name} (isFullDay: ${isFullDay})`);
        
        if (isFullDay) {
          // 全天景点需要独占一天
          let foundEmptyDay = false;
          for (const checkDay of nonManualDays) {
            if (checkDay.attractions.length === 0) {
              checkDay.attractions.push(attraction);
              await this.updateDaySchedule(checkDay);
              foundEmptyDay = true;
              console.log(`🎯 Assigned full-day attraction ${attraction.name} to empty day ${checkDay.day}`);
              break;
            }
          }
          
          if (!foundEmptyDay) {
            // 如果没有空天数，找到景点最少且没有全天景点的天数
            const availableDays = nonManualDays.filter(day => 
              !day.attractions.some(attr => this.isFullDayAttraction(attr))
            );
            if (availableDays.length > 0) {
              const minDay = availableDays.reduce((min, day) => 
                day.attractions.length < min.attractions.length ? day : min
              );
              // Don't replace existing attractions, just add the full-day attraction
              // But first, move existing attractions to other days if possible
              const existingAttractions = [...minDay.attractions];
              minDay.attractions = [attraction]; // Set the full-day attraction
              await this.updateDaySchedule(minDay);
              console.log(`🎯 Assigned full-day attraction ${attraction.name} to day ${minDay.day}, moving ${existingAttractions.length} existing attractions`);
              
              // Try to relocate the displaced attractions
              for (const displacedAttraction of existingAttractions) {
                const otherAvailableDays = nonManualDays.filter(day => 
                  day.day !== minDay.day &&
                  !day.attractions.some(attr => this.isFullDayAttraction(attr))
                );
                
                if (otherAvailableDays.length > 0) {
                  // Find the day with the least attractions
                  const targetDay = otherAvailableDays.reduce((min, day) => 
                    day.attractions.length < min.attractions.length ? day : min
                  );
                  
                  const newDuration = targetDay.totalDuration + this.parseDuration(displacedAttraction.estimatedDuration);
                  if (newDuration <= this.MAX_DAILY_HOURS * 60) {
                    targetDay.attractions.push(displacedAttraction);
                    await this.updateDaySchedule(targetDay);
                    console.log(`🔄 Relocated displaced attraction ${displacedAttraction.name} to day ${targetDay.day}`);
                  } else {
                    // If no suitable day found, add back to the original day (this shouldn't happen often)
                    minDay.attractions.push(displacedAttraction);
                    await this.updateDaySchedule(minDay);
                    console.log(`⚠️ Could not relocate ${displacedAttraction.name}, keeping with full-day attraction`);
                  }
                } else {
                  // If no other days available, keep with the full-day attraction
                  minDay.attractions.push(displacedAttraction);
                  await this.updateDaySchedule(minDay);
                  console.log(`⚠️ No other days available for ${displacedAttraction.name}, keeping with full-day attraction`);
                }
              }
            }
          }
        } else {
          // 非全天景点：使用轮询方式均匀分配
          const availableDays = nonManualDays.filter(day => 
            !day.attractions.some(attr => this.isFullDayAttraction(attr))
          );
          
          console.log(`🔄 Available days for regular attraction: ${availableDays.map(d => d.day).join(', ')}`);
          
          if (availableDays.length > 0) {
            // 轮询分配：按顺序分配到每一天
            const targetDayIndex = i % availableDays.length;
            const targetDay = availableDays[targetDayIndex];
            
            console.log(`🎯 Round-robin: attraction ${i} -> day index ${targetDayIndex} -> day ${targetDay.day}`);
            
            // 检查时间限制
            const newDuration = targetDay.totalDuration + this.parseDuration(attraction.estimatedDuration);
            if (newDuration <= this.MAX_DAILY_HOURS * 60) {
              targetDay.attractions.push(attraction);
              await this.updateDaySchedule(targetDay);
              console.log(`🎯 Round-robin assigned ${attraction.name} to day ${targetDay.day} (${targetDay.attractions.length} attractions)`);
            } else {
              // 如果时间不够，找到时间最充裕的天数
              let bestDay = availableDays[0];
              let maxRemainingTime = 0;
              
              for (const day of availableDays) {
                const remainingTime = this.MAX_DAILY_HOURS * 60 - day.totalDuration;
                if (remainingTime > maxRemainingTime && remainingTime >= this.parseDuration(attraction.estimatedDuration)) {
                  maxRemainingTime = remainingTime;
                  bestDay = day;
                }
              }
              
              bestDay.attractions.push(attraction);
              await this.updateDaySchedule(bestDay);
              console.log(`🎯 Time-based assigned ${attraction.name} to day ${bestDay.day} (${bestDay.attractions.length} attractions)`);
            }
          } else {
            // 如果所有天都有全天景点，放到第一个空天数
            const emptyDays = nonManualDays.filter(d => d.attractions.length === 0);
            if (emptyDays.length > 0) {
              emptyDays[0].attractions.push(attraction);
              await this.updateDaySchedule(emptyDays[0]);
              console.log(`🎯 Assigned ${attraction.name} to empty day ${emptyDays[0].day}`);
            } else {
              // 最后的备选方案：放到第一天
              if (nonManualDays.length > 0) {
                nonManualDays[0].attractions.push(attraction);
                await this.updateDaySchedule(nonManualDays[0]);
                console.log(`🎯 Fallback assigned ${attraction.name} to day ${nonManualDays[0].day}`);
              }
            }
          }
        }
      }
      
      console.log('✅ Aggressive rebalancing completed');
      
      // 检查是否还有空天数，如果有则进一步重新分配
      const remainingEmptyDays = nonManualDays.filter(d => d.attractions.length === 0);
      if (remainingEmptyDays.length > 0) {
        console.log(`⚠️ Still have ${remainingEmptyDays.length} empty days after rebalancing`);
        
        // 尝试从有多个景点的天数中移动景点到空天数
        const daysWithMultipleAttractions = nonManualDays.filter(d => 
          d.attractions.length > 1 && 
          !d.attractions.some(attr => this.isFullDayAttraction(attr))
        );
        
        for (const emptyDay of remainingEmptyDays) {
          if (daysWithMultipleAttractions.length === 0) break;
          
          // 找到景点最多的天数
          const sourceDays = daysWithMultipleAttractions.filter(d => d.attractions.length > 1);
          if (sourceDays.length === 0) break;
          
          const sourceDay = sourceDays.reduce((max, day) => 
            day.attractions.length > max.attractions.length ? day : max
          );
          
          // 移动最后一个景点
          const attractionToMove = sourceDay.attractions.pop();
          if (attractionToMove) {
            emptyDay.attractions.push(attractionToMove);
            await this.updateDaySchedule(sourceDay);
            await this.updateDaySchedule(emptyDay);
            console.log(`🔄 Moved ${attractionToMove.name} from day ${sourceDay.day} to empty day ${emptyDay.day}`);
            
            // 如果源天数只剩1个景点，从列表中移除
            if (sourceDay.attractions.length <= 1) {
              const index = daysWithMultipleAttractions.indexOf(sourceDay);
              if (index !== -1) {
                daysWithMultipleAttractions.splice(index, 1);
              }
            }
          }
        }
      }
      
      return;
    }
    
    // 第二步：优化现有分配
    // 优先处理：将拥挤天数的景点移动到空天数
    if (emptyDays.length > 0 && crowdedDays.length > 0) {
      for (const emptyDay of emptyDays) {
        if (crowdedDays.length === 0) break;
        
        // 找到最拥挤的天数
        const mostCrowdedDay = crowdedDays.reduce((max, day) => 
          day.attractions.length > max.attractions.length ? day : max
        );
        
        if (mostCrowdedDay.attractions.length > 3) {
          // 移动最后一个非全天且非手动移动的景点到空天数
          const nonFullDayAttractions = mostCrowdedDay.attractions.filter(attr => 
            !this.isFullDayAttraction(attr) && !this.isAttractionManuallyMoved(attr.id)
          );
          
          if (nonFullDayAttractions.length > 0) {
            const attractionToMove = nonFullDayAttractions[nonFullDayAttractions.length - 1];
            const attractionIndex = mostCrowdedDay.attractions.indexOf(attractionToMove);
            
            console.log(`🔄 Moving ${attractionToMove.name} from crowded day ${mostCrowdedDay.day} to empty day ${emptyDay.day}`);
            
            mostCrowdedDay.attractions.splice(attractionIndex, 1);
            emptyDay.attractions.push(attractionToMove);
            
            await this.updateDaySchedule(mostCrowdedDay);
            await this.updateDaySchedule(emptyDay);
            
            // 如果这个天数不再拥挤，从列表中移除
            if (mostCrowdedDay.attractions.length <= 3) {
              const index = crowdedDays.indexOf(mostCrowdedDay);
              if (index !== -1) {
                crowdedDays.splice(index, 1);
              }
            }
          }
        }
      }
    }
    
    // 处理孤立景点：将单个景点的天数合并到其他天数（排除被手动移动的景点）
    const availableDays = schedule.filter(day => 
      !day.isManuallyAdjusted && 
      day.attractions.length > 0 && 
      day.attractions.length < 3 && // 最多3个景点
      !day.attractions.some(attr => this.isFullDayAttraction(attr)) && // 没有全天景点
      day.totalDuration < this.MAX_DAILY_HOURS * 60 * 0.7 // 时间利用率不超过70%
    );
    
    for (const lonelyDay of lonelyDays) {
      const attraction = lonelyDay.attractions[0];
      let bestTargetDay: DaySchedule | null = null;
      let bestScore = -Infinity;
      
      // 为孤立景点找到最佳的目标天数
      for (const targetDay of availableDays) {
        if (targetDay.day === lonelyDay.day) continue;
        
        // 检查是否可以添加到目标天数
        const newDuration = targetDay.totalDuration + this.parseDuration(attraction.estimatedDuration);
        if (newDuration > this.MAX_DAILY_HOURS * 60) continue;
        
        const score = await this.calculateDayScore(attraction, targetDay);
        if (score > bestScore) {
          bestScore = score;
          bestTargetDay = targetDay;
        }
      }
      
      // 如果找到了更好的天数，移动景点
      if (bestTargetDay) {
        console.log(`🔄 Moving ${attraction.name} from lonely day ${lonelyDay.day} to day ${bestTargetDay.day}`);
        
        // 从原天数移除
        lonelyDay.attractions = [];
        await this.updateDaySchedule(lonelyDay);
        
        // 添加到目标天数
        bestTargetDay.attractions.push(attraction);
        await this.updateDaySchedule(bestTargetDay);
        
        // 更新可用天数列表
        const targetIndex = availableDays.indexOf(bestTargetDay);
        if (targetIndex !== -1 && bestTargetDay.attractions.length >= 3) {
          availableDays.splice(targetIndex, 1);
        }
      }
    }
    
    console.log('✅ Schedule rebalancing completed');
    
    // 最终检查：确保没有空天数
    const finalEmptyDays = schedule.filter(day => 
      !day.isManuallyAdjusted && 
      day.attractions.length === 0
    );
    
    if (finalEmptyDays.length > 0) {
      console.log(`⚠️ Still have ${finalEmptyDays.length} empty days after rebalancing: ${finalEmptyDays.map(d => d.day).join(', ')}`);
      
      // 最后的强制分配：从有景点的天数中移动景点到空天数
      const daysWithAttractions = schedule.filter(day => 
        !day.isManuallyAdjusted && 
        day.attractions.length > 0
      );
      
      if (daysWithAttractions.length > 0) {
        for (const emptyDay of finalEmptyDays) {
          // 找到景点最多的天数
          const sourceDays = daysWithAttractions.filter(d => d.attractions.length > 1);
          if (sourceDays.length === 0) break;
          
          const sourceDay = sourceDays.reduce((max, day) => 
            day.attractions.length > max.attractions.length ? day : max
          );
          
          // 移动一个非全天且非手动移动的景点
          const nonFullDayAttractions = sourceDay.attractions.filter(attr => 
            !this.isFullDayAttraction(attr) && !this.isAttractionManuallyMoved(attr.id)
          );
          
          if (nonFullDayAttractions.length > 0) {
            const attractionToMove = nonFullDayAttractions[0];
            const attractionIndex = sourceDay.attractions.indexOf(attractionToMove);
            
            sourceDay.attractions.splice(attractionIndex, 1);
            emptyDay.attractions.push(attractionToMove);
            
            await this.updateDaySchedule(sourceDay);
            await this.updateDaySchedule(emptyDay);
            
            console.log(`🔄 Final move: ${attractionToMove.name} from day ${sourceDay.day} to empty day ${emptyDay.day}`);
            
            // 如果源天数只剩1个景点，从列表中移除
            if (sourceDay.attractions.length <= 1) {
              const index = daysWithAttractions.indexOf(sourceDay);
              if (index !== -1) {
                daysWithAttractions.splice(index, 1);
              }
            }
          }
        }
      }
    }
    
    // 打印最终分配结果
    console.log('📊 Final schedule distribution:');
    schedule.forEach(day => {
      console.log(`  Day ${day.day}: ${day.attractions.length} attractions - ${day.attractions.map(a => a.name).join(', ')}`);
    });
  }

  /**
   * 为单个景点找到最佳的天数
   */
  private async findBestDay(
    attraction: AttractionWithMetrics,
    schedule: DaySchedule[]
  ): Promise<number> {
    let bestDay = -1;
    let bestScore = -Infinity;
    
    const isFullDay = this.isFullDayAttraction(attraction);
    
    // 计算当前景点分布，用于均匀分配
    const nonManualDays = schedule.filter(d => !d.isManuallyAdjusted);
    const attractionCounts = nonManualDays.map(d => d.attractions.length);
    const minAttractionCount = Math.min(...attractionCounts);
    const maxAttractionCount = Math.max(...attractionCounts);
    
    for (const daySchedule of schedule) {
      // 跳过被手动调整的天数
      if (daySchedule.isManuallyAdjusted) continue;

      // 如果是全天景点，只考虑空的天数
      if (isFullDay && daySchedule.attractions.length > 0) {
        continue;
      }
      
      // 如果这天已经有全天景点，不能再添加其他景点
      if (daySchedule.attractions.length > 0) {
        const hasFullDayAttraction = daySchedule.attractions.some(attr => 
          this.isFullDayAttraction(attr)
        );
        if (hasFullDayAttraction) {
          continue;
        }
      }

      let score = await this.calculateDayScore(attraction, daySchedule);
      
      // 检查是否超过每日限制
      const newDuration = daySchedule.totalDuration + this.parseDuration(attraction.estimatedDuration);
      const newTravelInfo = await this.estimateNewTravelInfo(attraction, daySchedule);
      
      if (
        newDuration <= this.MAX_DAILY_HOURS * 60 &&
        newTravelInfo.distance <= this.MAX_DAILY_DISTANCE &&
        newTravelInfo.travelTime <= this.MAX_DAILY_TRAVEL_TIME
      ) {
        // 均匀分配奖励：优先选择景点较少的天数
        const currentCount = daySchedule.attractions.length;
        if (currentCount === minAttractionCount) {
          score += 30; // 景点最少的天数获得奖励
        } else if (currentCount === maxAttractionCount && maxAttractionCount > minAttractionCount + 1) {
          score -= 20; // 景点最多的天数（如果差距大于1）受到惩罚
        }
        
        // 全天景点优先选择空的天数
        if (isFullDay && daySchedule.attractions.length === 0) {
          score += 500; // 给全天景点的空天数额外加分
          bestScore = score;
          bestDay = daySchedule.day;
          break; // 找到空天数就立即使用
        } else if (!isFullDay) {
          // 非全天景点正常评分
          if (score > bestScore) {
            bestScore = score;
            bestDay = daySchedule.day;
          }
        }
      }
    }

    // 如果没有找到合适的天数，使用更智能的备选策略
    if (bestDay === -1) {
      if (isFullDay) {
        // 全天景点优先选择完全空的天数
        const emptyDays = nonManualDays.filter(d => d.attractions.length === 0);
        if (emptyDays.length > 0) {
          // 选择第一个空天数
          bestDay = emptyDays[0].day;
        } else {
          // 如果没有空天数，选择景点最少且没有全天景点的天数
          const availableDays = nonManualDays.filter(d => 
            !d.attractions.some(attr => this.isFullDayAttraction(attr))
          );
          if (availableDays.length > 0) {
            const minDay = availableDays.reduce((min, day) => {
              if (day.attractions.length < min.attractions.length) {
                return day;
              } else if (day.attractions.length === min.attractions.length && day.day < min.day) {
                return day;
              }
              return min;
            });
            // 清空这一天，为全天景点让路
            minDay.attractions = [];
            bestDay = minDay.day;
          }
        }
      } else {
        // 非全天景点选择景点最少且没有全天景点的天数
        const availableDays = nonManualDays.filter(d => 
          !d.attractions.some(attr => this.isFullDayAttraction(attr))
        );
        if (availableDays.length > 0) {
          // 优先选择景点最少的天数，实现均匀分配
          const minDay = availableDays.reduce((min, day) => {
            if (day.attractions.length < min.attractions.length) {
              return day;
            } else if (day.attractions.length === min.attractions.length) {
              // 如果景点数量相同，选择天数较小的（确保一致性）
              return day.day < min.day ? day : min;
            }
            return min;
          });
          bestDay = minDay.day;
        } else {
          // 如果所有天都有全天景点，选择第一个空天数
          const emptyDays = nonManualDays.filter(d => d.attractions.length === 0);
          if (emptyDays.length > 0) {
            bestDay = emptyDays[0].day;
          }
        }
      }
      
      // 最后的备选方案：按天数顺序分配
      if (bestDay === -1 && nonManualDays.length > 0) {
        // 使用景点名称哈希确保一致性分配
        const nameHash = attraction.name.split('').reduce((hash, char) => {
          return ((hash << 5) - hash) + char.charCodeAt(0);
        }, 0);
        const dayIndex = Math.abs(nameHash) % nonManualDays.length;
        bestDay = nonManualDays[dayIndex].day;
      }
    }

    console.log(`🎯 Selected day ${bestDay} for ${attraction.name} (isFullDay: ${isFullDay}, score: ${bestScore.toFixed(1)})`);
    return bestDay;
  }

  /**
   * 计算将景点添加到某天的得分
   * 得分越高表示越适合
   */
  private async calculateDayScore(
    attraction: AttractionWithMetrics,
    daySchedule: DaySchedule
  ): Promise<number> {
    let score = 0;
    
    const isFullDay = this.isFullDayAttraction(attraction);
    const attractionDuration = this.parseDuration(attraction.estimatedDuration);

    // 基础分数：空天数有优势，但不要过度偏向
    if (daySchedule.attractions.length === 0) {
      score += 50; // 减少空天数的基础分数
      
      // 全天景点更偏好空天数
      if (isFullDay) {
        score += 100;
      }
    } else {
      // 如果这天已经有景点，全天景点得分很低
      if (isFullDay) {
        score -= 500;
      }
      
      // 检查是否已经有全天景点
      const hasFullDayAttraction = daySchedule.attractions.some(attr => 
        this.isFullDayAttraction(attr)
      );
      if (hasFullDayAttraction) {
        score -= 500; // 已有全天景点的天数不适合添加其他景点
      }
    }

    // 根据剩余时间计算分数
    const remainingTime = this.MAX_DAILY_HOURS * 60 - daySchedule.totalDuration;
    if (remainingTime >= attractionDuration) {
      // 时间刚好合适的得分更高，但不要过度奖励
      const timeUtilization = attractionDuration / remainingTime;
      if (timeUtilization > 0.6) {
        score += 30; // 时间利用率高的组合得分更高
      } else {
        score += 20; // 基础时间匹配分数
      }
    } else {
      score -= 200; // 时间不够的严重扣分
    }

    // 根据真实交通时间和距离计算分数
    if (daySchedule.attractions.length > 0) {
      const lastAttraction = daySchedule.attractions[daySchedule.attractions.length - 1];
      
      try {
        const travelInfo = await this.calculateRealTravelTime(
          lastAttraction.coordinates, 
          attraction.coordinates
        );
        
        // 距离评分：距离越近分数越高
        if (travelInfo.distance <= 10) {
          score += 25; // 10公里内加分
        } else if (travelInfo.distance <= 20) {
          score += 10; // 20公里内少量加分
        } else {
          score -= travelInfo.distance * 0.5; // 距离太远扣分
        }
        
        // 交通时间评分：时间越短分数越高
        if (travelInfo.duration <= 30) {
          score += 15; // 30分钟内加分
        } else {
          score -= travelInfo.duration * 0.3; // 时间太长扣分
        }
        
      } catch (error) {
        // 如果API调用失败，使用备用计算
        const distance = this.calculateDistance(lastAttraction.coordinates, attraction.coordinates);
        if (distance <= 10) {
          score += 15;
        } else {
          score -= distance * 0.5;
        }
      }
    }

    // 根据景点数量平衡分数（避免某天景点过多）
    // 减少惩罚权重，让分配更均匀但不过度惩罚
    const attractionCountPenalty = daySchedule.attractions.length * 15;
    score -= attractionCountPenalty;

    // 根据交通时间平衡分数（避免某天交通时间过长）
    const remainingTravelTime = this.MAX_DAILY_TRAVEL_TIME - daySchedule.totalTravelTime;
    if (remainingTravelTime < 60) { // 如果剩余交通时间少于1小时
      score -= 30;
    }
    
    // 优先级加分
    const priority = attraction.priority || 3;
    score += priority * 3;

    // 移除随机因子，确保排序结果一致性
    // 使用景点名称的哈希值作为确定性的"随机"因子
    const nameHash = attraction.name.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0);
    const deterministicFactor = (nameHash % 10) - 5; // -5 到 +4 的确定性分数
    score += deterministicFactor * 0.1; // 减小影响

    console.log(`📊 Day ${daySchedule.day} score for ${attraction.name}: ${score.toFixed(1)} (attractions: ${daySchedule.attractions.length}, isFullDay: ${isFullDay})`);

    return score;
  }

  /**
   * 估算添加新景点后的总距离和交通时间
   */
  private async estimateNewTravelInfo(
    attraction: AttractionWithMetrics,
    daySchedule: DaySchedule
  ): Promise<{ distance: number; travelTime: number }> {
    if (daySchedule.attractions.length === 0) {
      return { distance: 0, travelTime: 0 };
    }
    
    const lastAttraction = daySchedule.attractions[daySchedule.attractions.length - 1];
    
    try {
      const travelInfo = await this.calculateRealTravelTime(
        lastAttraction.coordinates,
        attraction.coordinates
      );
      
      return {
        distance: daySchedule.totalDistance + travelInfo.distance,
        travelTime: daySchedule.totalTravelTime + travelInfo.duration
      };
    } catch (error) {
      // 备用计算
      const additionalDistance = this.calculateDistance(
        lastAttraction.coordinates,
        attraction.coordinates
      );
      const additionalTravelTime = (additionalDistance / this.DEFAULT_TRAVEL_SPEED) * 60;
      
      return {
        distance: daySchedule.totalDistance + additionalDistance,
        travelTime: daySchedule.totalTravelTime + additionalTravelTime
      };
    }
  }

  /**
   * 计算某天的总游览时间（分钟）
   */
  private calculateDayDuration(attractions: AttractionWithMetrics[]): number {
    return attractions.reduce((total, attraction) => {
      return total + this.parseDuration(attraction.estimatedDuration);
    }, 0);
  }

  /**
   * 计算某天的总移动距离（公里）
   */
  private calculateDayDistance(attractions: AttractionWithMetrics[]): number {
    let totalDistance = 0;
    
    for (let i = 0; i < attractions.length - 1; i++) {
      totalDistance += this.calculateDistance(
        attractions[i].coordinates,
        attractions[i + 1].coordinates
      );
    }
    
    return totalDistance;
  }

  /**
   * 计算某天的总交通时间（分钟）
   * 使用真实的 Google Maps 数据
   */
  private async calculateDayTravelTime(attractions: AttractionWithMetrics[]): Promise<number> {
    if (attractions.length < 2) return 0;
    
    let totalTravelTime = 0;
    
    try {
      // 批量计算交通时间以提高性能
      const travelTimes = await this.calculateBatchTravelTimes(attractions);
      
      for (let i = 0; i < attractions.length - 1; i++) {
        const key = `${attractions[i].id}-${attractions[i + 1].id}`;
        const travelInfo = travelTimes.get(key);
        
        if (travelInfo) {
          totalTravelTime += travelInfo.duration;
        } else {
          // 备用计算
          const distance = this.calculateDistance(
            attractions[i].coordinates,
            attractions[i + 1].coordinates
          );
          totalTravelTime += (distance / this.DEFAULT_TRAVEL_SPEED) * 60;
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to calculate real travel time, using fallback:', error);
      
      // 完全备用计算
      for (let i = 0; i < attractions.length - 1; i++) {
        const distance = this.calculateDistance(
          attractions[i].coordinates,
          attractions[i + 1].coordinates
        );
        totalTravelTime += (distance / this.DEFAULT_TRAVEL_SPEED) * 60;
      }
    }
    
    return Math.round(totalTravelTime);
  }

  /**
   * 生成路线信息
   */
  private async generateRouteInfo(attractions: AttractionWithMetrics[]): Promise<RouteInfo[]> {
    if (attractions.length < 2) return [];
    
    const routeInfo: RouteInfo[] = [];
    
    try {
      const travelTimes = await this.calculateBatchTravelTimes(attractions);
      
      for (let i = 0; i < attractions.length - 1; i++) {
        const from = attractions[i];
        const to = attractions[i + 1];
        const key = `${from.id}-${to.id}`;
        const travelData = travelTimes.get(key);
        
        if (travelData) {
          routeInfo.push({
            from: from.name,
            to: to.name,
            duration: travelData.duration,
            distance: travelData.distance,
            travelMode: 'DRIVE', // 默认驾车
            trafficCondition: 'NORMAL' // 可以从API获取更详细信息
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to generate route info:', error);
    }
    
    return routeInfo;
  }

  /**
   * 标记某天为手动调整
   * 一旦标记，该天的景点安排将不会被自动优化改变
   */
  markDayAsManuallyAdjusted(day: number) {
    this.manuallyAdjustedDays.add(day);
  }

  /**
   * 取消某天的手动调整标记
   */
  unmarkDayAsManuallyAdjusted(day: number) {
    this.manuallyAdjustedDays.delete(day);
  }

  /**
   * 检查某天是否被手动调整
   */
  isDayManuallyAdjusted(day: number): boolean {
    return this.manuallyAdjustedDays.has(day);
  }

  /**
   * 清除所有手动调整标记
   */
  clearManualAdjustments() {
    this.manuallyAdjustedDays.clear();
  }

  /**
   * 获取所有被手动调整的天数
   */
  getManuallyAdjustedDays(): number[] {
    return Array.from(this.manuallyAdjustedDays);
  }

  /**
   * 标记景点为手动移动
   * 被标记的景点在智能排序时不会被移动
   */
  markAttractionAsManuallyMoved(attractionId: string) {
    this.manuallyMovedAttractions.add(attractionId);
    console.log(`🔒 Marked attraction ${attractionId} as manually moved`);
  }

  /**
   * 取消景点的手动移动标记
   */
  unmarkAttractionAsManuallyMoved(attractionId: string) {
    this.manuallyMovedAttractions.delete(attractionId);
    console.log(`🔓 Unmarked attraction ${attractionId} as manually moved`);
  }

  /**
   * 检查景点是否被手动移动
   */
  isAttractionManuallyMoved(attractionId: string): boolean {
    return this.manuallyMovedAttractions.has(attractionId);
  }

  /**
   * 清除所有手动移动的景点标记
   */
  clearManuallyMovedAttractions() {
    this.manuallyMovedAttractions.clear();
    console.log('🔓 Cleared all manually moved attraction marks');
  }

  /**
   * 获取所有被手动移动的景点ID
   */
  getManuallyMovedAttractions(): string[] {
    return Array.from(this.manuallyMovedAttractions);
  }
}

export const smartItineraryPlanner = new SmartItineraryPlanner();
