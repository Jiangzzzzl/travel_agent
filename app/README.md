# App 目录说明

这是 Next.js 16 的 App Router 目录，包含应用的页面、API 路由和全局配置。集成了 Google Gemini API 和 Google Maps Routes API 的智能旅行规划功能。

## 文件结构

### 核心文件
- **`layout.tsx`** - 根布局组件，定义全局 HTML 结构、字体、样式和元数据
- **`page.tsx`** - 首页组件，应用的主入口页面，包含 AI 对话界面
- **`globals.css`** - 全局 CSS 样式文件，包含 Tailwind CSS 基础样式和自定义样式
- **`actions.tsx`** - 服务器端操作，包含 AI 聊天功能、代理配置和动态 UI 生成

### 页面目录
- **`planning/`** - 旅行规划页面目录
  - `page.tsx` - 旅行规划主页面，提供交互式旅行规划界面和行程管理

### API 路由
- **`api/`** - API 路由目录
  - `chat/` - 聊天相关 API 端点
  - `gemini-search/` - Gemini 搜索服务 API 端点
  - `test-gemini/` - Gemini API 测试端点

## 主要功能

### 🤖 AI 驱动的旅行规划
- 使用 Google Gemini 2.0 Flash 生成个性化旅行建议
- 自然语言处理和多轮对话支持
- 基于用户偏好的智能推荐系统

### 🗺️ 真实交通数据集成
- 集成 Google Maps Routes API 获取实时交通信息
- 多种交通方式支持（驾车、步行、公交、骑行）
- 基于真实交通状况的路线优化

### 🎨 动态 UI 组件生成
- 基于用户查询动态生成不同的组件组合
- 智能主题色彩系统，根据目的地特色自动匹配
- 响应式设计，适配各种设备尺寸

### 🔧 系统配置
- 网络代理配置，确保 API 访问稳定性
- 环境变量管理和安全配置
- 性能优化和缓存机制

## 核心组件

### actions.tsx - 服务器端操作
```typescript
// 主要功能：
- submitUserMessage() - 处理用户消息和 AI 响应
- 动态主题色彩生成 - 50+ 城市和地区的智能匹配
- 组件数据生成 - 景点、行程、信息卡片等
- 代理配置 - Google API 网络代理设置
```

### page.tsx - 主页面
```typescript
// 主要功能：
- AI 对话界面 - 流式响应和实时交互
- 动态背景 - 基于内容的视觉效果
- 行程规划面板 - 右侧固定的行程管理界面
- 响应式布局 - 适配不同屏幕尺寸
```

### layout.tsx - 根布局
```typescript
// 主要功能：
- 全局 HTML 结构和元数据
- 字体配置 - Inter 字体系统
- 全局样式引入
- 应用初始化配置
```

## 技术栈

- **Next.js 16** (App Router) - 现代 React 框架
- **React Server Components** - 服务器端渲染组件
- **AI SDK** - 流式 UI 生成和 AI 集成
- **Google Gemini API** - 自然语言处理和智能推荐
- **Google Maps Routes API** - 真实交通数据和路线规划
- **Tailwind CSS** - 实用优先的 CSS 框架
- **TypeScript** - 类型安全的 JavaScript

## 性能优化

### 缓存策略
- API 响应缓存，减少重复请求
- 路线数据缓存，提升交通查询速度
- 组件级缓存，优化渲染性能

### 网络优化
- 代理配置，确保 API 访问稳定性
- 批量请求处理，减少网络开销
- 优雅降级，API 失败时的备用方案

### 用户体验
- 流式响应，实时显示 AI 生成内容
- 响应式设计，适配各种设备
- 动态主题，基于内容的视觉体验

## 开发指南

### 环境配置
确保在 `.env.local` 中配置必要的环境变量：
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
HTTP_PROXY=http://127.0.0.1:7890  # 如果需要代理
HTTPS_PROXY=http://127.0.0.1:7890
```

### 本地开发
```bash
npm run dev  # 启动开发服务器
npm run build  # 构建生产版本
npm run start  # 启动生产服务器
```

### 调试技巧
- 查看浏览器控制台的网络请求
- 检查服务器端日志的 API 调用状态
- 使用 React DevTools 调试组件状态

---

**最后更新**: 2026年1月21日  
**版本**: v2.0.0 (集成 Google Maps Routes API)