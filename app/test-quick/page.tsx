'use client';

import { useState } from 'react';
import { jimengAIService } from '../../lib/jimeng-ai-service';

export default function TestQuickPage() {
  const [result, setResult] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testImageUrls = async () => {
    setIsLoading(true);
    setResult('开始测试图片URL...\n');
    
    const testUrls = [
      {
        name: 'Picsum - 随机图片',
        url: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`
      },
      {
        name: 'Lorem Picsum - 指定ID',
        url: 'https://picsum.photos/id/1018/800/600'
      },
      {
        name: 'Placeholder.com',
        url: 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Travel+Destination'
      }
    ];
    
    for (const testCase of testUrls) {
      setResult(prev => prev + `测试: ${testCase.name}\n`);
      setResult(prev => prev + `URL: ${testCase.url}\n`);
      
      try {
        const img = new Image();
        const loadPromise = new Promise((resolve, reject) => {
          img.onload = () => resolve('success');
          img.onerror = () => reject('failed');
          setTimeout(() => reject('timeout'), 5000);
        });
        
        img.src = testCase.url;
        await loadPromise;
        
        setResult(prev => prev + `✅ ${testCase.name} - 加载成功\n`);
        setImageUrl(testCase.url);
        break; // 使用第一个成功的图片
      } catch (error) {
        setResult(prev => prev + `❌ ${testCase.name} - 加载失败\n`);
      }
    }
    
    setIsLoading(false);
  };

  const testImageGeneration = async () => {
    setIsLoading(true);
    setResult('🎨 测试 Fal.ai ByteDance Seedream v4.5 图片生成\n开始测试...\n');
    
    try {
      // 测试服务状态
      const status = jimengAIService.getServiceStatus();
      setResult(prev => prev + `服务状态: ${status.isConfigured ? '已配置' : '未配置'}\n`);
      setResult(prev => prev + `认证方式: ${status.authMethod}\n`);
      setResult(prev => prev + `API端点: ${status.baseUrl}\n`);
      setResult(prev => prev + `推荐操作: ${status.recommendedAction}\n\n`);
      
      // 测试图片生成
      setResult(prev => prev + '正在生成图片...\n');
      setResult(prev => prev + '目标: 北京故宫，电影级画质\n');
      
      const url = await jimengAIService.generateDestinationImage('北京', 'cinematic');
      
      if (url) {
        setResult(prev => prev + `✅ 图片生成成功!\n`);
        setResult(prev => prev + `URL: ${url}\n`);
        setResult(prev => prev + `类型: ${status.isConfigured ? 'Fal.ai ByteDance Seedream v4.5' : 'Picsum 高质量备用图片'}\n`);
        setImageUrl(url);
      } else {
        setResult(prev => prev + '❌ 图片生成失败\n');
      }
    } catch (error) {
      setResult(prev => prev + `❌ 错误: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🧪 快速图片测试</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={testImageGeneration}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg"
          >
            {isLoading ? '测试中...' : '🎨 测试图片生成'}
          </button>
          
          <button
            onClick={testImageUrls}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg"
          >
            {isLoading ? '测试中...' : '🔗 测试图片URL'}
          </button>
        </div>

        {result && (
          <div className="bg-black/50 rounded-lg p-4 mb-6">
            <pre className="text-green-400 text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        {imageUrl && (
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white font-bold mb-4">生成的图片:</h3>
            <img 
              src={imageUrl} 
              alt="Generated" 
              className="max-w-full h-auto rounded-lg"
              onLoad={() => setResult(prev => prev + '✅ 图片加载成功\n')}
              onError={(e) => {
                setResult(prev => prev + '❌ 图片加载失败，尝试备用方案\n');
                // 尝试备用图片
                const img = e.target as HTMLImageElement;
                const randomSeed = Math.floor(Math.random() * 1000);
                const backupUrl = `https://picsum.photos/800/600?random=${randomSeed}`;
                if (img.src !== backupUrl) {
                  img.src = backupUrl;
                  setResult(prev => prev + `🔄 使用备用图片: ${backupUrl}\n`);
                }
              }}
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.open(imageUrl, '_blank')}
                className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm hover:bg-blue-500/30 transition-colors"
              >
                在新窗口打开
              </button>
              <button
                onClick={testImageGeneration}
                className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm hover:bg-green-500/30 transition-colors"
              >
                重新生成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}