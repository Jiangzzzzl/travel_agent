'use client';

import { useState, useEffect } from 'react';
import { Heart, Plus, X, MapPin, Sparkles } from 'lucide-react';
import { attractionStore, SavedAttraction } from '@/lib/attraction-store';
import { intelligentAttractionAnalysisSync } from '@/lib/attraction-intelligence';
import { destinationContext } from '@/lib/destination-context';
import { useActions, useUIState } from '@ai-sdk/rsc';
import { nanoid } from 'nanoid';

export function SavedAttractionsPanel() {
  const [attractions, setAttractions] = useState<SavedAttraction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [customAttraction, setCustomAttraction] = useState('');
  const [selectedDays, setSelectedDays] = useState(3); // 默认3天
  const [currentDestination, setCurrentDestination] = useState<string>('');
  const { submitUserMessage } = useActions();
  const [conversation, setConversation] = useUIState();

  useEffect(() => {
    setAttractions(attractionStore.getAttractions());
    
    const unsubscribe = attractionStore.subscribe(() => {
      const newAttractions = attractionStore.getAttractions();
      setAttractions(newAttractions);
    });
    
    return unsubscribe;
  }, []);

  // 监听目的地上下文变化
  useEffect(() => {
    const updateDestination = () => {
      const dest = destinationContext.getCurrentDestination();
      if (dest) {
        setCurrentDestination(dest.name);
        console.log('🎯 SavedAttractionsPanel: Updated destination to:', dest.name);
      }
    };

    // 初始设置
    updateDestination();

    // 监听变化
    const unsubscribe = destinationContext.subscribe(updateDestination);
    return unsubscribe;
  }, []);

  const handleAddCustom = () => {
    if (customAttraction.trim()) {
      const attractionName = customAttraction.trim();
      
      // 如果有当前目的地上下文，在搜索时加上地理限制
      const searchQuery = currentDestination && !attractionName.includes(currentDestination) 
        ? `${currentDestination} ${attractionName}` 
        : attractionName;
      
      console.log('🔍 Searching with destination context:', searchQuery);
      
      // 使用智能分析工具
      const intelligence = intelligentAttractionAnalysisSync(searchQuery);
      
      const attraction: SavedAttraction = {
        id: `custom-${Date.now()}`,
        name: attractionName, // 保持原始名称
        location: intelligence.location || (currentDestination ? `${currentDestination}市` : ''),
        type: intelligence.type as any,
        description: intelligence.description,
        emoji: intelligence.emoji,
        vibeColor: intelligence.color,
      };
      
      attractionStore.addAttraction(attraction);
      setCustomAttraction('');
    }
  };

  const handleGenerateItinerary = async () => {
    if (attractions.length === 0) return;
    
    const attractionNames = attractions.map(a => a.name).join('、');
    const message = `请根据我选择的这些景点生成详细的${selectedDays}天旅行行程：${attractionNames}。请严格按照${selectedDays}天来规划，考虑景点之间的距离、最佳游览顺序、每个景点的推荐游览时间，并生成合理的${selectedDays}日行程安排。必须生成完整的${selectedDays}天行程，不能少于${selectedDays}天。`;
    
    setIsOpen(false);
    
    // 添加用户消息到对话
    setConversation((current: any) => [
      ...current,
      {
        id: nanoid(),
        role: 'user',
        display: <div className="text-sm leading-relaxed">{message}</div>,
      },
    ]);
    
    try {
      const response = await submitUserMessage(message);
      // 添加 AI 响应到对话
      setConversation((current: any) => [...current, response]);
    } catch (error) {
      console.error('生成行程失败:', error);
    }
  };

  return (
    <>
      {/* 浮动按钮 - 现代设计 */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative bg-white/80 backdrop-blur-xl border border-gray-200/50 text-gray-900 p-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <Heart className={`w-6 h-6 ${attractions.length > 0 ? 'fill-current text-red-500' : 'text-gray-600'} transition-colors`} />
                {attractions.length > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {attractions.length}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900">
                  {attractions.length > 0 ? 'My Collection' : 'Save Places'}
                </span>
                <span className="text-xs text-gray-500">
                  {attractions.length > 0 ? `${attractions.length} places` : 'Plan your trip'}
                </span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 面板 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-200/50">
            {/* 头部 */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Heart className="w-6 h-6 text-white fill-current" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {currentDestination ? `${currentDestination} Collection` : 'My Collection'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {currentDestination 
                        ? `${attractions.length} places in ${currentDestination}` 
                        : `${attractions.length} saved places`
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 内容 */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {/* 景点列表 */}
              {attractions.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {attractions.map((attraction) => (
                    <div
                      key={attraction.id}
                      className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-2xl">{attraction.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{attraction.name}</h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span>{attraction.location}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => attractionStore.removeAttraction(attraction.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 mb-6">
                  <div className="text-4xl mb-4">📍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">还没有收藏景点</h3>
                  <p className="text-sm text-gray-500">
                    点击景点卡片上的爱心收藏，或在下方添加自定义景点
                  </p>
                </div>
              )}

              {/* 添加自定义景点 */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  添加其他想去的地方
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAttraction}
                    onChange={(e) => setCustomAttraction(e.target.value)}
                    placeholder={currentDestination ? `在${currentDestination}搜索景点...` : "输入景点名称..."}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                  />
                  <button
                    onClick={handleAddCustom}
                    disabled={!customAttraction.trim()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors"
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* 选择游玩天数 */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  选择游玩天数
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                    <button
                      key={days}
                      onClick={() => setSelectedDays(days)}
                      className={`py-3 rounded-lg font-medium transition-colors ${
                        selectedDays === days
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {days}天
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  已选择 <span className="font-medium text-blue-600">{selectedDays}</span> 天行程
                </p>
              </div>
            </div>

            {/* 底部操作 */}
            <div className="border-t border-gray-200/50 p-6 bg-gradient-to-r from-gray-50/50 to-blue-50/30">
              <div className="flex gap-4">
                {attractions.length > 0 && (
                  <button
                    onClick={() => {
                      attractionStore.clear();
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={handleGenerateItinerary}
                  disabled={attractions.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate {selectedDays}-Day Itinerary {attractions.length > 0 && `(${attractions.length} places)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}