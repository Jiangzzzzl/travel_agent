'use client';

import { useState } from 'react';
import { jimengAIService } from '../../lib/jimeng-ai-service';

export default function TestSimpleImagePage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(message);
  };

  const testImageGeneration = async () => {
    setIsLoading(true);
    setImageUrl(null);
    setLogs([]);
    
    addLog('🧪 开始测试图片生成...');
    
    try {
      // 获取服务状态
      const status = jimengAIService.getServiceStatus();
      addLog(`📊 服务状态: 配置=${status.isConfigured}, 认证方式=${status.authMethod}`);
      
      // 测试目的地图片生成
      addLog('🎨 调用 generateDestinationImage("北京", "cinematic")...');
      const result = await jimengAIService.generateDestinationImage('北京', 'cinematic');
      
      if (result) {
        addLog(`✅ 图片生成成功: ${result}`);
        setImageUrl(result);
      } else {
        addLog('❌ 图片生成失败，返回null');
      }
    } catch (error) {
      addLog(`❌ 错误: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testUnsplashDirect = () => {
    addLog('🔗 测试直接Unsplash URL...');
    const directUrl = 'https://source.unsplash.com/1792x1024/?beijing+travel+landscape+architecture+city+landmark+scenic+beautiful&fit=crop&crop=center&auto=format&q=90&fm=jpg';
    addLog(`📸 直接URL: ${directUrl}`);
    setImageUrl(directUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧪 简单图片生成测试
          </h1>
          <p className="text-xl text-gray-300">
            直接测试图片生成功能
          </p>
        </div>

        {/* 测试按钮 */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={testImageGeneration}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? '🔄 生成中...' : '🎨 测试AI图片生成'}
          </button>
          
          <button
            onClick={testUnsplashDirect}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
          >
            🖼️ 测试Unsplash直接URL
          </button>
        </div>

        {/* 图片显示 */}
        {imageUrl && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">📸 生成的图片</h2>
            <div className="text-center">
              <div className="relative inline-block">
                <img 
                  src={imageUrl} 
                  alt="Generated"
                  className="max-w-full h-auto rounded-lg border border-white/20 mx-auto"
                  onLoad={() => addLog('✅ 图片加载成功')}
                  onError={(e) => {
                    addLog('❌ 图片加载失败，尝试备用方案');
                    // 尝试备用图片
                    const img = e.target as HTMLImageElement;
                    const randomSeed = Math.floor(Math.random() * 1000);
                    const backupUrl = `https://picsum.photos/800/600?random=${randomSeed}`;
                    if (img.src !== backupUrl) {
                      img.src = backupUrl;
                      addLog(`🔄 使用备用图片: ${backupUrl}`);
                    }
                  }}
                />
                {/* 加载指示器 */}
                <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">点击查看原图</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2 break-all">
                URL: {imageUrl}
              </div>
              {/* 测试按钮 */}
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  onClick={() => window.open(imageUrl, '_blank')}
                  className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm hover:bg-blue-500/30 transition-colors"
                >
                  在新窗口打开
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(imageUrl);
                    addLog('📋 URL已复制到剪贴板');
                  }}
                  className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm hover:bg-green-500/30 transition-colors"
                >
                  复制URL
                </button>
                <button
                  onClick={async () => {
                    addLog('🔄 重新生成图片...');
                    const newUrl = await jimengAIService.generateDestinationImage('北京', 'cinematic');
                    if (newUrl) {
                      setImageUrl(newUrl);
                      addLog(`✅ 新图片: ${newUrl}`);
                    }
                  }}
                  className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded text-sm hover:bg-purple-500/30 transition-colors"
                >
                  重新生成
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 日志显示 */}
        {logs.length > 0 && (
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">📝 测试日志</h2>
            <div className="bg-black/50 rounded-xl p-4 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-green-400 font-mono text-sm mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-blue-400 mb-2">💡 测试说明</h3>
          <div className="text-blue-200 text-sm space-y-2">
            <p>• 这个页面用于直接测试图片生成功能</p>
            <p>• 如果BytePlus API不可用，会自动使用Unsplash备用图片</p>
            <p>• 可以测试直接Unsplash URL来验证图片加载</p>
            <p>• 所有操作都会在日志中显示详细信息</p>
          </div>
        </div>
      </div>
    </div>
  );
}