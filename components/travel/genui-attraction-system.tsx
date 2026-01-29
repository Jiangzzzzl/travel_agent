'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, MapPin, Star, Clock, Camera, Sparkles, Grid, List, Map } from 'lucide-react';
import { attractionStore, SavedAttraction } from '@/lib/attraction-store';
import { itineraryStore } from '@/lib/itinerary-store';

// GenUI风格的组件目录 - 定义可用的UI组件类型
interface GenUIComponentCatalog {
  'attraction-card': AttractionCardProps;
  'attraction-grid': AttractionGridProps;
  'attraction-list': AttractionListProps;
  'attraction-map': AttractionMapProps;
  'filter-bar': FilterBarProps;
  'sort-controls': SortControlsProps;
}

// 数据模型 - 中心化的状态管理
interface AttractionDataModel {
  attractions: AttractionData[];
  filters: {
    type: string[];
    rating: number;
    tags: string[];
  };
  sortBy: 'name' | 'rating' | 'type' | 'distance';
  viewMode: 'grid' | 'list' | 'map';
  selectedAttraction: string | null;
}

interface AttractionData {
  id: string;
  name: string;
  type: 'historical' | 'nature' | 'food' | 'modern' | 'cultural' | 'beach';
  location: string;
  description: string;
  tags: string[];
  vibeColor: string;
  emoji?: string;
  rating?: number;
  bestTime?: string;
  estimatedDuration?: string;
  coordinates?: { lat: number; lng: number };
  imageUrl?: string;
}

// 组件属性接口
interface AttractionCardProps {
  attraction: AttractionData;
  variant: 'compact' | 'detailed' | 'minimal';
  onSelect?: (id: string) => void;
  onLike?: (id: string) => void;
}

interface AttractionGridProps {
  attractions: AttractionData[];
  columns: 1 | 2 | 3 | 4;
  gap: 'sm' | 'md' | 'lg';
  cardVariant: 'compact' | 'detailed' | 'minimal';
}

interface AttractionListProps {
  attractions: AttractionData[];
  showImages: boolean;
  compact: boolean;
}

interface AttractionMapProps {
  attractions: AttractionData[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

interface FilterBarProps {
  availableTypes: string[];
  availableTags: string[];
  onFilterChange: (filters: any) => void;
}

interface SortControlsProps {
  options: Array<{ value: string; label: string }>;
  currentSort: string;
  onSortChange: (sort: string) => void;
}

// GenUI风格的主要组件
export function GenUIAttractionSystem({ 
  attractions: initialAttractions = [],
  destination = '',
  layout = 'adaptive'
}: {
  attractions?: any[];
  destination?: string;
  layout?: 'adaptive' | 'grid' | 'list' | 'map';
}) {
  // 数据模型状态
  const [dataModel, setDataModel] = useState<AttractionDataModel>({
    attractions: [],
    filters: { type: [], rating: 0, tags: [] },
    sortBy: 'rating',
    viewMode: layout === 'adaptive' ? 'grid' : layout as any,
    selectedAttraction: null
  });

  // 初始化数据
  useEffect(() => {
    const formattedAttractions: AttractionData[] = initialAttractions.map((attr, index) => ({
      id: `${attr.name}-${index}`,
      name: attr.name || '',
      type: attr.attractionType || attr.type || 'cultural',
      location: attr.location || '',
      description: attr.description || '',
      tags: attr.tags || [],
      vibeColor: attr.vibeColor || '#8B5CF6',
      emoji: attr.emoji,
      rating: attr.rating,
      bestTime: attr.bestTime,
      estimatedDuration: attr.estimatedDuration,
      coordinates: attr.coordinates,
      imageUrl: attr.imageUrl
    }));

    setDataModel(prev => ({
      ...prev,
      attractions: formattedAttractions
    }));
  }, [initialAttractions]);

  // 响应式数据更新函数
  const updateDataModel = useCallback((updates: Partial<AttractionDataModel>) => {
    setDataModel(prev => ({ ...prev, ...updates }));
  }, []);

  // 过滤和排序逻辑
  const filteredAndSortedAttractions = dataModel.attractions
    .filter(attraction => {
      const typeMatch = dataModel.filters.type.length === 0 || 
                       dataModel.filters.type.includes(attraction.type);
      const ratingMatch = !dataModel.filters.rating || 
                         (attraction.rating && attraction.rating >= dataModel.filters.rating);
      const tagMatch = dataModel.filters.tags.length === 0 ||
                      dataModel.filters.tags.some(tag => attraction.tags.includes(tag));
      
      return typeMatch && ratingMatch && tagMatch;
    })
    .sort((a, b) => {
      switch (dataModel.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  // 获取可用的过滤选项
  const availableTypes = [...new Set(dataModel.attractions.map(a => a.type))];
  const availableTags = [...new Set(dataModel.attractions.flatMap(a => a.tags))];

  // 自适应布局逻辑
  const getAdaptiveLayout = (): { columns: 1 | 2 | 3 | 4; cardVariant: 'compact' | 'detailed' | 'minimal' } => {
    const count = filteredAndSortedAttractions.length;
    if (count <= 2) return { columns: 1, cardVariant: 'detailed' };
    if (count <= 6) return { columns: 2, cardVariant: 'detailed' };
    return { columns: 3, cardVariant: 'compact' };
  };

  const adaptiveLayout = getAdaptiveLayout();

  return (
    <div className="w-full space-y-6">
      {/* GenUI控制面板 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* 标题和统计 */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {destination ? `${destination} 景点推荐` : '景点推荐'}
              </h2>
              <p className="text-sm text-gray-600">
                共 {dataModel.attractions.length} 个景点，显示 {filteredAndSortedAttractions.length} 个
              </p>
            </div>
          </div>

          {/* 视图模式切换 */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { mode: 'grid', icon: Grid, label: '网格' },
                { mode: 'list', icon: List, label: '列表' },
                { mode: 'map', icon: Map, label: '地图' }
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => updateDataModel({ viewMode: mode as any })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    dataModel.viewMode === mode
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 过滤和排序控件 */}
        <GenUIFilterBar
          availableTypes={availableTypes}
          availableTags={availableTags}
          currentFilters={dataModel.filters}
          onFilterChange={(filters) => updateDataModel({ filters })}
        />

        <GenUISortControls
          currentSort={dataModel.sortBy}
          onSortChange={(sortBy) => updateDataModel({ sortBy: sortBy as any })}
        />
      </div>

      {/* 动态内容渲染 */}
      <div className="min-h-[400px]">
        {filteredAndSortedAttractions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">没有找到匹配的景点</h3>
            <p className="text-gray-600">尝试调整筛选条件或清除所有筛选</p>
          </div>
        ) : (
          <>
            {dataModel.viewMode === 'grid' && (
              <GenUIAttractionGrid
                attractions={filteredAndSortedAttractions}
                columns={adaptiveLayout.columns}
                gap="md"
                cardVariant={adaptiveLayout.cardVariant}
              />
            )}
            
            {dataModel.viewMode === 'list' && (
              <GenUIAttractionList
                attractions={filteredAndSortedAttractions}
                showImages={true}
                compact={false}
              />
            )}
            
            {dataModel.viewMode === 'map' && (
              <GenUIAttractionMap
                attractions={filteredAndSortedAttractions}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// GenUI组件目录中的具体组件实现
function GenUIFilterBar({ 
  availableTypes, 
  availableTags, 
  currentFilters, 
  onFilterChange 
}: {
  availableTypes: string[];
  availableTags: string[];
  currentFilters: any;
  onFilterChange: (filters: any) => void;
}) {
  const typeLabels: Record<string, string> = {
    historical: '历史古迹',
    nature: '自然风光',
    food: '美食体验',
    modern: '现代都市',
    cultural: '文化艺术',
    beach: '海滨度假'
  };

  return (
    <div className="mt-4 space-y-3">
      {/* 类型筛选 */}
      {availableTypes.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">景点类型</label>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map(type => (
              <button
                key={type}
                onClick={() => {
                  const newTypes = currentFilters.type.includes(type)
                    ? currentFilters.type.filter((t: string) => t !== type)
                    : [...currentFilters.type, type];
                  onFilterChange({ ...currentFilters, type: newTypes });
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  currentFilters.type.includes(type)
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {typeLabels[type] || type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 标签筛选 */}
      {availableTags.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">标签</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.slice(0, 10).map(tag => (
              <button
                key={tag}
                onClick={() => {
                  const newTags = currentFilters.tags.includes(tag)
                    ? currentFilters.tags.filter((t: string) => t !== tag)
                    : [...currentFilters.tags, tag];
                  onFilterChange({ ...currentFilters, tags: newTags });
                }}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  currentFilters.tags.includes(tag)
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GenUISortControls({ 
  currentSort, 
  onSortChange 
}: {
  currentSort: string;
  onSortChange: (sort: string) => void;
}) {
  const sortOptions = [
    { value: 'rating', label: '评分排序' },
    { value: 'name', label: '名称排序' },
    { value: 'type', label: '类型排序' }
  ];

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">排序：</span>
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function GenUIAttractionGrid({ 
  attractions, 
  columns, 
  gap, 
  cardVariant 
}: AttractionGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8'
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]}`}>
      {attractions.map((attraction, index) => (
        <GenUIAttractionCard
          key={attraction.id}
          attraction={attraction}
          variant={cardVariant}
        />
      ))}
    </div>
  );
}

function GenUIAttractionList({ 
  attractions, 
  showImages, 
  compact 
}: AttractionListProps) {
  return (
    <div className="space-y-4">
      {attractions.map(attraction => (
        <GenUIAttractionCard
          key={attraction.id}
          attraction={attraction}
          variant="minimal"
        />
      ))}
    </div>
  );
}

function GenUIAttractionMap({ attractions }: AttractionMapProps) {
  return (
    <div className="bg-gray-100 rounded-2xl p-8 text-center">
      <div className="text-4xl mb-4">🗺️</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">地图视图</h3>
      <p className="text-gray-600 mb-4">
        显示 {attractions.length} 个景点的地理位置
      </p>
      <div className="text-sm text-gray-500">
        地图功能开发中...
      </div>
    </div>
  );
}

function GenUIAttractionCard({ 
  attraction, 
  variant, 
  onSelect, 
  onLike 
}: AttractionCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isInItinerary, setIsInItinerary] = useState(false);
  const [addedDay, setAddedDay] = useState<number | null>(null);

  useEffect(() => {
    setIsLiked(attractionStore.isLiked(attraction.id));
    setIsInItinerary(itineraryStore.isInItinerary(attraction.name));
    setAddedDay(itineraryStore.getAttractionDay(attraction.name));
    
    const unsubscribeAttraction = attractionStore.subscribe(() => {
      setIsLiked(attractionStore.isLiked(attraction.id));
    });
    
    const unsubscribeItinerary = itineraryStore.subscribe(() => {
      setIsInItinerary(itineraryStore.isInItinerary(attraction.name));
      setAddedDay(itineraryStore.getAttractionDay(attraction.name));
    });
    
    return () => {
      unsubscribeAttraction();
      unsubscribeItinerary();
    };
  }, [attraction.id, attraction.name]);

  const handleLikeToggle = async () => {
    const savedAttraction: SavedAttraction = {
      id: attraction.id,
      name: attraction.name,
      location: attraction.location,
      type: attraction.type,
      description: attraction.description,
      emoji: attraction.emoji || '📍',
      vibeColor: attraction.vibeColor,
      rating: attraction.rating,
    };

    if (isLiked) {
      attractionStore.removeAttraction(attraction.id);
      // 从行程中移除
      const allDayPlans = itineraryStore.getAllDayPlans();
      allDayPlans.forEach(dayPlan => {
        dayPlan.attractions.forEach((attr, index) => {
          if (attr.name === attraction.name) {
            itineraryStore.removeAttractionFromDay(dayPlan.day, attr.id, index);
          }
        });
      });
    } else {
      attractionStore.addAttraction(savedAttraction);
      
      // 添加到行程
      const day = await itineraryStore.addAttractionAuto({
        id: attraction.id,
        name: attraction.name,
        location: attraction.location,
        emoji: attraction.emoji || '📍',
        vibeColor: attraction.vibeColor,
        estimatedDuration: attraction.estimatedDuration || '2小时'
      });
      setAddedDay(day);
    }

    onLike?.(attraction.id);
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
        <div className="text-2xl">{attraction.emoji || '📍'}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{attraction.name}</h3>
          <p className="text-sm text-gray-600">{attraction.location}</p>
        </div>
        <div className="flex items-center gap-2">
          {attraction.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>{attraction.rating}</span>
            </div>
          )}
          <button
            onClick={handleLikeToggle}
            className={`p-2 rounded-full transition-colors ${
              isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{attraction.emoji || '📍'}</span>
              <h3 className="font-bold text-gray-900 text-lg">{attraction.name}</h3>
            </div>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{attraction.location}</span>
            </div>
          </div>
          
          <button
            onClick={handleLikeToggle}
            className={`p-2 rounded-full transition-all ${
              isLiked 
                ? 'bg-red-100 text-red-600 scale-110' 
                : 'bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            {isInItinerary && addedDay && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                D{addedDay}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="p-4">
        <p className="text-gray-700 text-sm leading-relaxed mb-4">
          {attraction.description}
        </p>

        {/* 评分和时间 */}
        <div className="flex items-center gap-3 mb-4">
          {attraction.rating && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{attraction.rating}</span>
            </div>
          )}
          {attraction.estimatedDuration && (
            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{attraction.estimatedDuration}</span>
            </div>
          )}
        </div>

        {/* 标签 */}
        {attraction.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {attraction.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" />
            拍照
          </button>
          <button 
            onClick={handleLikeToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isInItinerary 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInItinerary ? 'fill-current' : ''}`} />
            {isInItinerary ? `第${addedDay}天` : '加入'}
          </button>
        </div>
      </div>
    </div>
  );
}