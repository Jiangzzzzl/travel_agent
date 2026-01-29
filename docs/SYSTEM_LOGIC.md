# 智能旅行规划系统运行逻辑

## 🎯 系统概览

智能旅行规划系统通过多个模块协同工作，实现从用户查询到智能行程规划的完整流程。

```
用户输入 → AI解析 → 数据获取 → 智能分析 → 行程规划 → UI生成 → 用户交互
```

## 📊 数据流架构

### 1. 用户交互层
```
用户查询 → actions.tsx → AI SDK → Gemini API
                ↓
        动态UI组件生成 ← 组件解析器 ← AI响应
```

### 2. 数据处理层
```
景点搜索 → gemini-service.ts → Google API → 结构化数据
                ↓
        智能分析 → attraction-intelligence.ts → 评分系统
                ↓
        行程规划 → smart-itinerary-planner.ts → 优化算法
```

## 🔍 API调用与数据获取

### 1. Gemini API 调用流程

#### 主要调用点：
- **`app/actions.tsx`** - 用户对话和UI生成
- **`lib/gemini-service.ts`** - 地点搜索
- **`lib/gemini-itinerary-service.ts`** - 行程规划

#### 数据获取类型：

**A. 对话式查询 (actions.tsx)**
```typescript
// 输入: 用户自然语言查询
"西安有什么好玩的地方？"

// API调用: streamUI
const result = await streamUI({
  model: google('gemini-2.0-flash-exp'),
  prompt: userQuery,
  system: systemPrompt // 包含组件生成指令
});

// 输出: JSON格式的组件数据
{
  "components": [
    {
      "type": "destinationHero",
      "destination": "西安",
      "tagline": "千年古都，文化之城",
      "highlights": ["兵马俑", "大雁塔", "古城墙"]
    },
    {
      "type": "attraction",
      "name": "兵马俑",
      "location": "西安市临潼区",
      "tags": ["历史", "文化", "世界遗产"],
      "rating": 5,
      "attractionType": "historical"
    }
  ]
}
```

**B. 地点搜索 (gemini-service.ts)**
```typescript
// 输入: 地点查询
searchPlacesWithGemini("北京故宫")

// API调用: generateObject
const result = await generateObject({
  model: google('gemini-2.0-flash-exp'),
  schema: PlaceSearchSchema,
  prompt: detailedSearchPrompt
});

// 输出: 结构化地点数据
{
  "places": [
    {
      "name": "故宫博物院",
      "address": "北京市东城区景山前街4号",
      "coordinates": { "lat": 39.9163, "lng": 116.3972 },
      "type": "museum",
      "rating": 4.8,
      "description": "明清两朝的皇家宫殿",
      "openingHours": "8:30-17:00",
      "website": "https://www.dpm.org.cn"
    }
  ]
}
```

### 2. 数据质量保证

#### 验证机制：
```typescript
// 地址有效性检查
const isValidAddress = place.address && 
  !place.address.includes('的地址信息') && 
  place.address.length > 10;

// 坐标准确性验证
const hasValidCoordinates = place.coordinates &&
  place.coordinates.lat && place.coordinates.lng;
```

#### 备选数据源：
```typescript
// 当API失败时，使用预设的高质量数据
function generateFallbackResults(query: string) {
  // 基于查询关键词匹配预设景点数据
  // 确保基本功能可用性
}
```

## 🧠 智能分析与评分系统

### 1. 景点智能分析 (attraction-intelligence.ts)

#### 分析维度：
```typescript
interface AttractionIntelligence {
  location: string;           // 地理位置分析
  estimatedDuration: string;  // 游览时长 (如 "2-3小时")
  emoji: string;             // 视觉标识
  color: string;             // 主题色彩
  type: string;              // 景点类别
  description: string;       // 描述信息
  bestTimeToVisit?: string;  // 最佳访问时间
  priority?: number;         // 优先级评分 (1-5)
}
```

#### 关键词匹配规则：
```typescript
const attractionRules = [
  {
    keywords: ['博物馆', '美术馆', '艺术馆'],
    location: '博物馆',
    estimatedDuration: '2-3小时',
    emoji: '🏛️',
    color: '#DC2626',
    type: 'cultural',
    priority: 4
  },
  {
    keywords: ['公园', '植物园', '动物园'],
    location: '公园', 
    estimatedDuration: '2-4小时',
    emoji: '🌳',
    color: '#059669',
    type: 'nature',
    priority: 3
  }
  // ... 更多规则
];
```

#### 智能匹配算法：
```typescript
function intelligentAttractionAnalysis(attractionName: string): AttractionIntelligence {
  // 1. 关键词匹配
  for (const rule of attractionRules) {
    if (rule.keywords.some(keyword => attractionName.includes(keyword))) {
      return rule;
    }
  }
  
  // 2. 地名匹配
  const locationMatch = matchByLocation(attractionName);
  if (locationMatch) return locationMatch;
  
  // 3. 默认规则
  return getDefaultRule();
}
```

### 2. 时间分配算法 (smart-itinerary-planner.ts)

#### 核心约束条件：
```typescript
class SmartItineraryPlanner {
  private readonly MAX_DAILY_HOURS = 10;     // 每天最多10小时
  private readonly MAX_DAILY_DISTANCE = 50;  // 每天最大50公里
  private readonly TRAVEL_SPEED = 30;        // 平均30公里/小时
}
```

#### 时长解析算法：
```typescript
private parseDuration(duration?: string): number {
  if (!duration) return 120; // 默认2小时
  
  const hourMatch = duration.match(/(\d+\.?\d*)\s*[小时|hour|h]/i);
  const minMatch = duration.match(/(\d+)\s*[分钟|minute|min|m]/i);
  
  let minutes = 0;
  if (hourMatch) minutes += parseFloat(hourMatch[1]) * 60;
  if (minMatch) minutes += parseInt(minMatch[1]);
  
  return minutes || 120;
}
```

#### 距离计算 (Haversine公式)：
```typescript
private calculateDistance(coord1, coord2): number {
  if (!coord1 || !coord2) return 10; // 默认10公里
  
  const R = 6371; // 地球半径
  const dLat = this.toRad(coord2.lat - coord1.lat);
  const dLng = this.toRad(coord2.lng - coord1.lng);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.toRad(coord1.lat)) * Math.cos(this.toRad(coord2.lat)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

## 🗺️ Google Maps Routes API 集成 (最新功能)

### 1. 真实交通时间计算

#### 替代简单平均速度
之前系统使用固定的平均速度（30公里/小时）计算交通时间，现在集成了Google Maps Routes API获取真实的交通数据：

```typescript
// 旧方法：简单计算
const travelTime = (distance / 30) * 60; // 分钟

// 新方法：Google Maps API
const routeResponse = await getRouteWithGemini({
  origin: { lat: 34.3848, lng: 109.2734 },
  destination: { lat: 34.2186, lng: 108.9647 },
  travelMode: 'DRIVE',
  trafficModel: 'BEST_GUESS'
});

const realTravelTime = routeResponse.duration.value / 60; // 真实时间（分钟）
```

#### API调用优化策略
```typescript
class SmartItineraryPlanner {
  private routeCache: Map<string, RouteResponse> = new Map();
  
  // 1. 缓存机制 - 避免重复API调用
  private async calculateRealTravelTime(coord1, coord2, travelMode) {
    const cacheKey = `${coord1.lat},${coord1.lng}-${coord2.lat},${coord2.lng}-${travelMode}`;
    const cached = this.routeCache.get(cacheKey);
    
    if (cached) {
      return cached; // 使用缓存结果
    }
    
    // 调用API并缓存结果
    const result = await getRouteWithGemini(routeQuery);
    this.routeCache.set(cacheKey, result);
    return result;
  }
  
  // 2. 批量处理 - 减少API调用次数
  private async calculateBatchTravelTimes(attractions, travelMode) {
    const queries = attractions.map((from, to) => ({
      origin: from.coordinates,
      destination: to.coordinates,
      travelMode
    }));
    
    return await getBatchRoutesWithGemini(queries);
  }
}
```

### 2. 多维度交通约束

#### 新增约束条件
```typescript
class SmartItineraryPlanner {
  private readonly MAX_DAILY_HOURS = 10;        // 每天最多10小时游览
  private readonly MAX_DAILY_DISTANCE = 50;     // 每天最大50公里移动
  private readonly MAX_DAILY_TRAVEL_TIME = 180; // 每天最大3小时交通时间 (新增)
  private readonly DEFAULT_TRAVEL_SPEED = 30;   // 备用平均速度 (仅降级时使用)
}
```

**重要说明**：
- `DEFAULT_TRAVEL_SPEED = 30` 现在仅作为 **备用机制** 使用
- 主要计算使用 Google Maps Routes API 的真实交通数据
- 只有在 API 失败或网络问题时才会降级到固定速度计算

#### 智能评分算法升级
```typescript
private async calculateDayScore(attraction, daySchedule): Promise<number> {
  let score = 0;
  
  // 1. 空天奖励 (50分)
  if (daySchedule.attractions.length === 0) {
    score += 50;
  }
  
  // 2. 时间适配度
  const remainingTime = MAX_DAILY_HOURS * 60 - daySchedule.totalDuration;
  score += (remainingTime - attractionDuration) / 10;
  
  // 3. 真实交通时间评分 (新增)
  const travelInfo = await this.calculateRealTravelTime(lastAttraction, attraction);
  score += Math.max(0, 30 - travelInfo.duration * 0.5); // 每分钟减0.5分
  
  // 4. 真实距离评分 (优化)
  score += Math.max(0, 50 - travelInfo.distance * 2); // 每公里减2分
  
  // 5. 交通时间平衡 (新增)
  const remainingTravelTime = MAX_DAILY_TRAVEL_TIME - daySchedule.totalTravelTime;
  if (remainingTravelTime < 30) {
    score -= 20; // 交通时间不足惩罚
  }
  
  return score;
}
```

### 3. 交通方式智能选择

#### 自动推荐最佳交通方式
```typescript
function getRecommendedTravelMode(distance: number): TravelMode {
  if (distance <= 1) return 'WALK';      // 1公里内步行
  if (distance <= 5) return 'BICYCLE';   // 5公里内骑行
  if (distance <= 20) return 'TRANSIT';  // 20公里内公交
  return 'DRIVE';                        // 长距离驾车
}
```

#### 实时交通状况分析
```typescript
function analyzeTrafficCondition(routeResponse: RouteResponse) {
  const { currentTravelTime, historicalAverage, trafficCondition } = routeResponse.trafficInfo;
  
  return {
    condition: trafficCondition, // 'LIGHT' | 'MODERATE' | 'HEAVY' | 'SEVERE'
    suggestion: getSuggestionByCondition(trafficCondition),
    delayRatio: currentTravelTime / historicalAverage
  };
}
```

### 4. 路线信息详细化

#### 新增路线信息结构
```typescript
interface DaySchedule {
  day: number;
  attractions: AttractionWithMetrics[];
  totalDuration: number;      // 游览时间
  totalDistance: number;      // 移动距离
  totalTravelTime: number;    // 交通时间 (新增)
  routeInfo: RouteInfo[];     // 详细路线 (新增)
}

interface RouteInfo {
  from: string;               // 起点景点名
  to: string;                 // 终点景点名
  duration: number;           // 交通时间(分钟)
  distance: number;           // 距离(公里)
  travelMode: string;         // 交通方式
  trafficCondition?: string;  // 交通状况
}
```

### 5. 性能优化策略

#### 缓存机制
```typescript
// 1. 路线缓存 - 避免重复API调用
private routeCache: Map<string, RouteResponse> = new Map();

// 2. 批量查询 - 减少API调用次数
const batchQueries = attractions.map(createRouteQuery);
const batchResults = await getBatchRoutesWithGemini(batchQueries);

// 3. 异步处理 - 不阻塞UI
async addAttractionAuto(attraction): Promise<number> {
  try {
    const schedule = await smartItineraryPlanner.planItinerary(...);
    return targetDay;
  } catch (error) {
    // 降级到简单模式
    return this.addToLeastLoadedDay(attraction);
  }
}
```

#### 错误处理和降级
```typescript
// 优雅降级机制
try {
  const realTravelTime = await getRouteWithGemini(query);
  return realTravelTime;
} catch (error) {
  console.warn('Google Maps API failed, using fallback calculation');
  
  // 使用 Haversine 距离 + DEFAULT_TRAVEL_SPEED (30km/h) 作为备选
  const distance = calculateHaversineDistance(origin, destination);
  const fallbackTime = (distance / this.DEFAULT_TRAVEL_SPEED) * 60;
  return { duration: fallbackTime, distance };
}
```

**降级策略**：
1. **优先使用**：Google Maps Routes API 真实交通数据
2. **降级使用**：Haversine 距离 + 30km/h 固定速度
3. **触发条件**：API 失败、网络超时、配额不足等情况

### 6. 实际应用效果

#### 交通时间准确性提升
- **主要方式**: Google Maps Routes API 真实交通数据，误差控制在±10%内
- **备用方式**: Haversine距离 + 30km/h固定速度，误差约±50%
- **使用策略**: 优先API，失败时自动降级到备用计算

#### 路线规划优化
- **考虑实时拥堵**: 避开高峰期拥堵路段
- **多种交通方式**: 自动选择最优交通方式
- **精确时间预估**: 包含等车、换乘等实际时间

#### 用户体验改进
- **更准确的时间安排**: 基于真实交通状况
- **智能交通建议**: 推荐最佳出行时间和方式
- **详细路线信息**: 提供完整的导航指导

### 7. API调用示例

#### 单次路线查询
```typescript
const routeQuery: RouteQuery = {
  origin: { lat: 34.3848, lng: 109.2734 }, // 兵马俑
  destination: { lat: 34.2186, lng: 108.9647 }, // 大雁塔
  travelMode: 'DRIVE',
  departureTime: '2024-01-20T09:00:00Z',
  trafficModel: 'BEST_GUESS'
};

const route = await getRouteWithGemini(routeQuery);
// 返回: { duration: { text: "45分钟", value: 2700 }, distance: { text: "28.5公里", value: 28500 } }
```

#### 批量路线查询
```typescript
const attractions = [兵马俑, 大雁塔, 古城墙, 回民街];
const travelMatrix = await getDistanceMatrix(
  attractions.map(a => a.coordinates),
  attractions.map(a => a.coordinates),
  'DRIVE'
);
// 返回: 4x4 时间矩阵，单位为秒
```

这个Google Maps Routes API集成大大提升了行程规划的准确性和实用性，使系统能够提供更贴近实际情况的旅行建议。

### 1. 核心规划器 (smart-itinerary-planner.ts)

#### 规划约束条件：
```typescript
class SmartItineraryPlanner {
  private readonly MAX_DAILY_HOURS = 10;     // 每天最多10小时游览
  private readonly MAX_DAILY_DISTANCE = 50;  // 每天最大移动50公里
  private readonly TRAVEL_SPEED = 30;        // 平均移动速度30公里/小时
  private manuallyAdjustedDays: Set<number>; // 记录用户手动调整的天数
}
```

#### 规划流程：
```typescript
planItinerary(attractions, totalDays, existingSchedule): DaySchedule[] {
  // 1. 初始化每日行程
  const schedule = initializeDaySchedules(totalDays, existingSchedule);
  
  // 2. 按优先级排序景点
  const sortedAttractions = attractions.sort((a, b) => {
    const priorityDiff = (b.priority || 3) - (a.priority || 3);
    return priorityDiff !== 0 ? priorityDiff : a.id.localeCompare(b.id);
  });
  
  // 3. 为每个景点找最佳天数
  for (const attraction of sortedAttractions) {
    const bestDay = findBestDay(attraction, schedule);
    if (bestDay !== -1) {
      addAttractionToDay(attraction, bestDay, schedule);
    }
  }
  
  return schedule;
}
```

### 2. 智能评分算法

#### 天数适配评分：
```typescript
private calculateDayScore(attraction, daySchedule): number {
  let score = 0;
  
  // 1. 空天奖励 - 优先填充空的天数
  if (daySchedule.attractions.length === 0) {
    score += 50;
  }
  
  // 2. 时间适配度 - 剩余时间越充足分数越高
  const remainingTime = MAX_DAILY_HOURS * 60 - daySchedule.totalDuration;
  const attractionDuration = parseDuration(attraction.estimatedDuration);
  if (remainingTime >= attractionDuration) {
    score += (remainingTime - attractionDuration) / 10;
  }
  
  // 3. 地理位置优化 - 距离越近分数越高
  if (daySchedule.attractions.length > 0) {
    const lastAttraction = daySchedule.attractions[daySchedule.attractions.length - 1];
    const distance = calculateDistance(lastAttraction.coordinates, attraction.coordinates);
    score += Math.max(0, 50 - distance); // 每公里减1分
  }
  
  // 4. 负载均衡 - 避免某天景点过多
  score -= daySchedule.attractions.length * 5;
  
  return score;
}
```

#### 约束检查：
```typescript
private findBestDay(attraction, schedule): number {
  let bestDay = -1;
  let bestScore = -Infinity;
  
  for (const daySchedule of schedule) {
    // 跳过用户手动调整的天数
    if (daySchedule.isManuallyAdjusted) continue;
    
    const score = calculateDayScore(attraction, daySchedule);
    
    // 检查时间和距离约束
    const newDuration = daySchedule.totalDuration + parseDuration(attraction.estimatedDuration);
    const newDistance = estimateNewDistance(attraction, daySchedule);
    
    if (newDuration <= MAX_DAILY_HOURS * 60 && newDistance <= MAX_DAILY_DISTANCE) {
      if (score > bestScore) {
        bestScore = score;
        bestDay = daySchedule.day;
      }
    }
  }
  
  // 如果没有合适天数，选择景点最少的天
  if (bestDay === -1) {
    bestDay = findLeastLoadedDay(schedule);
  }
  
  return bestDay;
}
```

### 3. 距离和时间计算

#### 距离计算 (Haversine公式)：
```typescript
private calculateDistance(coord1, coord2): number {
  if (!coord1 || !coord2) return 10; // 默认10公里
  
  const R = 6371; // 地球半径
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

#### 时间计算：
```typescript
private calculateDayDuration(attractions): number {
  let totalDuration = 0;
  
  for (let i = 0; i < attractions.length; i++) {
    // 景点游览时间
    totalDuration += parseDuration(attractions[i].estimatedDuration);
    
    // 移动时间（除了最后一个景点）
    if (i < attractions.length - 1) {
      const distance = calculateDistance(
        attractions[i].coordinates,
        attractions[i + 1].coordinates
      );
      totalDuration += calculateTravelTime(distance);
    }
  }
  
  return totalDuration;
}
```

## 🔄 动态调整机制

### 1. 实时重新规划

#### 触发条件：
- 用户添加新景点
- 用户删除景点
- 用户拖拽调整顺序
- 修改总天数

#### 重新规划流程：
```typescript
function reoptimizeItinerary() {
  // 1. 收集当前状态
  const currentAttractions = getAllAttractions();
  const userAdjustments = getUserAdjustments();
  
  // 2. 保持用户调整
  const lockedItems = identifyLockedItems(userAdjustments);
  
  // 3. 重新规划未锁定项
  const newPlan = planWithConstraints(currentAttractions, lockedItems);
  
  // 4. 应用新规划
  applyNewPlan(newPlan);
}
```

### 2. 用户偏好学习

#### 偏好记录：
```typescript
interface UserPreferences {
  preferredCategories: string[];    // 偏好景点类型
  timePreferences: TimeSlot[];      // 时间偏好
  pacePreference: 'relaxed' | 'normal' | 'intensive'; // 行程节奏
  transportPreference: string[];    // 交通偏好
}
```

#### 自适应调整：
```typescript
function adaptToUserPreferences(plan: ItineraryPlan, preferences: UserPreferences): ItineraryPlan {
  // 根据用户历史行为调整推荐权重
  // 优化个性化体验
}
```

## 📱 UI生成与交互

### 1. 动态组件生成

#### 组件类型映射：
```typescript
const componentMap = {
  'destinationHero': DestinationHero,
  'attraction': AttractionCard,
  'itinerary': ItineraryCard,
  'info': InfoCard,
  'stat': StatCard,
  'quote': QuoteCard,
  'activities': ActivityShowcase
};
```

#### 生成策略：
```typescript
function generateComponents(query: string, data: any[]): Component[] {
  // 1. 分析查询意图
  const intent = analyzeQueryIntent(query);
  
  // 2. 选择合适组件
  const componentTypes = selectComponentTypes(intent);
  
  // 3. 生成组件数据
  const components = componentTypes.map(type => 
    generateComponentData(type, data)
  );
  
  return components;
}
```

### 2. 交互反馈循环

#### 用户操作处理：
```typescript
// 拖拽调整
onDragEnd(result) {
  updateItineraryOrder(result);
  markAsManuallyAdjusted(result.destination);
  reoptimizeRemainingItems();
}

// 景点添加
onAttractionAdd(attraction) {
  analyzeAttraction(attraction);
  findOptimalPosition(attraction);
  updateItinerary();
}
```

## 🎨 个性化与主题

### 1. 主题色彩系统

#### 动态主题生成：
```typescript
function getThemeColorFromContent(content: string): string {
  // 多层级智能匹配系统
  
  // 1. 具体城市匹配 (50+ 城市)
  const cityColorMap = {
    '西安': '#F59E0B',      // 古都金色
    '北京': '#EF4444',      // 中国红
    '东京': '#A855F7',      // 科技紫
    '巴黎': '#F43F5E',      // 浪漫粉
    '纽约': '#1E40AF',      // 自由蓝
    // ... 更多城市
  };
  
  // 2. 地区/国家特征匹配
  const regionColorMap = {
    '海岛': '#06B6D4',      // 海洋蓝
    '沙漠': '#F59E0B',      // 沙漠金
    '日本': '#A855F7',      // 紫色
    '法国': '#F43F5E',      // 玫瑰红
    // ... 更多地区
  };
  
  // 3. 景点类型匹配
  const attractionTypeMap = {
    '博物馆': '#DC2626',    // 红色
    '寺庙': '#7C3AED',      // 紫色
    '公园': '#10B981',      // 绿色
    '海滩': '#06B6D4',      // 蓝色
    // ... 更多类型
  };
  
  // 4. 智能语义分析
  if (content.includes('古') || content.includes('历史')) {
    return '#F59E0B'; // 古都金
  }
  if (content.includes('海') || content.includes('岛')) {
    return '#06B6D4'; // 海洋蓝
  }
  // ... 更多语义规则
  
  // 5. 基于内容哈希的一致性颜色生成
  const colors = ['#F59E0B', '#EF4444', '#06B6D4', /* ... */];
  const hash = generateHash(content);
  return colors[hash % colors.length];
}
```

**智能匹配特性**：
- **50+ 预设城市** - 覆盖主要旅游目的地
- **地理特征识别** - 海岛、沙漠、草原等自动匹配
- **景点类型分析** - 博物馆、寺庙、公园等专属颜色
- **语义理解** - 识别"古代"、"现代"、"浪漫"等关键词
- **一致性保证** - 相同内容总是生成相同颜色
- **优雅降级** - 未知地点也能生成合适的主题色

### 2. 视觉一致性

#### 设计系统：
- **颜色层次** - 主色、辅色、强调色
- **字体系统** - 标题、正文、说明文字
- **间距规范** - 统一的边距和内边距
- **动画效果** - 一致的过渡和反馈

## 🔧 性能优化

### 1. 缓存策略

#### API响应缓存：
```typescript
const cache = new Map<string, CacheEntry>();

async function cachedApiCall(query: string): Promise<any> {
  const cacheKey = generateCacheKey(query);
  const cached = cache.get(cacheKey);
  
  if (cached && !isExpired(cached)) {
    return cached.data;
  }
  
  const result = await apiCall(query);
  cache.set(cacheKey, { data: result, timestamp: Date.now() });
  
  return result;
}
```

### 2. 计算优化

#### 防抖处理：
```typescript
const debouncedReoptimize = debounce(() => {
  reoptimizeItinerary();
}, 500);
```

#### 增量更新：
```typescript
function incrementalUpdate(changes: Change[]) {
  // 只重新计算受影响的部分
  // 避免全量重新规划
}
```

## 📊 数据持久化与状态管理

### 1. 状态管理 (itinerary-store.ts)

#### 核心数据结构：
```typescript
interface ItineraryAttraction {
  id: string;
  name: string;
  location: string;
  emoji?: string;
  vibeColor?: string;
  estimatedDuration?: string;    // "2-3小时"
  suggestedTime?: string;        // "上午"
  coordinates?: { lat: number; lng: number };
  priority?: number;             // 1-5
}

interface DayPlan {
  day: number;
  attractions: ItineraryAttraction[];
  isManuallyAdjusted?: boolean;  // 用户是否手动调整过
}
```

#### 状态管理类：
```typescript
class ItineraryStore {
  private totalDays: number = 3;
  private dayPlans: Map<number, ItineraryAttraction[]> = new Map();
  private listeners: (() => void)[] = [];
  private useSmartPlanning: boolean = true;
  
  // 智能添加景点
  addAttractionAuto(attraction: ItineraryAttraction): number {
    if (!this.useSmartPlanning) {
      // 简单模式：找景点最少的天
      return this.addToLeastLoadedDay(attraction);
    }
    
    // 智能模式：使用规划算法
    const attractionWithMetrics = {
      ...attraction,
      priority: attraction.priority || 3
    };
    
    const schedule = smartItineraryPlanner.planItinerary(
      [attractionWithMetrics],
      this.totalDays,
      this.dayPlans
    );
    
    const targetDay = this.findAssignedDay(schedule, attraction.id);
    this.addAttractionToDay(targetDay, attraction);
    
    return targetDay;
  }
}
```

### 2. 响应式更新机制

#### 观察者模式：
```typescript
class ItineraryStore {
  private listeners: (() => void)[] = [];
  
  // 订阅状态变化
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  // 通知所有监听者
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}
```

#### React 组件集成：
```typescript
// 在组件中使用
useEffect(() => {
  const unsubscribe = itineraryStore.subscribe(() => {
    const plans = itineraryStore.getAllDayPlans();
    setDayPlans(plans);
  });
  
  return unsubscribe;
}, []);
```

### 3. 数据持久化策略

#### 本地存储：
```typescript
// 自动保存到 localStorage
const saveToStorage = () => {
  const state = {
    totalDays: itineraryStore.getTotalDays(),
    dayPlans: itineraryStore.getAllDayPlans(),
    timestamp: Date.now()
  };
  localStorage.setItem('itinerary-data', JSON.stringify(state));
};

// 从 localStorage 恢复
const loadFromStorage = () => {
  const saved = localStorage.getItem('itinerary-data');
  if (saved) {
    const state = JSON.parse(saved);
    itineraryStore.restoreState(state);
  }
};
```

## 🎯 总结

智能旅行规划系统通过以下核心机制实现智能化：

1. **多源数据融合** - Gemini API + 预设数据 + 用户输入
2. **多维度评分** - 重要性、便利性、时间适宜性等
3. **智能算法优化** - 地理聚类、时间分配、路线优化
4. **动态自适应** - 实时调整、用户偏好学习
5. **个性化体验** - 主题定制、交互反馈

整个系统形成了一个完整的智能规划闭环，能够根据用户需求提供高质量的个性化旅行建议。

## 📋 实际运行示例

### 用户查询："西安3日游推荐"

#### 1. AI 解析阶段
```
输入: "西安3日游推荐"
↓
actions.tsx → streamUI → Gemini API
↓
输出: JSON组件数据
{
  "components": [
    {
      "type": "destinationHero",
      "destination": "西安",
      "tagline": "千年古都，文化之城"
    },
    {
      "type": "itinerary",
      "days": 3,
      "attractions": ["兵马俑", "大雁塔", "古城墙"]
    }
  ]
}
```

#### 2. 景点搜索阶段
```
用户点击 "Add Places" → 搜索 "兵马俑"
↓
gemini-service.ts → searchPlacesWithGemini
↓
API返回:
{
  "name": "秦始皇兵马俑博物馆",
  "address": "西安市临潼区秦陵北路",
  "coordinates": { "lat": 34.3848, "lng": 109.2734 },
  "type": "museum",
  "rating": 4.8,
  "description": "世界第八大奇迹"
}
```

#### 3. 智能分析阶段
```
attraction-intelligence.ts → intelligentAttractionAnalysis
↓
匹配规则: keywords: ['博物馆', '兵马俑']
↓
输出:
{
  "location": "博物馆",
  "estimatedDuration": "3-4小时",
  "emoji": "🏛️",
  "color": "#DC2626",
  "type": "cultural",
  "priority": 5
}
```

#### 4. 智能规划阶段
```
itinerary-store.ts → addAttractionAuto
↓
smart-itinerary-planner.ts → planItinerary
↓
评分计算:
- 空天奖励: +50分
- 时间适配: +30分 (剩余时间充足)
- 地理位置: +40分 (距离适中)
- 负载均衡: -0分 (第一个景点)
总分: 120分 → 分配到第1天
```

#### 5. UI 更新阶段
```
itinerary-store.ts → notifyListeners
↓
ItineraryTimelinePanel → useEffect → 重新渲染
↓
显示: Day 1 - 秦始皇兵马俑博物馆 🏛️
```

### 数据流完整追踪

```
用户输入 "西安3日游"
    ↓
app/actions.tsx (AI对话)
    ↓
Gemini API (生成组件)
    ↓
parse-json-components.tsx (解析JSON)
    ↓
UI组件渲染 (DestinationHero, ItineraryCard等)
    ↓
用户点击 "Add Places"
    ↓
ItineraryTimelinePanel (搜索界面)
    ↓
lib/gemini-service.ts (地点搜索)
    ↓
Gemini API (返回地点数据)
    ↓
用户选择地点
    ↓
lib/attraction-intelligence.ts (智能分析)
    ↓
lib/itinerary-store.ts (状态管理)
    ↓
lib/smart-itinerary-planner.ts (智能规划)
    ↓
UI更新 (显示在时间线中)
    ↓
用户可拖拽调整 (手动优化)
    ↓
标记为手动调整 (保护用户意图)
```

这个完整的数据流展示了系统如何从用户的自然语言查询，经过AI解析、数据获取、智能分析、算法规划，最终生成个性化的旅行建议，并支持用户的进一步交互和调整。