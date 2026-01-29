'use client';

import { useState, useEffect, useRef } from 'react';
import { useActions, useUIState } from '@ai-sdk/rsc';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { ChatMessage } from '@/components/chat-message';
import { DynamicBackground } from '@/components/dynamic-background';
import { SavedAttractionsPanel } from '@/components/saved-attractions-panel';
import { ItineraryTimelinePanel } from '@/components/itinerary-timeline-panel';
import { Send, Sparkles, Plane, Compass, Globe2, Mountain } from 'lucide-react';

export default function TravelAgentPage() {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useUIState(); // 使用全局状态而不是本地状态
  const { submitUserMessage } = useActions();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDestination, setCurrentDestination] = useState('');
  const [showItineraryPanel, setShowItineraryPanel] = useState(true); // 新增：控制行程面板显示
  const router = useRouter();

  // 页面加载时清除对话状态，确保每次刷新都回到最开始的界面
  useEffect(() => {
    console.log('🔄 Home page loaded, clearing conversation state');
    setConversation([]);
    // 同时清除可能残留的localStorage查询
    localStorage.removeItem('travelQuery');
  }, [setConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  // 检测对话中的目的地
  useEffect(() => {
    const lastMessage = conversation[conversation.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      const text = lastMessage.display?.props?.children || '';
      const destinations = ['Xi\'an', 'Xian', '西安', 'Dali', '大理', 'Hangzhou', '杭州', 'Tokyo', '东京', 'Santorini', '圣托里尼', 'Beijing', '北京', 'Shanghai', '上海'];
      for (const dest of destinations) {
        if (text.toLowerCase().includes(dest.toLowerCase())) {
          setCurrentDestination(dest);
          break;
        }
      }
    }
  }, [conversation]);

  // 检测是否是地点搜索 - 更精确的判断，避免拦截正常的旅游查询
  const isPlaceSearch = (text: string) => {
    // 只有非常具体的景点名称才跳转到规划页面
    // 一般的旅游查询应该让AI处理
    const specificPlaceKeywords = [
      '故宫', '天安门', '长城', '西湖', '外滩', '东方明珠', '兵马俑', '大雁塔',
      // 移除通用的城市名和旅游词汇，让AI来处理这些查询
    ];
    
    const lowerText = text.toLowerCase();
    return specificPlaceKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 Form submitted, input:', input);
    
    if (!input.trim() || isLoading) {
      console.log('⚠️ Submission blocked:', { 
        emptyInput: !input.trim(), 
        isLoading 
      });
      return;
    }

    const userInput = input;
    
    // 暂时禁用地点搜索跳转，让所有查询都通过AI处理
    // 这样可以确保destinationHero组件被正确生成
    const shouldRedirectToPlanning = false; // isPlaceSearch(userInput);
    
    if (shouldRedirectToPlanning) {
      console.log('🗺️ Detected place search, redirecting to planning page...');
      // 将搜索内容存储到 localStorage，以便在规划页面使用
      localStorage.setItem('travelQuery', userInput);
      router.push('/planning');
      return;
    }

    // 否则继续正常的对话流程
    setInput('');
    setIsLoading(true);
    
    console.log('✅ Submitting message:', userInput);

    setConversation((current: any) => [
      ...current,
      {
        id: nanoid(),
        role: 'user',
        display: <div className="text-sm leading-relaxed">{userInput}</div>,
        text: userInput, // 添加text字段用于目的地检测
        content: userInput, // 添加content字段作为备用
      },
    ]);

    try {
      console.log('📤 Calling submitUserMessage...');
      const response = await submitUserMessage(userInput);
      console.log('📥 Response received:', response);
      setConversation((current: any) => [...current, response]);
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setIsLoading(false);
      console.log('✅ Loading complete');
    }
  };

  const quickPrompts = [
    { 
      icon: <Mountain className="w-5 h-5" />, 
      text: 'Xi An 3-Day Culture Trip'
    },
    { 
      icon: <Globe2 className="w-5 h-5" />, 
      text: 'Dali Erhai Lake Tour'
    },
    { 
      icon: <Compass className="w-5 h-5" />, 
      text: 'Santorini Sunset Route'
    },
    { 
      icon: <Plane className="w-5 h-5" />, 
      text: 'Tokyo Anime Pilgrimage'
    },
  ];

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden">
      {/* Dynamic Background based on destination */}
      <DynamicBackground destination={currentDestination} />

      {/* Content - 主内容区域，当行程面板可见时添加右侧 margin */}
      <div className={`relative z-10 flex flex-col h-full w-full transition-all duration-300 ${
        conversation.length > 0 && showItineraryPanel ? 'mr-[360px]' : ''
      }`}>
        {/* Header */}
        <header className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Travel Agent
                  </h1>
                  <p className="text-sm text-gray-500">
                    {currentDestination ? `Exploring ${currentDestination}` : 'AI Travel Planning Assistant'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-8 w-full"
        >
          <div className="max-w-4xl mx-auto w-full px-2 md:px-4">
            {conversation.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] w-full">
                {/* Hero Section */}
                <div className="text-center mb-16 w-full">
                  <div className="relative inline-block mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
                  </div>
                  <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                    Explore the World
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Tell me your travel dreams, and I'll create your{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                      personalized journey
                    </span>
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(prompt.text)}
                      className="group relative p-8 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl text-left transition-all duration-300 hover:bg-white/80 hover:border-gray-300/50 hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {prompt.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-semibold text-gray-900 mb-1">
                            {prompt.text}
                          </p>
                          <p className="text-sm text-gray-500">Click to start planning →</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Features */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
                  {['🎨 Generative UI', '🤖 AI Powered', '⚡ Real-time', '🌍 Global Coverage'].map((tag, idx) => (
                    <div 
                      key={idx}
                      className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-full text-sm font-medium text-gray-700 shadow-sm"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-8 w-full">
                {conversation.map((message: any) => (
                  <ChatMessage key={message.id} role={message.role}>
                    {message.display}
                  </ChatMessage>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl px-6 py-4 shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                          AI is planning for you...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-6">
          <form 
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto w-full"
          >
            <div className="relative">
              <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg focus-within:border-blue-300 focus-within:shadow-xl transition-all duration-300">
                <input
                  className="flex-1 bg-transparent px-6 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none text-lg"
                  placeholder="Describe your travel dream, e.g., I want to see Erhai Lake in Dali..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="m-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Powered by AI • Generative UI Experience • Real-time Intelligence
            </p>
          </form>
        </div>
      </div>

      {/* 收藏景点面板 - 已被右侧行程面板替代，暂时隐藏 */}
      {/* <SavedAttractionsPanel /> */}
      
      {/* 右侧行程时间轴面板 */}
      <ItineraryTimelinePanel />
    </div>
  );
}
