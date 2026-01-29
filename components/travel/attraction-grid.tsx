'use client';

import { EnhancedAttractionCard } from './enhanced-attraction-card';

interface AttractionGridProps {
  attractions: Array<{
    name: string;
    type: 'historical' | 'nature' | 'food' | 'modern' | 'cultural' | 'beach';
    location: string;
    description: string;
    tags: string[];
    vibeColor: string;
    emoji?: string;
    rating?: number;
    bestTime?: string;
  }>;
}

export function AttractionGrid({ attractions }: AttractionGridProps) {
  // 动态生成布局模式
  const getLayoutPattern = (count: number) => {
    const patterns = [
      // 模式1: 大-小-小
      ['col-span-2 row-span-2', 'col-span-1', 'col-span-1'],
      // 模式2: 小-小-大
      ['col-span-1', 'col-span-1', 'col-span-2 row-span-2'],
      // 模式3: 全部等宽
      ['col-span-1', 'col-span-1', 'col-span-1'],
      // 模式4: 交错大小
      ['col-span-2', 'col-span-1', 'col-span-1', 'col-span-2'],
      // 模式5: 竖长条
      ['col-span-1 row-span-2', 'col-span-1', 'col-span-1', 'col-span-1'],
    ];
    
    // 根据景点数量选择模式
    const patternIndex = count % patterns.length;
    return patterns[patternIndex];
  };

  const layoutPattern = getLayoutPattern(attractions.length);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {attractions.map((attraction, idx) => (
        <div 
          key={idx} 
          className={`${layoutPattern[idx % layoutPattern.length]} animate-in-up`}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <EnhancedAttractionCard {...attraction} />
        </div>
      ))}
    </div>
  );
}
