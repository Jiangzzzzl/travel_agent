'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ImmersiveFullscreenWrapperProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export function ImmersiveFullscreenWrapper({ children, onClose }: ImmersiveFullscreenWrapperProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // 延迟显示全屏，让动画更流畅
    const timer = setTimeout(() => {
      setIsFullscreen(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsFullscreen(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  return (
    <>
      {/* 全屏遮罩 */}
      <div 
        className={`fixed inset-0 z-[9999] transition-all duration-500 ${
          isFullscreen ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #374151 100%)'
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="fixed top-6 right-6 z-[10000] p-3 bg-black/50 hover:bg-black/70 text-white rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 沉浸式内容 */}
        <div className={`w-full h-full transition-all duration-700 ${
          isFullscreen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
          {children}
        </div>
      </div>

      {/* 预览卡片 - 显示在聊天中 */}
      <div className="relative group cursor-pointer" onClick={() => setIsFullscreen(true)}>
        <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-white/20">
          {/* 预览内容 */}
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">🌟 沉浸式体验已生成</h3>
              <p className="text-white/80 mb-4">点击进入全屏沉浸式旅行体验</p>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <span>点击体验</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 装饰性背景 */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-4 w-8 h-8 bg-blue-400/30 rounded-full animate-pulse" />
            <div className="absolute top-12 right-8 w-6 h-6 bg-purple-400/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-8 left-12 w-4 h-4 bg-pink-400/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-4 right-4 w-10 h-10 bg-indigo-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      </div>
    </>
  );
}