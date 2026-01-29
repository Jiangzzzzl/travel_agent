import { smartItineraryPlanner, AttractionWithMetrics } from './smart-itinerary-planner';

// 行程规划状态管理
export interface ItineraryAttraction {
  id: string;
  name: string;
  location: string;
  emoji?: string;
  vibeColor?: string;
  estimatedDuration?: string; // 预计游玩时长
  suggestedTime?: string; // 建议时间段
  coordinates?: { lat: number; lng: number }; // 坐标（用于智能规划）
  priority?: number; // 优先级（1-5）
}

export interface DayPlan {
  day: number;
  attractions: ItineraryAttraction[];
  isManuallyAdjusted?: boolean; // 是否被用户手动调整过
}

class ItineraryStore {
  private totalDays: number = 3;
  private dayPlans: Map<number, ItineraryAttraction[]> = new Map();
  private listeners: (() => void)[] = [];
  private useSmartPlanning: boolean = true; // 是否启用智能规划

  constructor() {
    // 初始化天数
    this.initializeDays(3);
  }

  // 初始化天数
  initializeDays(days: number) {
    this.totalDays = days;
    this.dayPlans.clear();
    for (let i = 1; i <= days; i++) {
      this.dayPlans.set(i, []);
    }
    this.notifyListeners();
  }

  // 设置总天数
  setTotalDays(days: number) {
    const oldDays = this.totalDays;
    this.totalDays = days;
    
    // 如果增加天数，添加新的空天
    if (days > oldDays) {
      for (let i = oldDays + 1; i <= days; i++) {
        this.dayPlans.set(i, []);
      }
    }
    // 如果减少天数，将多余天数的景点移到最后一天
    else if (days < oldDays) {
      const extraAttractions: ItineraryAttraction[] = [];
      for (let i = days + 1; i <= oldDays; i++) {
        const attractions = this.dayPlans.get(i) || [];
        extraAttractions.push(...attractions);
        this.dayPlans.delete(i);
      }
      if (extraAttractions.length > 0 && days > 0) {
        const lastDay = this.dayPlans.get(days) || [];
        this.dayPlans.set(days, [...lastDay, ...extraAttractions]);
      }
    }
    
    this.notifyListeners();
  }

  // AI 智能添加景点到行程（自动分配到合适的天数）
  async addAttractionAuto(attraction: ItineraryAttraction): Promise<number> {
    if (!this.useSmartPlanning) {
      // 简单模式：找到景点数量最少的一天
      let targetDay = 1;
      let minCount = Infinity;
      
      for (let i = 1; i <= this.totalDays; i++) {
        const count = (this.dayPlans.get(i) || []).length;
        if (count < minCount) {
          minCount = count;
          targetDay = i;
        }
      }
      
      const dayAttractions = this.dayPlans.get(targetDay) || [];
      this.dayPlans.set(targetDay, [...dayAttractions, attraction]);
      this.notifyListeners();
      
      return targetDay;
    }

    // 智能规划模式：使用智能规划器
    const attractionWithMetrics: AttractionWithMetrics = {
      ...attraction,
      coordinates: attraction.coordinates,
      priority: attraction.priority || 3,
    };

    try {
      // 只添加新景点，使用智能规划器找到最佳天数
      const schedule = await smartItineraryPlanner.planItinerary(
        [attractionWithMetrics],
        this.totalDays,
        this.dayPlans
      );

      // 找到新景点被分配到的天数
      let targetDay = 1;
      for (const daySchedule of schedule) {
        if (daySchedule.attractions.some(a => a.id === attraction.id)) {
          targetDay = daySchedule.day;
          break;
        }
      }

      // 直接添加到目标天数（不重新规划现有景点）
      const dayAttractions = this.dayPlans.get(targetDay) || [];
      this.dayPlans.set(targetDay, [...dayAttractions, attraction]);

      this.notifyListeners();
      return targetDay;
    } catch (error) {
      console.error('❌ Smart planning failed, using simple mode:', error);
      
      // 降级到简单模式
      let targetDay = 1;
      let minCount = Infinity;
      
      for (let i = 1; i <= this.totalDays; i++) {
        const count = (this.dayPlans.get(i) || []).length;
        if (count < minCount) {
          minCount = count;
          targetDay = i;
        }
      }
      
      const dayAttractions = this.dayPlans.get(targetDay) || [];
      this.dayPlans.set(targetDay, [...dayAttractions, attraction]);
      this.notifyListeners();
      
      return targetDay;
    }
  }

  // 添加景点到指定天数（允许重复）
  addAttractionToDay(day: number, attraction: ItineraryAttraction) {
    if (day < 1 || day > this.totalDays) return;
    
    const dayAttractions = this.dayPlans.get(day) || [];
    // 允许重复添加同一景点
    this.dayPlans.set(day, [...dayAttractions, attraction]);
    this.notifyListeners();
  }

  // 从指定天数移除景点（通过索引，因为可能有重复）
  removeAttractionFromDay(day: number, attractionId: string, index?: number) {
    const dayAttractions = this.dayPlans.get(day) || [];
    
    if (index !== undefined) {
      // 如果指定了索引，移除特定位置的景点
      const newAttractions = [...dayAttractions];
      newAttractions.splice(index, 1);
      this.dayPlans.set(day, newAttractions);
    } else {
      // 否则移除第一个匹配的景点
      const indexToRemove = dayAttractions.findIndex(a => a.id === attractionId);
      if (indexToRemove !== -1) {
        const newAttractions = [...dayAttractions];
        newAttractions.splice(indexToRemove, 1);
        this.dayPlans.set(day, newAttractions);
      }
    }
    
    this.notifyListeners();
  }

  // 移动景点到另一天（通过索引）
  // 这是用户的手动操作，会标记被移动的景点为手动移动
  moveAttraction(attractionId: string, fromDay: number, toDay: number, fromIndex: number) {
    if (fromDay === toDay) return;
    if (toDay < 1 || toDay > this.totalDays) return;
    
    const fromAttractions = this.dayPlans.get(fromDay) || [];
    const attraction = fromAttractions[fromIndex];
    
    if (attraction) {
      console.log(`🔄 Moving attraction: ${attraction.name} (ID: ${attraction.id}) from day ${fromDay} to day ${toDay}`);
      
      // 从原来的天数移除
      const newFromAttractions = [...fromAttractions];
      newFromAttractions.splice(fromIndex, 1);
      this.dayPlans.set(fromDay, newFromAttractions);
      
      // 添加到新的天数
      const toAttractions = this.dayPlans.get(toDay) || [];
      this.dayPlans.set(toDay, [...toAttractions, attraction]);
      
      // 标记这个景点为手动移动（而不是锁定整天）
      smartItineraryPlanner.markAttractionAsManuallyMoved(attraction.id);
      
      // 验证锁定状态
      const isLocked = smartItineraryPlanner.isAttractionManuallyMoved(attraction.id);
      console.log(`🔒 Attraction ${attraction.name} lock status after move: ${isLocked}`);
      
      this.notifyListeners();
    } else {
      console.warn(`⚠️ Attraction not found at index ${fromIndex} in day ${fromDay}`);
    }
  }

  // 复制景点到另一天
  copyAttraction(attraction: ItineraryAttraction, toDay: number) {
    if (toDay < 1 || toDay > this.totalDays) return;
    
    const toAttractions = this.dayPlans.get(toDay) || [];
    // 创建新的 ID 以支持重复
    const newAttraction = {
      ...attraction,
      id: `${attraction.id}-copy-${Date.now()}`
    };
    this.dayPlans.set(toDay, [...toAttractions, newAttraction]);
    this.notifyListeners();
  }

  // 更新景点的游览时间
  updateAttractionDuration(day: number, attractionId: string, newDuration: string, index?: number) {
    const dayAttractions = this.dayPlans.get(day) || [];
    
    if (index !== undefined && index < dayAttractions.length) {
      // 如果指定了索引，更新特定位置的景点
      const newAttractions = [...dayAttractions];
      newAttractions[index] = {
        ...newAttractions[index],
        estimatedDuration: newDuration
      };
      this.dayPlans.set(day, newAttractions);
    } else {
      // 否则更新第一个匹配的景点
      const indexToUpdate = dayAttractions.findIndex(a => a.id === attractionId);
      if (indexToUpdate !== -1) {
        const newAttractions = [...dayAttractions];
        newAttractions[indexToUpdate] = {
          ...newAttractions[indexToUpdate],
          estimatedDuration: newDuration
        };
        this.dayPlans.set(day, newAttractions);
      }
    }
    
    // 不再自动标记该天为手动调整，只更新时间
    this.notifyListeners();
  }

  // 在同一天内重新排序
  // 这是用户的手动操作，会标记被移动的景点为手动移动
  reorderInDay(day: number, attractionId: string, newIndex: number) {
    const dayAttractions = this.dayPlans.get(day) || [];
    const oldIndex = dayAttractions.findIndex(a => a.id === attractionId);
    
    if (oldIndex === -1) return;
    
    const newAttractions = [...dayAttractions];
    const [removed] = newAttractions.splice(oldIndex, 1);
    newAttractions.splice(newIndex, 0, removed);
    
    this.dayPlans.set(day, newAttractions);
    
    // 标记这个景点为手动移动（而不是锁定整天）
    smartItineraryPlanner.markAttractionAsManuallyMoved(attractionId);
    
    this.notifyListeners();
  }

  // 检查景点是否在行程中（检查名称而不是 ID，因为可能有重复）
  isInItinerary(attractionName: string): boolean {
    for (let i = 1; i <= this.totalDays; i++) {
      const attractions = this.dayPlans.get(i) || [];
      if (attractions.some(a => a.name === attractionName)) {
        return true;
      }
    }
    return false;
  }

  // 获取景点所在的天数（返回第一个匹配的）
  getAttractionDay(attractionName: string): number | null {
    for (let i = 1; i <= this.totalDays; i++) {
      const attractions = this.dayPlans.get(i) || [];
      if (attractions.some(a => a.name === attractionName)) {
        return i;
      }
    }
    return null;
  }

  // 获取所有行程
  getAllDayPlans(): DayPlan[] {
    const plans: DayPlan[] = [];
    for (let i = 1; i <= this.totalDays; i++) {
      plans.push({
        day: i,
        attractions: this.dayPlans.get(i) || [],
        isManuallyAdjusted: smartItineraryPlanner.isDayManuallyAdjusted(i),
      });
    }
    return plans;
  }

  // 获取指定天的行程
  getDayPlan(day: number): ItineraryAttraction[] {
    return this.dayPlans.get(day) || [];
  }

  // 获取总天数
  getTotalDays(): number {
    return this.totalDays;
  }

  // 获取总景点数
  getTotalAttractions(): number {
    let total = 0;
    for (let i = 1; i <= this.totalDays; i++) {
      total += (this.dayPlans.get(i) || []).length;
    }
    return total;
  }

  // 清空所有行程
  clear() {
    for (let i = 1; i <= this.totalDays; i++) {
      this.dayPlans.set(i, []);
    }
    // 清空手动调整标记
    smartItineraryPlanner.clearManualAdjustments();
    this.notifyListeners();
  }

  // 启用/禁用智能规划
  setSmartPlanning(enabled: boolean) {
    this.useSmartPlanning = enabled;
  }

  // 检查是否启用智能规划
  isSmartPlanningEnabled(): boolean {
    return this.useSmartPlanning;
  }

  // 重新优化行程（重新应用智能规划，但保留手动调整的天数和手动移动的景点）
  async reoptimizeItinerary(): Promise<void> {
    if (!this.useSmartPlanning) return;

    try {
      // 收集所有需要优化的景点（排除被手动移动的景点）
      const attractionsToOptimize: AttractionWithMetrics[] = [];
      const manuallyMovedAttractions: Map<number, AttractionWithMetrics[]> = new Map();
      
      for (let i = 1; i <= this.totalDays; i++) {
        const dayAttractions = this.dayPlans.get(i) || [];
        const manualAttractions: AttractionWithMetrics[] = [];
        
        for (const attraction of dayAttractions) {
          if (smartItineraryPlanner.isAttractionManuallyMoved(attraction.id)) {
            // 保留被手动移动的景点在原位置
            manualAttractions.push(attraction);
            console.log(`🔒 Preserving manually moved attraction: ${attraction.name} in day ${i}`);
          } else if (!smartItineraryPlanner.isDayManuallyAdjusted(i)) {
            // 只有在天数未被锁定且景点未被手动移动时才加入优化列表
            attractionsToOptimize.push(attraction);
          } else {
            // 天数被锁定的景点也保留在原位置
            manualAttractions.push(attraction);
          }
        }
        
        if (manualAttractions.length > 0) {
          manuallyMovedAttractions.set(i, manualAttractions);
        }
      }

      console.log(`🔄 Optimizing ${attractionsToOptimize.length} attractions, preserving ${Array.from(manuallyMovedAttractions.values()).flat().length} manual attractions`);

      // 如果没有需要优化的景点，直接返回
      if (attractionsToOptimize.length === 0) {
        console.log('✅ No attractions to optimize');
        return;
      }

      // 先清空未锁定的天数，但保留手动移动的景点
      for (let i = 1; i <= this.totalDays; i++) {
        if (!smartItineraryPlanner.isDayManuallyAdjusted(i)) {
          this.dayPlans.set(i, manuallyMovedAttractions.get(i) || []);
        }
      }

      // 执行智能规划（只规划未锁定的景点）
      const schedule = await smartItineraryPlanner.planItinerary(
        attractionsToOptimize,
        this.totalDays,
        this.dayPlans
      );

      // 更新行程（只更新未被手动调整的天数，并合并手动移动的景点）
      for (const daySchedule of schedule) {
        if (!daySchedule.isManuallyAdjusted) {
          const manualAttractions = manuallyMovedAttractions.get(daySchedule.day) || [];
          const optimizedAttractions = daySchedule.attractions.filter(attr => 
            !smartItineraryPlanner.isAttractionManuallyMoved(attr.id)
          );
          
          // 合并手动移动的景点和优化后的景点
          this.dayPlans.set(daySchedule.day, [...manualAttractions, ...optimizedAttractions]);
        }
      }

      this.notifyListeners();
    } catch (error) {
      console.error('❌ Reoptimization failed:', error);
    }
  }

  // 取消某天的手动调整标记（允许该天重新被智能规划）
  unlockDay(day: number) {
    smartItineraryPlanner.unmarkDayAsManuallyAdjusted(day);
    this.notifyListeners();
  }

  // 获取所有被手动调整的天数
  getManuallyAdjustedDays(): number[] {
    return smartItineraryPlanner.getManuallyAdjustedDays();
  }

  // 取消景点的手动移动标记（允许该景点重新被智能规划）
  unlockAttraction(attractionId: string) {
    console.log(`🔓 Unlocking attraction: ${attractionId}`);
    smartItineraryPlanner.unmarkAttractionAsManuallyMoved(attractionId);
    this.notifyListeners();
    console.log(`🔓 Attraction unlocked, remaining locked: ${smartItineraryPlanner.getManuallyMovedAttractions().join(', ')}`);
  }

  // 获取所有被手动移动的景点
  getManuallyMovedAttractions(): string[] {
    return smartItineraryPlanner.getManuallyMovedAttractions();
  }

  // 清除所有手动移动的景点标记
  clearAllManuallyMovedAttractions() {
    console.log(`🔓 Clearing all manually moved attractions. Current count: ${smartItineraryPlanner.getManuallyMovedAttractions().length}`);
    smartItineraryPlanner.clearManuallyMovedAttractions();
    this.notifyListeners();
    console.log(`🔓 All attractions unlocked, remaining count: ${smartItineraryPlanner.getManuallyMovedAttractions().length}`);
  }

  // 订阅状态变化
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const itineraryStore = new ItineraryStore();
