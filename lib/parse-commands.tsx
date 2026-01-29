import { DestinationHero } from '@/components/travel/destination-hero';
import { EnhancedAttractionCard } from '@/components/travel/enhanced-attraction-card';
import { ItineraryCard } from '@/components/travel/itinerary-card';
import { ActivityShowcase } from '@/components/travel/activity-showcase';

// 解析命令标签并转换为 React 组件
export function parseCommandsToComponents(text: string) {
  const components: React.ReactNode[] = [];
  let remainingText = text;

  // 解析 DESTINATION_HERO
  const heroRegex = /\[DESTINATION_HERO:\s*([^\]]+)\]/g;
  let match;
  
  while ((match = heroRegex.exec(text)) !== null) {
    const params = parseParams(match[1]);
    if (params.destination) {
      components.push(
        <DestinationHero
          key={`hero-${components.length}`}
          destination={params.destination}
          tagline={params.tagline || ''}
          highlights={params.highlights?.split(',') || []}
          themeColor={params.color || '#8B5CF6'}
          emoji={params.emoji || '✨'}
          backgroundPattern={(params.pattern as any) || 'nature'}
        />
      );
    }
    remainingText = remainingText.replace(match[0], '');
  }

  // 解析 ATTRACTION
  const attractionRegex = /\[ATTRACTION:\s*([^\]]+)\]/g;
  while ((match = attractionRegex.exec(text)) !== null) {
    const params = parseParams(match[1]);
    if (params.name) {
      components.push(
        <EnhancedAttractionCard
          key={`attraction-${components.length}`}
          name={params.name}
          type={(params.type as any) || 'cultural'}
          location={params.location || ''}
          description={params.description || ''}
          tags={params.tags?.split(',') || []}
          vibeColor={params.color || '#8B5CF6'}
          emoji={params.emoji}
          rating={params.rating ? parseFloat(params.rating) : undefined}
          bestTime={params.bestTime}
        />
      );
    }
    remainingText = remainingText.replace(match[0], '');
  }

  // 解析 ITINERARY
  const itineraryRegex = /\[ITINERARY:\s*([^\]]+)\]/g;
  while ((match = itineraryRegex.exec(text)) !== null) {
    const params = parseParams(match[1]);
    if (params.destination) {
      const days = [];
      let dayNum = 1;
      while (params[`day${dayNum}`]) {
        const activities = params[`day${dayNum}`].split(';').map((act: string) => {
          const [time, ...rest] = act.trim().split(':');
          return {
            time: time.trim(),
            location: rest.join(':').trim(),
            description: rest.join(':').trim(),
            type: 'attraction' as const,
          };
        });
        
        days.push({
          day: `Day ${dayNum}`,
          title: params[`day${dayNum}Title`] || `Day ${dayNum}`,
          activities,
        });
        dayNum++;
      }
      
      if (days.length > 0) {
        components.push(
          <ItineraryCard
            key={`itinerary-${components.length}`}
            destination={params.destination}
            days={days}
            themeColor={params.color}
          />
        );
      }
    }
    remainingText = remainingText.replace(match[0], '');
  }

  return {
    components,
    remainingText: remainingText.trim(),
  };
}

// 解析参数字符串 "key1="value1" | key2="value2""
function parseParams(paramString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const regex = /(\w+)="([^"]+)"/g;
  let match;
  
  while ((match = regex.exec(paramString)) !== null) {
    params[match[1]] = match[2];
  }
  
  return params;
}
