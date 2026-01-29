# Components 目录说明

这个目录包含所有可复用的 React 组件，按功能和用途进行分类组织。

## 文件结构

### 核心组件
- **`chat-message.tsx`** - 聊天消息组件，显示用户和 AI 的对话内容
- **`dynamic-background.tsx`** - 动态背景组件，提供视觉效果和动画
- **`markdown-content.tsx`** - Markdown 内容渲染组件，支持富文本显示
- **`itinerary-timeline-panel.tsx`** - 行程时间线面板，展示详细的旅行计划
- **`saved-attractions-panel.tsx`** - 保存的景点面板，管理用户收藏的景点
- **`saved-attractions-summary.tsx`** - 景点摘要组件，显示景点统计信息

### 旅行相关组件 (`travel/`)
- **`activity-showcase.tsx`** - 活动展示组件，展示旅行活动和体验
- **`attraction-card.tsx`** - 景点卡片组件，显示单个景点信息
- **`attraction-grid.tsx`** - 景点网格组件，以网格形式展示多个景点
- **`destination-hero.tsx`** - 目的地英雄组件，展示目的地的主要信息和视觉效果
- **`enhanced-attraction-card.tsx`** - 增强版景点卡片，包含更多交互功能
- **`info-card.tsx`** - 信息卡片组件，显示旅行提示和建议
- **`itinerary-card.tsx`** - 行程卡片组件，展示行程安排
- **`map-component.tsx`** - 地图组件，显示地理位置和路线
- **`quote-card.tsx`** - 引用卡片组件，显示名言或用户评价
- **`route-card.tsx`** - 路线卡片组件，展示旅行路线信息
- **`route-map.tsx`** - 路线地图组件，可视化显示旅行路线
- **`stat-card.tsx`** - 统计卡片组件，显示数据统计信息
- **`weather-widget.tsx`** - 天气小部件，显示目的地天气信息

### 规划工具组件 (`planner/`)
- **`draggable-attraction-card.tsx`** - 可拖拽景点卡片，支持行程规划中的拖拽操作

### UI 基础组件 (`ui/`)
包含基础的 UI 组件库（如按钮、输入框、对话框等）

## 设计原则

1. **组件化设计** - 每个组件职责单一，可复用性强
2. **响应式布局** - 所有组件都支持移动端和桌面端
3. **主题一致性** - 统一的颜色系统和视觉风格
4. **交互友好** - 丰富的动画效果和用户反馈
5. **类型安全** - 完整的 TypeScript 类型定义

## 使用方式

```tsx
import { AttractionCard } from '@/components/travel/attraction-card';
import { DestinationHero } from '@/components/travel/destination-hero';

// 在页面或其他组件中使用
<DestinationHero destination="Paris" />
<AttractionCard name="Eiffel Tower" />
```