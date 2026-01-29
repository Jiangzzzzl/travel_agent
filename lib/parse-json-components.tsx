import { DestinationHero } from '@/components/travel/destination-hero';
import { EnhancedAttractionCard } from '@/components/travel/enhanced-attraction-card';
import { ActivityShowcase } from '@/components/travel/activity-showcase';
import { ItineraryCard } from '@/components/travel/itinerary-card';
import { InfoCard } from '@/components/travel/info-card';
import { QuoteCard } from '@/components/travel/quote-card';
import { StatCard } from '@/components/travel/stat-card';
import { GenUIAttractionSystem } from '@/components/travel/genui-attraction-system';
import { destinationContext } from '@/lib/destination-context';

interface ComponentData {
  type: string;
  [key: string]: any;
}

interface ParsedResponse {
  components: React.ReactNode[];
  text?: string;
}

// 处理非景点组件的辅助函数
function processNonAttractionComponent(comp: ComponentData, idx: number, components: React.ReactNode[], itineraryDays: any[]) {
  switch (comp.type) {
    case 'activities':
      components.push(
        <ActivityShowcase
          key={`activities-${idx}`}
          destination={comp.destination}
          activities={comp.activities || []}
          themeColor={comp.themeColor || '#8B5CF6'}
        />
      );
      break;
      
    case 'info':
      components.push(
        <InfoCard
          key={`info-${idx}`}
          title={comp.title}
          content={comp.content}
          type={comp.infoType || 'tip'}
          color={comp.color}
        />
      );
      break;
      
    case 'quote':
      components.push(
        <QuoteCard
          key={`quote-${idx}`}
          text={comp.text}
          author={comp.author}
          color={comp.color}
        />
      );
      break;
      
    case 'stat':
      components.push(
        <StatCard
          key={`stat-${idx}`}
          value={comp.value}
          label={comp.label}
          emoji={comp.emoji}
          color={comp.color}
        />
      );
      break;
      
    case 'itinerary':
      // 处理行程组件
      if (comp.day !== undefined && !comp.days) {
        // 单天格式：收集起来，稍后合并
        let activities = [];
        if (Array.isArray(comp.activities)) {
          activities = comp.activities.map((act: any) => {
            return {
              time: act.time || '',
              location: act.location || '',
              description: act.activity || act.description || '',
              type: (act.type || 'attraction') as 'attraction' | 'food' | 'rest' | 'photo',
            };
          });
        }
        
        itineraryDays.push({
          day: `第 ${comp.day} 天`,
          title: comp.title || `第 ${comp.day} 天`,
          activities,
        });
      } else if (comp.days && Array.isArray(comp.days)) {
        // 多天格式：直接渲染
        const formattedDays = comp.days.map((day: any) => {
          let activities = [];
          if (Array.isArray(day.activities)) {
            activities = day.activities.map((act: any) => {
              if (typeof act === 'string') {
                const match = act.match(/^([^:]+):\s*(.+)$/);
                if (match) {
                  return {
                    time: match[1].trim(),
                    location: '',
                    description: match[2].trim(),
                    type: 'attraction' as const,
                  };
                }
                return {
                  time: '',
                  location: '',
                  description: act,
                  type: 'attraction' as const,
                };
              }
              return {
                time: act.time || '',
                location: act.location || act.name || '',
                description: act.activity || act.description || '',
                type: (act.type || 'attraction') as 'attraction' | 'food' | 'rest' | 'photo',
                imageUrl: act.imageUrl,
              };
            });
          }
          
          return {
            day: day.day !== undefined && day.day !== null ? `第 ${day.day} 天` : `第 ${comp.days.indexOf(day) + 1} 天`,
            title: day.title || day.description || `第 ${day.day || comp.days.indexOf(day) + 1} 天`,
            activities,
          };
        });
        
        components.push(
          <ItineraryCard
            key={`itinerary-${idx}`}
            destination={comp.destination || comp.title || 'Travel Plan'}
            days={formattedDays}
            themeColor={comp.themeColor || '#8B5CF6'}
          />
        );
      }
      break;
      
    default:
      console.warn(`⚠️ Unknown component type: ${comp.type}`);
  }
}

export function parseJSONComponents(content: string): ParsedResponse {
  console.log('🔍 Parsing JSON components from:', content.substring(0, 200));
  
  // 首先检查是否是纯文本响应（不是JSON格式）
  const trimmedContent = content.trim();
  
  // 如果内容不是以 { 或 [ 开始，且不包含 "components" 字段，则认为是纯文本
  if (!trimmedContent.startsWith('{') && !trimmedContent.startsWith('[') && !trimmedContent.includes('"components"')) {
    console.log('📝 Detected plain text response, returning as text');
    return { components: [], text: content };
  }
  
  try {
    // 提取 JSON（可能被包裹在 markdown 代码块中）
    let jsonStr = content.trim();
    
    // 移除 markdown 代码块标记（支持多种格式）
    jsonStr = jsonStr.replace(/```json\s*/g, '');
    jsonStr = jsonStr.replace(/```javascript\s*/g, '');
    jsonStr = jsonStr.replace(/```tool_code\s*/g, '');
    jsonStr = jsonStr.replace(/```\s*$/g, '');
    jsonStr = jsonStr.replace(/^```\s*/g, '');
    
    jsonStr = jsonStr.trim();
    
    // 检查 JSON 是否完整（必须以 } 或 ] 结尾）
    if (!jsonStr.endsWith('}') && !jsonStr.endsWith(']')) {
      console.log('⚠️ JSON incomplete, waiting for more data...');
      return { components: [], text: undefined };
    }
    
    console.log('🧹 Cleaned JSON string (first 300 chars):', jsonStr.substring(0, 300));
    
    const data = JSON.parse(jsonStr);
    console.log('📦 Parsed JSON data:', data);
    console.log('📦 Has components?', data.components);
    console.log('📦 Is array?', Array.isArray(data.components));
    
    const components: React.ReactNode[] = [];
    
    if (!data.components || !Array.isArray(data.components)) {
      console.warn('⚠️ No components array found in JSON');
      console.warn('⚠️ Data structure:', Object.keys(data));
      return { components: [], text: content };
    }
    
    console.log(`✅ Found ${data.components.length} components to render`);
    
    let hasAttractions = false;
    let hasItinerary = false;
    let destination = '';
    let attractionComponents: any[] = [];
    const itineraryDays: any[] = []; // 收集所有单天的行程
    
    // 首先扫描所有组件，检测目的地和景点
    data.components.forEach((comp: ComponentData) => {
      console.log('🔍 ParseJSON: Processing component:', comp.type, comp);
      
      if (comp.type === 'destinationHero' && comp.destination) {
        destination = comp.destination;
        // 直接设置目的地上下文，不进行重新检测
        console.log('🎯 ParseJSON: Found destinationHero with destination:', destination);
        console.log('🎯 ParseJSON: Calling setDestinationDirect...');
        destinationContext.setDestinationDirect(destination);
        console.log('🎯 ParseJSON: setDestinationDirect completed');
        console.log('🎯 ParseJSON: Current destination after setting:', destinationContext.getCurrentDestination()?.name);
        console.log('🎯 ParseJSON: Current listener count:', destinationContext.getListenerCount());
      }
      if (comp.type === 'attraction') {
        hasAttractions = true;
        attractionComponents.push(comp);
      }
      if (comp.type === 'itinerary') {
        hasItinerary = true;
      }
    });
    
    console.log('🎯 Analysis result:', {
      destination,
      attractionCount: attractionComponents.length,
      hasAttractions,
      hasItinerary
    });
    
    // 使用GenUI风格的景点推荐系统处理景点组件
    if (attractionComponents.length > 0) {
      console.log('🎨 Using GenUI Attraction System for', attractionComponents.length, 'attractions');
      
      // 转换景点数据格式
      const formattedAttractions = attractionComponents.map(comp => ({
        name: comp.name,
        location: comp.location || '',
        description: comp.description || '',
        tags: comp.tags || [],
        vibeColor: comp.vibeColor || '#8B5CF6',
        emoji: comp.emoji,
        rating: comp.rating,
        bestTime: comp.bestTime,
        estimatedDuration: comp.estimatedDuration,
        attractionType: comp.attractionType || 'cultural',
        coordinates: comp.coordinates,
        imageUrl: comp.imageUrl
      }));
      
      // 使用GenUI景点推荐系统
      components.push(
        <GenUIAttractionSystem
          key="genui-attraction-system"
          attractions={formattedAttractions}
          destination={destination}
          layout="adaptive"
        />
      );
      
      // 处理其他非景点组件
      data.components.forEach((comp: ComponentData, idx: number) => {
        if (comp.type === 'destinationHero' || comp.type === 'attraction') {
          return; // 跳过，已由GenUI系统处理
        }
        
        // 处理其他组件类型
        processNonAttractionComponent(comp, idx, components, itineraryDays);
      });
      
      return { components, text: data.text };
    }
    
    // Group consecutive attraction components for consistent grid layout
    const groupedComponents: Array<{ type: string, data: any, originalIndex: number }> = [];
    
    data.components.forEach((comp: ComponentData, idx: number) => {
      groupedComponents.push({ type: comp.type, data: comp, originalIndex: idx });
    });
    
    // Process grouped components
    let currentAttractionGroup: any[] = [];
    let attractionGroupStartIdx = 0;
    
    const processAttractionGroup = () => {
      if (currentAttractionGroup.length > 0) {
        console.log(`🎨 Rendering attraction group with ${currentAttractionGroup.length} cards`);
        
        // Create a single column container for attraction cards
        const attractionGrid = (
          <div 
            key={`attraction-grid-${attractionGroupStartIdx}`}
            className="space-y-6"
          >
            {currentAttractionGroup.map((comp, gridIdx) => (
              <div key={`attraction-${attractionGroupStartIdx + gridIdx}`} className="w-full">
                <EnhancedAttractionCard
                  name={comp.name}
                  type={comp.attractionType || 'cultural'}
                  location={comp.location || ''}
                  description={comp.description || ''}
                  tags={comp.tags || []}
                  vibeColor={comp.vibeColor || '#8B5CF6'}
                  emoji={comp.emoji}
                  rating={comp.rating}
                  bestTime={comp.bestTime}
                  estimatedDuration={comp.estimatedDuration}
                  imageUrl={comp.imageUrl}
                />
              </div>
            ))}
          </div>
        );
        
        components.push(attractionGrid);
        currentAttractionGroup = [];
      }
    };
    
    groupedComponents.forEach((item, idx) => {
      const comp = item.data;
      console.log(`🎨 Processing component ${idx + 1}:`, comp.type, comp);
      
      if (comp.type === 'attraction') {
        hasAttractions = true;
        
        // Start or continue attraction group
        if (currentAttractionGroup.length === 0) {
          attractionGroupStartIdx = idx;
        }
        currentAttractionGroup.push(comp);
        
        // Check if next component is also an attraction, if not, process the group
        const nextItem = groupedComponents[idx + 1];
        if (!nextItem || nextItem.data.type !== 'attraction') {
          processAttractionGroup();
        }
        
        return; // Skip individual processing for attractions
      }
      
      // Process any pending attraction group before handling non-attraction components
      processAttractionGroup();
      
      if (comp.type === 'itinerary') hasItinerary = true;
      
      switch (comp.type) {
        case 'destinationHero':
          components.push(
            <DestinationHero
              key={`hero-${idx}`}
              destination={comp.destination}
              tagline={comp.tagline}
              highlights={comp.highlights || []}
              themeColor={comp.themeColor || '#8B5CF6'}
              emoji={comp.emoji || '✨'}
              backgroundPattern={comp.backgroundPattern || 'nature'}
              imageUrl={comp.imageUrl}
            />
          );
          break;
          
        case 'activities':
          components.push(
            <ActivityShowcase
              key={`activities-${idx}`}
              destination={comp.destination}
              activities={comp.activities || []}
              themeColor={comp.themeColor || '#8B5CF6'}
            />
          );
          break;
          
        case 'info':
          components.push(
            <InfoCard
              key={`info-${idx}`}
              title={comp.title}
              content={comp.content}
              type={comp.infoType || 'tip'}
              color={comp.color}
            />
          );
          break;
          
        case 'quote':
          components.push(
            <QuoteCard
              key={`quote-${idx}`}
              text={comp.text}
              author={comp.author}
              color={comp.color}
            />
          );
          break;
          
        case 'stat':
          components.push(
            <StatCard
              key={`stat-${idx}`}
              value={comp.value}
              label={comp.label}
              emoji={comp.emoji}
              color={comp.color}
            />
          );
          break;
          
        case 'itinerary':
          console.log('📋 Processing itinerary data:', comp);
          
          // 检查是单天格式还是多天格式
          if (comp.day !== undefined && !comp.days) {
            // 单天格式：收集起来，稍后合并
            console.log('📅 Single day format detected, collecting...');
            
            let activities = [];
            if (Array.isArray(comp.activities)) {
              activities = comp.activities.map((act: any) => {
                return {
                  time: act.time || '',
                  location: act.location || '',
                  description: act.activity || act.description || '',
                  type: (act.type || 'attraction') as 'attraction' | 'food' | 'rest' | 'photo',
                };
              });
            }
            
            itineraryDays.push({
              day: `第 ${comp.day} 天`,
              title: comp.title || `第 ${comp.day} 天`,
              activities,
            });
          } else if (comp.days && Array.isArray(comp.days)) {
            // 多天格式：直接渲染
            console.log('📅 Multi-day format detected');
            
            const formattedDays = comp.days.map((day: any) => {
              let activities = [];
              if (Array.isArray(day.activities)) {
                activities = day.activities.map((act: any) => {
                  if (typeof act === 'string') {
                    const match = act.match(/^([^:]+):\s*(.+)$/);
                    if (match) {
                      return {
                        time: match[1].trim(),
                        location: '',
                        description: match[2].trim(),
                        type: 'attraction' as const,
                      };
                    }
                    return {
                      time: '',
                      location: '',
                      description: act,
                      type: 'attraction' as const,
                    };
                  }
                  return {
                    time: act.time || '',
                    location: act.location || act.name || '',
                    description: act.activity || act.description || '',
                    type: (act.type || 'attraction') as 'attraction' | 'food' | 'rest' | 'photo',
                    imageUrl: act.imageUrl,
                  };
                });
              }
              
              return {
                day: day.day !== undefined && day.day !== null ? `第 ${day.day} 天` : `第 ${comp.days.indexOf(day) + 1} 天`,
                title: day.title || day.description || `第 ${day.day || comp.days.indexOf(day) + 1} 天`,
                activities,
              };
            });
            
            components.push(
              <ItineraryCard
                key={`itinerary-${idx}`}
                destination={comp.destination || comp.title || 'Travel Plan'}
                days={formattedDays}
                themeColor={comp.themeColor || '#8B5CF6'}
              />
            );
          }
          break;
          
        default:
          console.warn(`⚠️ Unknown component type: ${comp.type}`);
      }
    });
    
    // Process any remaining attraction group
    processAttractionGroup();
    
    // 如果收集到了单天的行程，合并成一个完整的行程卡片
    if (itineraryDays.length > 0) {
      console.log('✅ Merging', itineraryDays.length, 'single-day itineraries');
      components.push(
        <ItineraryCard
          key="merged-itinerary"
          destination="旅行行程"
          days={itineraryDays}
          themeColor="#8B5CF6"
        />
      );
    }
    
    return {
      components,
      text: data.text,
    };
  } catch (error) {
    console.error('❌ Failed to parse JSON:', error);
    console.error('Content was:', content);
    return {
      components: [],
      text: content,
    };
  }
}
