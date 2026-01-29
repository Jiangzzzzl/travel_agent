import { createAI, getMutableAIState, streamUI } from '@ai-sdk/rsc';
import { google } from '@ai-sdk/google';
import { nanoid } from 'nanoid';
import { MarkdownContent } from '@/components/markdown-content';
import { parseJSONComponents } from '@/lib/parse-json-components';
import { DestinationSetter } from '@/components/destination-setter';

// Vercel 兼容的代理设置
if (typeof window === 'undefined' && !process.env.VERCEL) {
  // 只在本地开发环境设置代理
  console.log('🔧 Local development: Setting up proxy configuration');
  
  // 设置环境变量（如果还没有设置）
  if (!process.env.HTTP_PROXY) {
    process.env.HTTP_PROXY = 'http://127.0.0.1:7890';
  }
  if (!process.env.HTTPS_PROXY) {
    process.env.HTTPS_PROXY = 'http://127.0.0.1:7890';
  }
  
  console.log('🔧 Proxy configuration:', {
    HTTP_PROXY: process.env.HTTP_PROXY,
    HTTPS_PROXY: process.env.HTTPS_PROXY,
  });
  
  // 使用 undici 设置全局代理（最有效的方法）
  try {
    const { ProxyAgent, setGlobalDispatcher } = require('undici');
    const proxyAgent = new ProxyAgent(process.env.HTTPS_PROXY);
    setGlobalDispatcher(proxyAgent);
    console.log('✅ Undici global proxy dispatcher set (local development)');
  } catch (error) {
    console.log('⚠️ Undici proxy setup failed:', error.message);
  }
} else if (process.env.VERCEL) {
  console.log('🚀 Running on Vercel, proxy disabled');
}

// 根据内容智能选择主题色
function getThemeColorFromContent(content: string): string {
  // 预设的知名城市颜色映射
  const cityColorMap: Record<string, string> = {
    // 中国城市
    '西安': '#F59E0B',      // 古都金色
    '北京': '#EF4444',      // 中国红
    '上海': '#06B6D4',      // 现代蓝
    '成都': '#10B981',      // 悠闲绿
    '杭州': '#14B8A6',      // 西湖青
    '大理': '#3B82F6',      // 洱海蓝
    '丽江': '#8B5CF6',      // 古城紫
    '广州': '#F97316',      // 木棉橙
    '深圳': '#0EA5E9',      // 科技蓝
    '重庆': '#DC2626',      // 火锅红
    '南京': '#7C3AED',      // 紫金山紫
    '苏州': '#059669',      // 园林绿
    '青岛': '#0284C7',      // 海洋蓝
    '厦门': '#F59E0B',      // 鼓浪屿金
    '三亚': '#06B6D4',      // 海南蓝
    
    // 国际城市
    '东京': '#A855F7',      // 科技紫
    '巴黎': '#F43F5E',      // 浪漫粉
    '伦敦': '#64748B',      // 雾都灰
    '纽约': '#1E40AF',      // 自由蓝
    '洛杉矶': '#F59E0B',    // 阳光金
    '悉尼': '#0EA5E9',      // 海港蓝
    '首尔': '#EC4899',      // 樱花粉
    '新加坡': '#10B981',    // 花园绿
    '曼谷': '#F97316',      // 佛教橙
    '迪拜': '#FBBF24',      // 沙漠金
    '罗马': '#DC2626',      // 古罗马红
    '巴塞罗那': '#7C3AED',  // 高迪紫
    '阿姆斯特丹': '#059669', // 运河绿
    '圣托里尼': '#EC4899',  // 爱琴海粉
    '马尔代夫': '#06B6D4',  // 海岛蓝
    '普吉岛': '#14B8A6',    // 热带青
  };
  
  // 地区/国家特色颜色
  const regionColorMap: Record<string, string> = {
    // 地理特征
    '海岛': '#06B6D4',      // 海洋蓝
    '沙漠': '#F59E0B',      // 沙漠金
    '雪山': '#E5E7EB',      // 雪白
    '草原': '#10B981',      // 草绿
    '森林': '#059669',      // 深绿
    '湖泊': '#0284C7',      // 湖蓝
    '古镇': '#8B5CF6',      // 古典紫
    '古城': '#F59E0B',      // 古都金
    
    // 国家/地区
    '日本': '#A855F7',      // 紫色
    '韩国': '#EC4899',      // 粉色
    '泰国': '#F97316',      // 橙色
    '法国': '#F43F5E',      // 玫瑰红
    '意大利': '#DC2626',    // 红色
    '希腊': '#3B82F6',      // 蓝色
    '土耳其': '#7C3AED',    // 紫色
    '印度': '#F59E0B',      // 金色
    '埃及': '#FBBF24',      // 金黄
    '摩洛哥': '#DC2626',    // 红色
    '澳大利亚': '#0EA5E9',  // 蓝色
    '新西兰': '#10B981',    // 绿色
    '美国': '#1E40AF',      // 蓝色
    '加拿大': '#DC2626',    // 红色
    '英国': '#64748B',      // 灰色
    '德国': '#374151',      // 深灰
    '荷兰': '#059669',      // 绿色
    '瑞士': '#0284C7',      // 蓝色
    '挪威': '#3B82F6',      // 蓝色
    '芬兰': '#10B981',      // 绿色
  };
  
  // 景点类型颜色
  const attractionTypeMap: Record<string, string> = {
    '博物馆': '#DC2626',    // 红色
    '寺庙': '#7C3AED',      // 紫色
    '教堂': '#6B7280',      // 灰色
    '宫殿': '#F59E0B',      // 金色
    '城堡': '#64748B',      // 石灰色
    '公园': '#10B981',      // 绿色
    '海滩': '#06B6D4',      // 蓝色
    '山峰': '#78716C',      // 棕色
    '瀑布': '#0284C7',      // 蓝色
    '温泉': '#F97316',      // 橙色
    '购物': '#EC4899',      // 粉色
    '美食': '#F59E0B',      // 金色
    '夜市': '#A855F7',      // 紫色
    '酒吧': '#DC2626',      // 红色
  };
  
  // 1. 首先检查具体城市
  for (const [city, color] of Object.entries(cityColorMap)) {
    if (content.includes(city)) {
      return color;
    }
  }
  
  // 2. 检查地区/国家特征
  for (const [region, color] of Object.entries(regionColorMap)) {
    if (content.includes(region)) {
      return color;
    }
  }
  
  // 3. 检查景点类型
  for (const [type, color] of Object.entries(attractionTypeMap)) {
    if (content.includes(type)) {
      return color;
    }
  }
  
  // 4. 基于内容特征的智能推断
  const contentLower = content.toLowerCase();
  
  // 历史文化类
  if (contentLower.includes('古') || contentLower.includes('历史') || 
      contentLower.includes('文化') || contentLower.includes('遗产')) {
    return '#F59E0B'; // 古都金
  }
  
  // 自然风光类
  if (contentLower.includes('山') || contentLower.includes('峰') || 
      contentLower.includes('自然') || contentLower.includes('风景')) {
    return '#10B981'; // 自然绿
  }
  
  // 海洋海岛类
  if (contentLower.includes('海') || contentLower.includes('岛') || 
      contentLower.includes('beach') || contentLower.includes('ocean')) {
    return '#06B6D4'; // 海洋蓝
  }
  
  // 现代都市类
  if (contentLower.includes('都市') || contentLower.includes('现代') || 
      contentLower.includes('科技') || contentLower.includes('购物')) {
    return '#3B82F6'; // 现代蓝
  }
  
  // 浪漫度假类
  if (contentLower.includes('浪漫') || contentLower.includes('度假') || 
      contentLower.includes('蜜月') || contentLower.includes('romantic')) {
    return '#EC4899'; // 浪漫粉
  }
  
  // 5. 基于字符串哈希生成一致的颜色（确保同样的内容总是得到同样的颜色）
  const colors = [
    '#F59E0B', '#EF4444', '#06B6D4', '#10B981', '#14B8A6',
    '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#A855F7',
    '#DC2626', '#7C3AED', '#059669', '#0EA5E9', '#F97316'
  ];
  
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
}

// 选择可用的模型 - 只使用 Gemini
const getModel = () => {
  console.log('🔍 Selecting AI model...');
  console.log('Available API keys:', {
    google: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? '✅ Set' : '❌ Not set',
  });
  
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log('✅ Using Google Gemini 2.5 Flash');
    return google('gemini-2.5-flash');
  }
  
  console.log('⚠️ No Gemini API key found, this will fail');
  return google('gemini-2.5-flash');
};


// 提交消息的函数
async function submitUserMessage(content: string) {
  'use server';

  console.log('📨 Received user message:', content);
  
  const aiState = getMutableAIState<typeof AI>();

  aiState.update([
    ...aiState.get(),
    { role: 'user', content }
  ]);

  console.log('🚀 Starting streamUI...');
  
  try {
    console.log('🚀 Starting streamUI...');
    
    const result = await streamUI({
      model: getModel(),
      initial: <div className="text-slate-500 animate-pulse">Planning your journey...</div>,
      temperature: 0.3, // 降低温度以更严格遵循指令
      maxRetries: 2,
      abortSignal: AbortSignal.timeout(300000), // 5分钟超时
      system: `🚨 CRITICAL REQUIREMENT: For ANY destination query, you MUST generate MINIMUM 10 attraction components! This is NON-NEGOTIABLE!

🚨 MANDATORY RULE: Even for itinerary planning, you MUST include both itinerary AND attraction components!

You are a travel planning assistant that generates DYNAMIC UI components based on user questions.

MANDATORY ATTRACTION COUNT RULES:
- "有什么好玩的" / "景点推荐" → EXACTLY 12-15 attraction components
- "美食推荐" / "吃什么" → EXACTLY 10-12 food attraction components  
- General destination queries → EXACTLY 10-12 attraction components
- NEVER generate less than 10 attractions for any destination query!

⚠️ STRICT ENFORCEMENT: If you generate fewer than 10 attractions, the response will be rejected!

QUESTION TYPE DETECTION:
1. "景点推荐" / "有什么好玩的" → destinationHero + 12-15 attraction cards (MANDATORY!)
2. "美食" / "吃什么" → destinationHero + 10-12 food-type attractions + activities (restaurants)
3. "行程规划" / "X天游" / "一日游" / "几天游" → destinationHero + 10-12 attraction cards (NO ITINERARY!)
4. "路线" / "怎么玩" → destinationHero + routeMap + attractions
5. "天气" / "什么时候去" → destinationHero + weather + bestTime info
6. General question → Mix components based on context

🚨 CRITICAL RULE: NEVER generate itinerary components automatically!
- Even for "X天游" / "行程规划" queries, ONLY provide attraction recommendations
- Users will select attractions manually and use "Generate Itinerary" button to create itinerary
- Let users have full control over attraction selection before itinerary generation

ATTRACTION GENERATION RULES (MANDATORY FOR ALL QUERIES):
- For ANY destination query, generate MINIMUM 10 attraction components
- For "有什么好玩的" questions: Generate EXACTLY 12-15 attractions
- For "美食推荐" questions: Generate EXACTLY 10-12 food attractions
- For "行程规划" questions: Generate itinerary + EXACTLY 10-12 attractions
- For general destination questions: Generate EXACTLY 10-12 attractions
- Each attraction MUST have unique name, location, description, and tags
- Each attraction MUST include "estimatedDuration" field with realistic time estimates:
  * 主题公园/游乐园: "全天" 或 "半天"
  * 大型博物馆: "3-4小时" 或 "4-5小时"
  * 小型博物馆/寺庙: "1-2小时"
  * 观景台/塔楼: "1小时" 或 "1-2小时"
  * 购物街/商业区: "2-3小时"
  * 公园/花园: "2-3小时"
  * 历史古迹: "2-3小时"
- Each attraction MUST include "bestTime" field (上午/下午/傍晚/全天)
- Mix different attraction types: historical, cultural, nature, food, modern, beach

EXAMPLE ATTRACTION COUNTS (FOLLOW EXACTLY):
- 西安景点推荐: 兵马俑, 大雁塔, 华清池, 古城墙, 钟楼, 鼓楼, 大唐芙蓉园, 陕西历史博物馆, 华山, 法门寺, 大明宫, 小雁塔, 碑林博物馆, 青龙寺, 大慈恩寺 (15个)
- 巴黎景点推荐: 埃菲尔铁塔, 卢浮宫, 凯旋门, 圣母院, 香榭丽舍大街, 圣心大教堂, 塞纳河游船, 凡尔赛宫, 奥赛博物馆, 拉丁区, 蒙马特高地, 巴黎歌剧院 (12个)
- 东京景点推荐: 浅草寺, 东京塔, 皇居, 新宿, 涩谷, 银座, 上野公园, 明治神宫, 秋叶原, 筑地市场, 东京迪士尼, 六本木 (12个)

MANDATORY INFO COMPONENT EXAMPLES (ALWAYS include meaningful content):
{
  "type": "info",
  "title": "Best Time to Visit",
  "content": "春季3-5月是最佳旅游季节，气候温和，樱花盛开，但游客较多，建议提前预订酒店。秋季9-11月也是不错的选择，天气凉爽，红叶满山。",
  "infoType": "tip"
},
{
  "type": "info", 
  "title": "Local Delicacies",
  "content": "当地特色美食包括肉夹馍、凉皮、羊肉泡馍等，推荐到回民街品尝正宗小吃。晚上可以去大唐不夜城感受盛唐文化，品尝各种陕西美食。",
  "infoType": "highlight"
}

COUNT VERIFICATION: Before responding, count your attraction components. If less than 10, add more attractions!

IMPORTANT: You must respond with VALID JSON in this exact format:

{
  "components": [
    {
      "type": "destinationHero",
      "destination": "Paris",
      "tagline": "City of Light and Romance",
      "highlights": ["Eiffel Tower", "Louvre Museum", "Seine River"],
      "themeColor": "#F43F5E",
      "emoji": "🗼",
      "backgroundPattern": "city"
    },
    {
      "type": "stat",
      "value": "2000+",
      "label": "Years of History",
      "emoji": "🏛️",
      "color": "#F59E0B"
    },
    {
      "type": "attraction",
      "name": "Eiffel Tower",
      "location": "Champ de Mars",
      "tags": ["landmark", "photography", "romantic"],
      "description": "Iconic iron tower offering breathtaking views of Paris",
      "vibeColor": "#F59E0B",
      "attractionType": "historical",
      "emoji": "🗼",
      "rating": 5,
      "estimatedDuration": "2-3小时",
      "bestTime": "傍晚"
    },
    {
      "type": "attraction",
      "name": "Louvre Museum",
      "location": "Rue de Rivoli",
      "tags": ["museum", "art", "culture"],
      "description": "World's largest art museum with famous Mona Lisa",
      "vibeColor": "#DC2626",
      "attractionType": "cultural",
      "emoji": "🎨",
      "rating": 5,
      "estimatedDuration": "4-5小时",
      "bestTime": "上午"
    },
    {
      "type": "attraction",
      "name": "Notre-Dame Cathedral",
      "location": "Île de la Cité",
      "tags": ["architecture", "history", "gothic"],
      "description": "Gothic masterpiece with stunning rose windows",
      "vibeColor": "#6B7280",
      "attractionType": "historical",
      "emoji": "⛪",
      "rating": 4.8,
      "estimatedDuration": "1-2小时",
      "bestTime": "上午"
    },
    {
      "type": "attraction",
      "name": "Arc de Triomphe",
      "location": "Place Charles de Gaulle",
      "tags": ["monument", "history", "views"],
      "description": "Triumphal arch honoring French military victories",
      "vibeColor": "#F59E0B",
      "attractionType": "historical",
      "emoji": "🏛️",
      "rating": 4.7,
      "estimatedDuration": "1小时",
      "bestTime": "傍晚"
    },
    {
      "type": "attraction",
      "name": "Champs-Élysées",
      "location": "8th Arrondissement",
      "tags": ["shopping", "boulevard", "cafes"],
      "description": "Famous avenue for shopping and people watching",
      "vibeColor": "#EC4899",
      "attractionType": "modern",
      "emoji": "🛍️",
      "rating": 4.5,
      "estimatedDuration": "2-3小时",
      "bestTime": "下午"
    },
    {
      "type": "attraction",
      "name": "Sacré-Cœur Basilica",
      "location": "Montmartre",
      "tags": ["basilica", "views", "montmartre"],
      "description": "Beautiful basilica with panoramic city views",
      "vibeColor": "#8B5CF6",
      "attractionType": "cultural",
      "emoji": "⛪",
      "rating": 4.6,
      "estimatedDuration": "1-2小时",
      "bestTime": "上午"
    },
    {
      "type": "attraction",
      "name": "Seine River Cruise",
      "location": "Seine River",
      "tags": ["cruise", "sightseeing", "romantic"],
      "description": "Scenic boat tour along Paris landmarks",
      "vibeColor": "#06B6D4",
      "attractionType": "nature",
      "emoji": "🚢",
      "rating": 4.4,
      "estimatedDuration": "1-2小时",
      "bestTime": "傍晚"
    },
    {
      "type": "attraction",
      "name": "Versailles Palace",
      "location": "Versailles",
      "tags": ["palace", "gardens", "luxury"],
      "description": "Opulent royal palace with magnificent gardens",
      "vibeColor": "#F59E0B",
      "attractionType": "historical",
      "emoji": "👑",
      "rating": 4.8,
      "estimatedDuration": "全天",
      "bestTime": "上午"
    },
    {
      "type": "attraction",
      "name": "Musée d'Orsay",
      "location": "Left Bank",
      "tags": ["museum", "impressionist", "art"],
      "description": "World's finest collection of impressionist art",
      "vibeColor": "#A855F7",
      "attractionType": "cultural",
      "emoji": "🎨",
      "rating": 4.7,
      "estimatedDuration": "3-4小时",
      "bestTime": "上午"
    },
    {
      "type": "attraction",
      "name": "Latin Quarter",
      "location": "5th Arrondissement",
      "tags": ["historic", "students", "cafes"],
      "description": "Historic area with narrow streets and cafes",
      "vibeColor": "#F97316",
      "attractionType": "cultural",
      "emoji": "📚",
      "rating": 4.3,
      "estimatedDuration": "2-3小时",
      "bestTime": "下午"
    }
  ],
  "text": "Optional additional text explanation"
}

MANDATORY ATTRACTION COUNT EXAMPLES:
- "西安有什么好玩的" → Hero + 2 stats + 12-15 attractions + 2 info cards
- "西安美食推荐" → Hero + quote + 10-12 food attractions + info card
- "西安3天游" → Hero + 12-15 attractions + stats + info cards (NO ITINERARY!)
- "巴黎一日游" → Hero + 10-12 attractions + info cards (NO ITINERARY!)
- "东京旅游" → Hero + 10-12 attractions + stats + info cards
- "泰国有什么好玩的" → Hero + 12-15 attractions + activities

🚨 NEVER GENERATE ITINERARY COMPONENTS AUTOMATICALLY!
Users will select attractions manually and click "Generate Itinerary" button when ready.

COMPONENT TYPES (choose based on question):
1. destinationHero - Overview banner (ALWAYS include this first)
2. attraction - Attraction cards (attractionType: historical/nature/food/modern/cultural/beach) - MINIMUM 10 for attraction queries!
3. info - Info cards (infoType: tip/time/budget/crowd/highlight) - Use for tips, advice, warnings
4. stat - Statistic cards (value, label, emoji) - Use for numbers, facts, data
5. quote - Quote cards (text, author) - Use for famous sayings, local proverbs
6. activities - Activity showcase (for "活动" / "体验" questions)
7. itinerary - Multi-day plans (ONLY when user explicitly requests itinerary generation via "Generate Itinerary" button)

🚨 ITINERARY COMPONENT RESTRICTION:
- NEVER generate itinerary components for "X天游" / "行程规划" queries
- ONLY generate itinerary when user explicitly uses "Generate Itinerary" button
- For trip planning queries, provide attraction recommendations instead

CRITICAL INFO COMPONENT RULES:
- NEVER generate info components with empty "content" field
- Each info component MUST have meaningful, specific content (minimum 10 words)
- Examples of GOOD info content:
  * tip: "春季3-5月是最佳旅游季节，气候温和，樱花盛开，但游客较多，建议提前预订酒店"
  * highlight: "当地特色美食包括肉夹馍、凉皮、羊肉泡馍，推荐到回民街品尝正宗小吃"
  * time: "大部分景点9:00-17:00开放，建议上午早点出发避开人流高峰"
  * budget: "日均消费约300-500元，包含门票、餐饮和交通，住宿另计"
  * crowd: "周末和节假日游客较多，建议工作日前往，体验更佳"

DYNAMIC BEHAVIOR EXAMPLES:
- User asks "西安有什么好玩的" → Show Hero + 12-15 historical/cultural attractions (兵马俑, 大雁塔, 华清池, 城墙, 钟楼, 鼓楼, 大唐芙蓉园, 陕西历史博物馆, 华山, 法门寺, 大明宫, 小雁塔, 碑林博物馆, 青龙寺, 大慈恩寺)
- User asks "西安美食推荐" → Show Hero + 10-12 food-type attractions (肉夹馍, 凉皮, 羊肉泡馍, 胡辣汤, 臊子面, 葫芦头, 甑糕, 柿子饼, 腊汁肉夹馍, 岐山面, 粉汤羊血, 水盆羊肉)
- User asks "西安3天游" → Show Hero + 12-15 attractions (NO ITINERARY! Let user select attractions first)
- User asks "巴黎一日游" → Show Hero + 10-12 attractions (NO ITINERARY! User will generate itinerary later)
- User asks "东京旅游" → Show Hero + 12-15 attractions (埃菲尔铁塔, 卢浮宫, 凯旋门, 圣母院, 香榭丽舍大街, 圣心大教堂, 塞纳河游船, 凡尔赛宫, 奥赛博物馆, 拉丁区, 蒙马特高地, 巴黎歌剧院, 荣军院, 先贤祠, 玛黑区)

CRITICAL ITINERARY RULES:
- If user says "3天" or "三日游" or "3-day", generate EXACTLY 3 days, not 2!
- If user provides specific attractions list, include ALL of them in the itinerary
- Each day needs 3-5 activities with realistic time allocations
- Include breakfast, lunch, dinner suggestions

COLOR GUIDELINES (match destination vibe):
- Historical cities (Xi'an, Beijing): #F59E0B (amber)
- Nature destinations (Dali, Guilin): #10B981 (green)
- Beach resorts (Sanya, Phuket): #14B8A6 (teal)
- Modern cities (Tokyo, Shanghai): #3B82F6 (blue)
- Romantic places (Paris, Santorini): #EC4899 (pink)
- Cultural spots (Kyoto, Lijiang): #A855F7 (purple)

REMEMBER: 
- For attraction recommendations, ALWAYS generate MINIMUM 10 attraction components!
- Analyze user question type FIRST
- Generate DIFFERENT component combinations for different questions
- Output ONLY valid JSON, no other text!
- Be creative and flexible with component selection!`,
      messages: aiState.get(),
      text: ({ content, done }) => {
        console.log('📝 StreamUI text callback called:', { 
          contentLength: content.length, 
          done,
          preview: content.substring(0, 200),
          fullContent: done ? content : '[streaming...]' // 只在完成时显示完整内容
        });
        
        if (!done) {
          return (
            <div className="flex items-center gap-3 text-slate-500">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">正在生成旅行规划...</span>
            </div>
          );
        }
        
        // 当 done=true 时，解析内容并返回最终UI，但不在这里调用 aiState.done()
        console.log('🎨 StreamUI: Processing final response, calling parseJSONComponents...');
        console.log('🎨 StreamUI: Full AI response content:', content);
        const { components, text } = parseJSONComponents(content);
        
        console.log('🎨 Parsed result:', {
          componentCount: components.length,
          hasText: !!text,
        });
        
        // 提取目的地信息，但不在这里设置，而是通过props传递给组件
        let extractedDestination = null;
        try {
          // 清理markdown代码块标记
          let cleanContent = content.trim();
          cleanContent = cleanContent.replace(/```json\s*/g, '');
          cleanContent = cleanContent.replace(/```javascript\s*/g, '');
          cleanContent = cleanContent.replace(/```tool_code\s*/g, '');
          cleanContent = cleanContent.replace(/```\s*$/g, '');
          cleanContent = cleanContent.replace(/^```\s*/g, '');
          cleanContent = cleanContent.trim();
          
          const data = JSON.parse(cleanContent);
          if (data.components && Array.isArray(data.components)) {
            const destinationHero = data.components.find((comp: any) => comp.type === 'destinationHero');
            if (destinationHero && destinationHero.destination) {
              extractedDestination = destinationHero.destination;
              console.log('🎯 Client: Extracted destination for later setting:', extractedDestination);
            }
          }
        } catch (error) {
          console.warn('⚠️ Client: Failed to parse content for destination extraction:', error);
        }
        
        const themeColor = getThemeColorFromContent(content);
        
        return (
          <div className="space-y-6">
            {/* 目的地设置组件 - 在客户端设置目的地 */}
            {extractedDestination && (
              <DestinationSetter destination={extractedDestination} />
            )}
            
            <div className="space-y-6">
              {components.map((comp, idx) => (
                <div key={idx} className="animate-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                  {comp}
                </div>
              ))}
            </div>
            
            {text && text.trim() && (
              <div className="relative group animate-in-up">
                <div 
                  className="absolute -inset-1 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}88)` }}
                />
                <div 
                  className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border-2"
                  style={{ borderColor: `${themeColor}30` }}
                >
                  <MarkdownContent content={text} themeColor={themeColor} />
                </div>
              </div>
            )}
            
            {components.length === 0 && !text && (
              <div className="text-slate-500 text-center p-8">
                正在生成旅行规划...
              </div>
            )}
          </div>
        );
      },
    });

    console.log('✅ StreamUI completed successfully, result:', result);
    
    // 手动调用 aiState.done() 来解决警告
    aiState.done([
      ...aiState.get(),
      { role: 'assistant', content: 'Travel planning response generated' }
    ]);

    return {
      id: nanoid(),
      role: 'assistant',
      display: result.value
    };
  } catch (error) {
    console.error('AI Error:', error);
    
    aiState.done(aiState.get());
    
    return {
      id: nanoid(),
      role: 'assistant',
      display: (
        <div className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
          抱歉，AI 服务暂时无法响应。请检查网络连接或稍后再试。
          <div className="text-xs mt-2 text-red-500">
            {error instanceof Error ? error.message : '未知错误'}
          </div>
        </div>
      )
    };
  }
}

export const AI = createAI({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: []
});
