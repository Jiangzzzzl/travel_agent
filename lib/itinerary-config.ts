// 行程规划配置文件
// 可以根据实际需求调整这些参数

export const ItineraryConfig = {
  // 时间相关配置
  maxDailyHours: 10, // 每天最多游玩时间（小时）
  travelSpeed: 30, // 平均移动速度（公里/小时）
  breakfastTime: 60, // 早餐时间（分钟）
  lunchTime: 90, // 午餐时间（分钟）
  dinnerTime: 90, // 晚餐时间（分钟）

  // 距离相关配置
  maxDailyDistance: 50, // 每天最大移动距离（公里）
  nearbyThreshold: 5, // 认为是"附近"的距离阈值（公里）

  // 评分权重配置
  weights: {
    emptyDayBonus: 50, // 空天的基础分数
    timeWeight: 0.1, // 时间权重（每分钟剩余时间的分数）
    distanceWeight: 1, // 距离权重（每公里的分数惩罚）
    balanceWeight: 5, // 平衡权重（每个景点的分数惩罚）
  },

  // 默认值配置
  defaults: {
    estimatedDuration: 120, // 默认游览时长（分钟）
    defaultDistance: 10, // 默认距离（公里，当没有坐标时）
    defaultPriority: 3, // 默认优先级（1-5）
  },

  // 功能开关
  features: {
    smartPlanning: true, // 是否启用智能规划
    autoOptimize: true, // 添加景点时是否自动优化
    respectManualAdjustments: true, // 是否尊重手动调整
  },

  // 时间段配置
  timeSlots: {
    morning: { start: 9, end: 12 }, // 上午时段
    afternoon: { start: 13, end: 17 }, // 下午时段
    evening: { start: 18, end: 21 }, // 傍晚时段
  },

  // 景点类型配置
  attractionTypes: {
    museum: { defaultDuration: 180, emoji: '🏛️' }, // 博物馆
    park: { defaultDuration: 120, emoji: '🏞️' }, // 公园
    temple: { defaultDuration: 90, emoji: '⛩️' }, // 寺庙
    palace: { defaultDuration: 180, emoji: '🏯' }, // 宫殿
    mountain: { defaultDuration: 240, emoji: '🏔️' }, // 山景
    lake: { defaultDuration: 120, emoji: '🌊' }, // 湖景
    street: { defaultDuration: 90, emoji: '🏘️' }, // 街区
    market: { defaultDuration: 120, emoji: '🏪' }, // 市场
    restaurant: { defaultDuration: 90, emoji: '🍽️' }, // 餐厅
    shopping: { defaultDuration: 120, emoji: '🛍️' }, // 购物
  },

  // 城市配置（可以为不同城市设置不同参数）
  cityConfigs: {
    beijing: {
      maxDailyDistance: 40, // 北京交通较拥堵，减少每日距离
      travelSpeed: 25, // 降低平均速度
    },
    shanghai: {
      maxDailyDistance: 45,
      travelSpeed: 28,
    },
    default: {
      maxDailyDistance: 50,
      travelSpeed: 30,
    },
  },
};

// 获取城市特定配置
export function getCityConfig(cityName?: string) {
  if (!cityName) return ItineraryConfig.cityConfigs.default;
  
  const normalizedCity = cityName.toLowerCase();
  return (
    ItineraryConfig.cityConfigs[normalizedCity as keyof typeof ItineraryConfig.cityConfigs] ||
    ItineraryConfig.cityConfigs.default
  );
}

// 根据景点类型获取默认时长
export function getDefaultDurationByType(type?: string): number {
  if (!type) return ItineraryConfig.defaults.estimatedDuration;
  
  const normalizedType = type.toLowerCase();
  const typeConfig =
    ItineraryConfig.attractionTypes[normalizedType as keyof typeof ItineraryConfig.attractionTypes];
  
  return typeConfig?.defaultDuration || ItineraryConfig.defaults.estimatedDuration;
}

// 根据景点类型获取默认 emoji
export function getDefaultEmojiByType(type?: string): string {
  if (!type) return '📍';
  
  const normalizedType = type.toLowerCase();
  const typeConfig =
    ItineraryConfig.attractionTypes[normalizedType as keyof typeof ItineraryConfig.attractionTypes];
  
  return typeConfig?.emoji || '📍';
}

// 判断是否在某个时间段
export function isInTimeSlot(
  hour: number,
  slot: 'morning' | 'afternoon' | 'evening'
): boolean {
  const timeSlot = ItineraryConfig.timeSlots[slot];
  return hour >= timeSlot.start && hour < timeSlot.end;
}

// 计算包含用餐时间的总时长
export function calculateTotalTimeWithMeals(
  attractionDuration: number,
  includeLunch: boolean = false,
  includeDinner: boolean = false
): number {
  let total = attractionDuration;
  
  if (includeLunch) {
    total += ItineraryConfig.lunchTime;
  }
  
  if (includeDinner) {
    total += ItineraryConfig.dinnerTime;
  }
  
  return total;
}

// 导出配置的类型定义
export type ItineraryConfigType = typeof ItineraryConfig;
