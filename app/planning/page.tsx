'use client';

import { useState, useEffect, useRef } from 'react';
import { useActions, useUIState } from '@ai-sdk/rsc';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { ChatMessage } from '@/components/chat-message';
import { DynamicBackground } from '@/components/dynamic-background';
import { ItineraryTimelinePanel } from '@/components/itinerary-timeline-panel';
import { Send, Sparkles, ArrowLeft } from 'lucide-react';

export default function PlanningPage() {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useUIState();
  const { submitUserMessage } = useActions();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDestination, setCurrentDestination] = useState('');
  const [initialQuery, setInitialQuery] = useState('');
  const router = useRouter();

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

  // 页面加载时处理初始查询和状态清除
  useEffect(() => {
    const query = localStorage.getItem('travelQuery');
    if (query) {
      console.log('🔄 Planning page loaded with query, clearing previous state');
      // 先清除之前的对话状态
      setConversation([]);
      
      setInitialQuery(query);
      localStorage.removeItem('travelQuery'); // 清除存储的查询
      
      // 延迟一点再自动发送消息，确保状态已清除
      setTimeout(() => {
        handleAutoSubmit(query);
      }, 100);
    } else {
      // 如果没有查询参数，说明是直接访问或刷新，重定向到主页
      console.log('🔄 No query found, redirecting to home page');
      router.push('/');
    }
  }, [setConversation, router]);

  const handleAutoSubmit = async (userInput: string) => {
    console.log('🤖 Auto-submitting initial query:', userInput);
    setIsLoading(true);

    setConversation((current: any) => [
      ...current,
      {
        id: nanoid(),
        role: 'user',
        display: <div className="text-sm leading-relaxed">{userInput}</div>, // React 元素用于显示
        content: userInput, // 纯字符串用于处理
        text: userInput, // 添加纯文本属性用于目的地检测
      },
    ]);

    try {
      const response = await submitUserMessage(userInput);
      setConversation((current: any) => [...current, response]);
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) {
      return;
    }

    const userInput = input;
    setInput('');
    setIsLoading(true);

    setConversation((current: any) => [
      ...current,
      {
        id: nanoid(),
        role: 'user',
        display: <div className="text-sm leading-relaxed">{userInput}</div>, // React 元素用于显示
        content: userInput, // 纯字符串用于处理
        text: userInput, // 添加纯文本属性用于目的地检测
      },
    ]);

    try {
      const response = await submitUserMessage(userInput);
      setConversation((current: any) => [...current, response]);
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { text: 'Recommend more attractions' },
    { text: 'Optimize itinerary' },
    { text: 'Add food recommendations' },
    { text: 'Plan transportation routes' },
  ];

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden">
      {/* Dynamic Background */}
      <DynamicBackground destination={currentDestination} />

      {/* Content - 主内容区域，右侧留出行程面板空间 */}
      <div className="relative z-10 flex flex-col h-full w-full mr-[360px]">
        {/* Header */}
        <header className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Trip Planning
                  </h1>
                  <p className="text-sm text-gray-500">
                    {currentDestination ? `Planning for ${currentDestination}` : 'AI Travel Planning Assistant'}
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
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Creating your itinerary...
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    {initialQuery ? `Based on your request: "${initialQuery}"` : 'Please wait, AI is generating a personalized travel plan for you'}
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {conversation.map((message: any) => (
                  <ChatMessage key={message.id} role={message.role}>
                    {message.display}
                  </ChatMessage>
                ))}
                
                {/* Quick Actions */}
                {conversation.length > 0 && (
                  <div className="mt-8">
                    <p className="text-sm text-gray-500 mb-4">Quick Actions:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {quickPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(prompt.text)}
                          className="p-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg text-left text-sm hover:bg-white/80 hover:border-gray-300/50 transition-all duration-200"
                        >
                          {prompt.text}
                        </button>
                      ))}
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
                  placeholder="Continue refining your itinerary, or ask for more suggestions..."
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
              AI Smart Planning • Real-time Optimization • Personalized Recommendations
            </p>
          </form>
        </div>
      </div>

      {/* 右侧行程时间轴面板 */}
      <ItineraryTimelinePanel forceVisible={true} />
    </div>
  );
}