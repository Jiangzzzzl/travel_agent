'use client';

import { useState } from 'react';

export default function TestImageSimplePage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testImageUrls = () => {
    addResult('开始测试图片URL...');
    
    // 测试不同的图片URL
    const testUrls = [
      {
        name: 'Unsplash - 北京',
        url: 'https://source.unsplash.com/800x600/?beijing+travel+architecture+city'
      },
      {
        name: 'Unsplash - 通用旅行',
        url: 'https://source.unsplash.com/800x600/?travel+landscape+architecture+city+landmark'
      },
      {
        name: 'Picsum - 随机图片',
        url: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`
      },
      {
        name: 'Unsplash - 简化版',
        url: 'https://source.unsplash.com/800x600/?travel'
      }
    ];

    testUrls.forEach((test, index) => {
      setTimeout(() => {
        addResult(`测试 ${index + 1}: ${test.name}`);
        addResult(`URL: ${test.url}`);
        
        // 创建图片元素测试加载
        const img = new Image();
        img.onload = () => addResult(`✅ ${test.name} - 加载成功`);
        img.onerror = () => addResult(`❌ ${test.name} - 加载失败`);
        img.src = test.url;
      }, index * 1000);
    });
  };

  const generateSimpleUrl = () => {
    const name = "北京";
    const cleanName = name.replace(/[^\w\s\u4e00-\u9fff]/gi, '').trim();
    const baseTerms = ['travel', 'landscape', 'architecture', 'city', 'landmark'];
    
    const searchTerms = cleanName 
      ? [encodeURIComponent(cleanName), ...baseTerms].join('+')
      : baseTerms.join('+');
    
    const randomSeed = Math.floor(Math.random() * 1000);
    const url = `https://source.unsplash.com/800x600/?${searchTerms}&sig=${randomSeed}`;
    
    addResult('生成的URL逻辑测试:');
    addResult(`原始名称: ${name}`);
    addResult(`清理后: ${cleanName}`);
    addResult(`编码后: ${encodeURIComponent(cleanName)}`);
    addResult(`搜索词: ${searchTerms}`);
    addResult(`最终URL: ${url}`);
    
    return url;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🧪 简单图片URL测试</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={testImageUrls}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            🔗 测试图片URL
          </button>
          
          <button
            onClick={generateSimpleUrl}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            🛠️ 测试URL生成逻辑
          </button>
          
          <button
            onClick={() => setTestResults([])}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
          >
            🗑️ 清空结果
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-black/50 rounded-lg p-4 mb-6">
            <h3 className="text-white font-bold mb-4">测试结果:</h3>
            <div className="max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-green-400 text-sm font-mono mb-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 直接显示测试图片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white font-bold mb-2">Unsplash - 北京</h3>
            <img 
              src="https://source.unsplash.com/400x300/?beijing+travel+architecture+city"
              alt="北京"
              className="w-full h-auto rounded"
              onLoad={() => addResult('✅ 北京图片加载成功')}
              onError={() => addResult('❌ 北京图片加载失败')}
            />
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white font-bold mb-2">Picsum - 随机</h3>
            <img 
              src={`https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`}
              alt="随机"
              className="w-full h-auto rounded"
              onLoad={() => addResult('✅ 随机图片加载成功')}
              onError={() => addResult('❌ 随机图片加载失败')}
            />
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white font-bold mb-2">Unsplash - 通用旅行</h3>
            <img 
              src="https://source.unsplash.com/400x300/?travel+landscape+city"
              alt="旅行"
              className="w-full h-auto rounded"
              onLoad={() => addResult('✅ 旅行图片加载成功')}
              onError={() => addResult('❌ 旅行图片加载失败')}
            />
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white font-bold mb-2">Unsplash - 简单搜索</h3>
            <img 
              src="https://source.unsplash.com/400x300/?architecture"
              alt="建筑"
              className="w-full h-auto rounded"
              onLoad={() => addResult('✅ 建筑图片加载成功')}
              onError={() => addResult('❌ 建筑图片加载失败')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}