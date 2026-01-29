'use client';

import { useState, useEffect } from 'react';
import { Heart, Plus, X, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { attractionStore, SavedAttraction } from '@/lib/attraction-store';
import { intelligentAttractionAnalysisSync } from '@/lib/attraction-intelligence';
import { useActions, useUIState } from '@ai-sdk/rsc';
import { nanoid } from 'nanoid';

export function SavedAttractionsSummary() {
  const [attractions, setAttractions] = useState<SavedAttraction[]>([]);
  const [customAttraction, setCustomAttraction] = useState('');
  const [selectedDays, setSelectedDays] = useState(3);
  const { submitUserMessage } = useActions();
  const [conversation, setConversation] = useUIState();

  useEffect(() => {
    setAttractions(attractionStore.getAttractions());
    
    const unsubscribe = attractionStore.subscribe(() => {
      setAttractions(attractionStore.getAttractions());
    });
    
    return unsubscribe;
  }, []);

  const handleAddCustom = () => {
    if (customAttraction.trim()) {
      const attractionName = customAttraction.trim();
      
      // 使用智能分析工具
      const intelligence = intelligentAttractionAnalysisSync(attractionName);
      
      const attraction: SavedAttraction = {
        id: `custom-${Date.now()}`,
        name: attractionName,
        location: intelligence.location,
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
    console.log('🎯 handleGenerateItinerary called');
    console.log('🎯 attractions:', attractions);
    console.log('🎯 selectedDays:', selectedDays);
    
    if (attractions.length === 0) {
      console.log('⚠️ No attractions, returning');
      return;
    }
    
    const attractionNames = attractions.map(a => a.name).join('、');
    // 强调天数，使用多种表达方式
    const message = `我要规划一个${selectedDays}天的旅行行程。请根据我选择的这些景点：${attractionNames}，生成一个完整的${selectedDays}天（${selectedDays}日）旅行计划。

重要要求：
1. 必须是${selectedDays}天的行程，不能多也不能少
2. 每天要包含这些景点中的部分景点
3. 考虑景点之间的距离和游览顺序
4. 每个景点安排合理的游览时间
5. 包含早中晚餐建议

请生成${selectedDays}天的详细行程规划。`;
    
    console.log('📝 Generated message:', message);
    
    // 添加用户消息到对话
    setConversation((current: any) => {
      console.log('📝 Current conversation:', current);
      return [
        ...current,
        {
          id: nanoid(),
          role: 'user',
          display: <div className="text-sm leading-relaxed">{message}</div>,
        },
      ];
    });
    
    try {
      console.log('🚀 Calling submitUserMessage...');
      const response = await submitUserMessage(message);
      console.log('✅ Response received:', response);
      setConversation((current: any) => [...current, response]);
    } catch (error) {
      console.error('❌ 生成行程失败:', error);
    }
  };

  return (
    <div className="my-6 relative group animate-in-up">
      <div 
        className="absolute -inset-1 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500"
      />
      
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-pink-200">
        {/* 标题 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              我的收藏景点
            </h3>
            <p className="text-sm text-slate-600">
              {attractions.length > 0 
                ? `已收藏 ${attractions.length} 个景点，继续添加或生成行程` 
                : '点击景点卡片上的爱心收藏，或手动添加景点'}
            </p>
          </div>
        </div>

        {/* 收藏的景点列表 */}
        {attractions.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100"
                >
                  <span className="text-2xl">{attraction.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{attraction.name}</h4>
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{attraction.location}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => attractionStore.removeAttraction(attraction.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 添加自定义景点 */}
        <div className="mb-6 p-4 bg-slate-50 rounded-2xl">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加其他想去的地方
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={customAttraction}
              onChange={(e) => setCustomAttraction(e.target.value)}
              placeholder="输入景点名称，如：灵隐寺、西湖..."
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
            />
            <button
              onClick={handleAddCustom}
              disabled={!customAttraction.trim()}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
            >
              添加
            </button>
          </div>
        </div>

        {/* 选择天数 */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            选择游玩天数
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedDays(days)}
                className={`py-3 rounded-xl font-bold transition-all duration-200 ${
                  selectedDays === days
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {days}天
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3 text-center">
            已选择 <span className="font-bold text-pink-600">{selectedDays}</span> 天行程
          </p>
        </div>

        {/* 生成行程按钮 */}
        <div className="flex gap-3">
          {attractions.length > 0 && (
            <button
              onClick={() => {
                attractionStore.clear();
              }}
              className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-semibold"
            >
              清空收藏
            </button>
          )}
          <button
            onClick={handleGenerateItinerary}
            disabled={attractions.length === 0}
            className="flex-1 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-600 hover:via-pink-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-[1.02]"
          >
            <Sparkles className="w-6 h-6" />
            <span className="text-lg">
              生成 {selectedDays} 天专属行程
              {attractions.length > 0 && ` (${attractions.length}个景点)`}
            </span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
