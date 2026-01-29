'use client';

import { useState, useEffect, useRef } from 'react';
import { jimengAIService } from '../../lib/jimeng-ai-service';
import { CityPersonality, RadicalUITheme } from '../../lib/radical-ui-generator';
import { Sparkles, Clock, Star, Heart, ArrowRight, Play, Pause } from 'lucide-react';

interface ImmersiveDestinationExperienceProps {
  destination: string;
  attractions: any[];
  personality: CityPersonality;
  theme: RadicalUITheme;
  onAttractionSelect?: (attraction: any) => void;
}

export function ImmersiveDestinationExperience({
  destination,
  attractions,
  personality,
  theme,
  onAttractionSelect
}: ImmersiveDestinationExperienceProps) {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [attractionImages, setAttractionImages] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateDestinationVisuals();
  }, [destination]);

  // 自动播放效果
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSection(prev => (prev + 1) % Math.min(attractions.length, 6));
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, attractions.length]);

  const generateDestinationVisuals = async () => {
    setIsGenerating(true);
    
    try {
      console.log('🎨 Starting visual generation for:', destination);
      console.log('🔧 Service configured:', jimengAIService.isServiceConfigured());
      
      // 检查JiMeng AI是否配置
      if (!jimengAIService.isServiceConfigured()) {
        console.log('⚠️ JiMeng AI not configured, using fallback images');
      }
      
      // 生成主要目的地图片
      console.log('🖼️ Generating hero image for:', destination, 'with style:', personality.soul);
      const heroImageUrl = await jimengAIService.generateDestinationImage(
        destination, 
        personality.soul
      );
      
      if (heroImageUrl) {
        console.log('✅ Hero image generated:', heroImageUrl);
        setHeroImage(heroImageUrl);
      } else {
        console.log('❌ Hero image generation failed');
      }

      // 为前6个景点生成图片
      console.log('🎨 Starting attraction images generation for', attractions.slice(0, 6).length, 'attractions');
      const imagePromises = attractions.slice(0, 6).map(async (attraction, index) => {
        console.log(`🎨 Generating image ${index + 1}/6 for:`, attraction.name);
        const imageUrl = await jimengAIService.generateAttractionImage(
          attraction.name,
          destination
        );
        console.log(`📸 Image result for ${attraction.name}:`, imageUrl ? 'SUCCESS' : 'FAILED');
        return { name: attraction.name, imageUrl };
      });

      const results = await Promise.all(imagePromises);
      const imageMap: Record<string, string> = {};
      
      results.forEach(result => {
        if (result && result.imageUrl) {
          console.log('✅ Image generated for:', result.name, '→', result.imageUrl);
          imageMap[result.name] = result.imageUrl;
        } else {
          console.log('❌ No image for:', result.name);
        }
      });

      setAttractionImages(imageMap);
      console.log('🎨 Visual generation completed. Generated', Object.keys(imageMap).length, 'images out of', attractions.slice(0, 6).length, 'attractions');
      console.log('📊 Image map:', imageMap);
    } catch (error) {
      console.error('❌ Visual generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return <GenerationLoader destination={destination} personality={personality} />;
  }

  return (
    <div 
      ref={containerRef}
      className="relative h-screen overflow-y-auto overflow-x-hidden"
      style={{ 
        background: getImmersiveBackground(personality.soul)
      }}
    >
      {/* Hero Section - 全屏沉浸式 */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 背景图片 */}
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt={destination}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-6xl px-8 animate-fade-in">
          {/* 主标题区域 */}
          <div className="mb-16">
            <div className="relative inline-block mb-8">
              <h1 
                className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight animate-slide-up-large"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.palette[0]}, ${theme.colors.palette[1]}, ${theme.colors.palette[2] || theme.colors.palette[0]})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))'
                }}
              >
                {destination}
              </h1>
              {/* 装饰性光晕 */}
              <div 
                className="absolute -inset-8 opacity-30 blur-3xl rounded-full"
                style={{
                  background: `radial-gradient(circle, ${theme.colors.palette[0]}40, transparent 70%)`
                }}
              />
            </div>
            
            <p className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed animate-fade-in-delay max-w-4xl mx-auto">
              {personality.essence}
            </p>
          </div>

          {/* 信息卡片区域 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-delay-2">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center gap-4 bg-white/10 backdrop-blur-2xl rounded-2xl px-8 py-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">{attractions.length}</div>
                  <div className="text-sm text-white/80">精选景点</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center gap-4 bg-white/10 backdrop-blur-2xl rounded-2xl px-8 py-4 border border-white/30 hover:bg-white/20 transition-all duration-300">
                <div className="p-2 bg-white/20 rounded-xl">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">{isPlaying ? '自动播放' : '已暂停'}</div>
                  <div className="text-sm text-white/80">点击{isPlaying ? '暂停' : '播放'}</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 滚动指示器 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80 animate-bounce-slow">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">探索更多</span>
            <ArrowRight className="w-5 h-5 rotate-90" />
          </div>
        </div>
      </section>

      {/* 沉浸式景点展示区 */}
      <section className="relative min-h-screen py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* 标题区域 */}
          <div className="text-center mb-16 md:mb-24 animate-fade-in">
            <div className="relative inline-block mb-6 md:mb-8">
              <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 md:mb-6">
                沉浸式体验
              </h2>
              <div 
                className="absolute -inset-4 opacity-20 blur-2xl rounded-full"
                style={{
                  background: `radial-gradient(circle, ${theme.colors.palette[1]}60, transparent 70%)`
                }}
              />
            </div>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
              AI生成的视觉盛宴，带你领略<span className="font-bold text-white">{destination}</span>的独特魅力
            </p>
          </div>

          {/* 景点网格 - 动态布局系统 */}
          <div className={getLayoutClasses(theme, personality)}>
            {attractions.slice(0, 6).map((attraction, index) => (
              <ImmersiveAttractionCard
                key={attraction.name}
                attraction={attraction}
                image={attractionImages[attraction.name]}
                theme={theme}
                personality={personality}
                index={index}
                isActive={currentSection === index}
                onSelect={onAttractionSelect}
                layoutStyle={getCardLayoutStyle(theme, personality, index)}
              />
            ))}
          </div>

          {/* 底部提示 */}
          <div className="text-center mt-12 md:mt-16 animate-fade-in-delay-2">
            <p className="text-white/60 text-base md:text-lg px-4">
              点击景点卡片了解更多详情 • 点击 ❤️ 保存到收藏
            </p>
          </div>
        </div>
      </section>

      {/* 浮动导航 */}
      <FloatingNavigation 
        attractions={attractions.slice(0, 6)}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        theme={theme}
      />
    </div>
  );
}

// 生成加载器组件
function GenerationLoader({ destination, personality }: { destination: string; personality: CityPersonality }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{ background: getImmersiveBackground(personality.soul) }}>
      
      {/* 动态背景 */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      <div className="text-center text-white z-10 animate-fade-in">
        <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full mx-auto mb-8 animate-spin" />
        
        <h2 className="text-4xl font-bold mb-4">正在生成 {destination} 的视觉体验</h2>
        <p className="text-xl text-white/80 mb-8">AI正在为您创造独一无二的旅行画面...</p>
        
        <div className="text-sm text-white/60 animate-pulse">
          即梦AI × Gemini 联合创作中
        </div>
      </div>
    </div>
  );
}

// 沉浸式景点卡片
function ImmersiveAttractionCard({ 
  attraction, 
  image, 
  theme, 
  personality, 
  index, 
  isActive, 
  onSelect,
  layoutStyle = {}
}: any) {
  const [isSaved, setIsSaved] = useState(false);
  
  // 检查是否已保存
  useEffect(() => {
    const savedAttractions = JSON.parse(localStorage.getItem('savedAttractions') || '[]');
    setIsSaved(savedAttractions.some((item: any) => item.name === attraction.name));
  }, [attraction.name]);
  
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    
    const savedAttractions = JSON.parse(localStorage.getItem('savedAttractions') || '[]');
    if (!isSaved) {
      savedAttractions.push(attraction);
      localStorage.setItem('savedAttractions', JSON.stringify(savedAttractions));
      console.log('✅ 景点已保存:', attraction.name);
    } else {
      const filtered = savedAttractions.filter((item: any) => item.name !== attraction.name);
      localStorage.setItem('savedAttractions', JSON.stringify(filtered));
      console.log('❌ 景点已移除:', attraction.name);
    }
  };

  // 根据城市个性生成不同的卡片样式
  const getCardDesign = () => {
    switch (personality.soul) {
      case 'ancient':
        return {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.15), rgba(245, 158, 11, 0.1))',
          border: '2px solid rgba(184, 134, 11, 0.3)',
        };
      case 'romantic':
        return {
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.15), rgba(251, 207, 232, 0.1))',
          border: '1px solid rgba(244, 114, 182, 0.3)',
        };
      case 'futuristic':
        return {
          borderRadius: '8px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.1))',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
        };
      case 'mystical':
        return {
          borderRadius: '50% 20% 50% 20%',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1))',
          border: '1px solid rgba(139, 92, 246, 0.4)',
        };
      case 'serene':
        return {
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(110, 231, 183, 0.1))',
          border: '1px solid rgba(52, 211, 153, 0.3)',
        };
      default:
        return {
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        };
    }
  };

  const cardDesign = getCardDesign();
  const defaultHeight = layoutStyle.height || '420px';

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-700 hover:scale-[1.02] hover:-translate-y-3 ${
        isActive ? 'z-10 scale-[1.02] -translate-y-1' : 'z-0'
      } animate-fade-in`}
      style={{ 
        animationDelay: `${index * 0.15}s`,
        ...layoutStyle
      }}
      onClick={() => onSelect?.(attraction)}
    >
      {/* 卡片光晕效果 */}
      <div 
        className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.palette[0]}40, ${theme.colors.palette[1]}40)`,
          borderRadius: cardDesign.borderRadius,
        }}
      />
      
      <div 
        className="relative overflow-hidden backdrop-blur-2xl hover:backdrop-blur-3xl transition-all duration-500 shadow-2xl"
        style={{
          height: defaultHeight,
          ...cardDesign,
        }}
      >
        {/* 背景图片或渐变 */}
        <div className="absolute inset-0">
          {image ? (
            <img 
              src={image} 
              alt={attraction.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              onError={(e) => {
                console.log('❌ Image failed to load:', image);
                // 图片加载失败时显示渐变背景
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div 
              className="w-full h-full transition-all duration-1000 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.palette[0]}60, ${theme.colors.palette[1]}40, ${theme.colors.palette[2] || theme.colors.palette[0]}60)`
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>

        {/* 内容区域 */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
          {/* 顶部标签和保存按钮 */}
          <div className="flex items-start justify-between">
            <div className="flex flex-wrap gap-2">
              {attraction.tags?.slice(0, 2).map((tag: string, tagIndex: number) => (
                <span 
                  key={tagIndex}
                  className="px-3 py-1 backdrop-blur-sm rounded-full text-xs font-medium border transition-all duration-300 hover:scale-105"
                  style={{
                    background: `${theme.colors.palette[tagIndex % theme.colors.palette.length]}30`,
                    borderColor: `${theme.colors.palette[tagIndex % theme.colors.palette.length]}50`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {/* 保存按钮 */}
            <button 
              onClick={handleSave}
              className={`p-3 backdrop-blur-sm rounded-2xl border transition-all duration-300 hover:scale-110 ${
                isSaved 
                  ? 'bg-red-500/80 border-red-400/50 text-white shadow-lg shadow-red-500/25' 
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              <Heart className={`w-5 h-5 transition-all duration-300 ${isSaved ? 'fill-current scale-110' : ''}`} />
            </button>
          </div>

          {/* 底部内容 */}
          <div className="transform transition-all duration-500 group-hover:translate-y-0 translate-y-2">
            <div className="mb-4">
              <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight">{attraction.name}</h3>
              <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{attraction.description}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {attraction.rating && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-bold">{attraction.rating}</span>
                  </div>
                )}
                
                {attraction.estimatedDuration && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{attraction.estimatedDuration}</span>
                  </div>
                )}
              </div>

              <div className="text-2xl md:text-3xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                {attraction.emoji}
              </div>
            </div>
          </div>
        </div>

        {/* 活跃状态指示器 */}
        {isActive && (
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        )}
      </div>
    </div>
  );
}

// 浮动导航
function FloatingNavigation({ attractions, currentSection, onSectionChange, theme }: any) {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-delay">
      <div className="relative">
        {/* 背景光晕 */}
        <div 
          className="absolute -inset-2 rounded-2xl opacity-50 blur-xl"
          style={{
            background: `linear-gradient(90deg, ${theme.colors.palette[0]}40, ${theme.colors.palette[1]}40)`
          }}
        />
        
        <div className="relative flex items-center gap-3 bg-black/30 backdrop-blur-2xl rounded-2xl px-6 py-4 border border-white/20">
          <div className="flex items-center gap-2">
            {attractions.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => onSectionChange(index)}
                className={`relative w-3 h-3 rounded-full transition-all duration-500 ${
                  currentSection === index 
                    ? 'bg-white scale-150 shadow-lg' 
                    : 'bg-white/40 hover:bg-white/70 hover:scale-125'
                }`}
              >
                {currentSection === index && (
                  <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75" />
                )}
              </button>
            ))}
          </div>
          
          <div className="w-px h-6 bg-white/20 mx-2" />
          
          <div className="text-white/80 text-sm font-medium">
            {currentSection + 1} / {attractions.length}
          </div>
        </div>
      </div>
    </div>
  );
}

// 沉浸式背景生成器
function getImmersiveBackground(soul: string): string {
  const backgrounds = {
    'ancient': `
      radial-gradient(circle at 20% 80%, rgba(180, 134, 11, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.2) 0%, transparent 50%),
      linear-gradient(135deg, #0F172A 0%, #1E293B 25%, #374151 50%, #4B5563 75%, #6B7280 100%)
    `,
    'romantic': `
      radial-gradient(circle at 30% 70%, rgba(244, 114, 182, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(251, 207, 232, 0.2) 0%, transparent 50%),
      linear-gradient(145deg, #1E1B4B 0%, #312E81 25%, #4C1D95 50%, #7C3AED 75%, #8B5CF6 100%)
    `,
    'futuristic': `
      radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.2) 0%, transparent 50%),
      linear-gradient(160deg, #0C0A09 0%, #1C1917 25%, #292524 50%, #44403C 75%, #57534E 100%)
    `,
    'mystical': `
      radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 60%),
      radial-gradient(circle at 60% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 60%),
      linear-gradient(170deg, #0C1445 0%, #1E1B4B 30%, #312E81 60%, #4338CA 80%, #4F46E5 100%)
    `,
    'serene': `
      radial-gradient(circle at 30% 40%, rgba(52, 211, 153, 0.3) 0%, transparent 60%),
      radial-gradient(circle at 70% 60%, rgba(110, 231, 183, 0.2) 0%, transparent 60%),
      linear-gradient(150deg, #064E3B 0%, #065F46 25%, #047857 50%, #059669 75%, #10B981 100%)
    `,
    'vibrant': `
      radial-gradient(circle at 35% 35%, rgba(249, 115, 22, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 65% 65%, rgba(234, 88, 12, 0.2) 0%, transparent 50%),
      linear-gradient(140deg, #7C2D12 0%, #9A3412 25%, #C2410C 50%, #EA580C 75%, #F97316 100%)
    `
  };

  return backgrounds[soul as keyof typeof backgrounds] || backgrounds.ancient;
}

// 动态布局系统 - 6种不同的布局风格
function getLayoutClasses(theme: RadicalUITheme, personality: CityPersonality): string {
  const baseClasses = "relative w-full";
  
  switch (theme.layout.cardArrangement) {
    case 'structured':
      // 结构化网格 - 整齐排列，确保有足够空间
      return `${baseClasses} grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8`;
    case 'flowing':
      // 流动布局 - 自然流动，响应式间距
      return `${baseClasses} flex flex-wrap justify-center items-start gap-4 md:gap-6`;
    case 'scattered':
      // 散点分布 - 随机偏移，但保持基本网格
      return `${baseClasses} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8`;
    case 'chaotic':
      // 混乱布局 - 瀑布流，但限制列数避免过度挤压
      return `${baseClasses} columns-1 md:columns-2 xl:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6`;
    case 'harmonious':
      // 和谐布局 - 大小交替，响应式
      return `${baseClasses} grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12`;
    case 'clustered':
      // 聚集布局 - 紧密排列，但保持最小间距
      return `${baseClasses} flex flex-wrap justify-center gap-3 md:gap-4`;
    default:
      return `${baseClasses} grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8`;
  }
}

function getCardLayoutStyle(theme: RadicalUITheme, personality: CityPersonality, index: number): React.CSSProperties {
  const baseStyle: React.CSSProperties = {};
  
  switch (theme.layout.cardArrangement) {
    case 'scattered':
      // 散点分布 - 随机偏移和旋转
      const offsetX = (Math.sin(index * 2.5) * 20); // 减少偏移量
      const offsetY = (Math.cos(index * 1.8) * 15);
      const rotation = (Math.sin(index * 1.2) * 2); // 减少旋转角度
      return {
        ...baseStyle,
        transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`,
        height: `${380 + (index % 3) * 30}px`, // 不同高度，但更合理
      };
      
    case 'flowing':
      // 流动布局 - 响应式尺寸，不使用固定宽度
      const flowingHeights = [360, 400, 340, 420, 380, 360];
      return {
        ...baseStyle,
        height: `${flowingHeights[index % flowingHeights.length]}px`,
        minWidth: '280px', // 最小宽度而不是固定宽度
        maxWidth: '400px', // 最大宽度
        flex: '1 1 300px', // 弹性布局
        borderRadius: index % 2 === 0 ? '24px' : '16px',
      };
      
    case 'chaotic':
      // 混乱布局 - 瀑布流效果，响应式高度
      return {
        ...baseStyle,
        breakInside: 'avoid',
        marginBottom: `${15 + (index % 3) * 10}px`, // 更规律的间距
        height: `${340 + (index % 4) * 40}px`,
      };
      
    case 'harmonious':
      // 和谐布局 - 交替大小，但保持响应式
      const isLarge = index % 2 === 0;
      return {
        ...baseStyle,
        height: isLarge ? '480px' : '360px',
        transform: isLarge ? 'scale(1.02)' : 'scale(1)', // 减少缩放
      };
      
    case 'clustered':
      // 聚集布局 - 响应式分组大小
      const clusteredHeights = [380, 360, 400, 370, 390, 380];
      return {
        ...baseStyle,
        height: `${clusteredHeights[index % clusteredHeights.length]}px`,
        minWidth: '260px', // 响应式宽度
        maxWidth: '350px',
        flex: '1 1 280px', // 弹性布局
        margin: index % 3 === 1 ? '8px' : '4px',
      };
      
    case 'structured':
    default:
      // 结构化布局 - 统一但有细微变化
      return {
        ...baseStyle,
        height: `${380 + (index % 2) * 20}px`, // 轻微的高度变化
      };
  }
}
export default ImmersiveDestinationExperience;