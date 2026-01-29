'use client';

import { useState } from 'react';
import { jimengAIService } from '../../lib/jimeng-ai-service';

export default function TestImageGenPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testImageGeneration = async () => {
    setIsLoading(true);
    setResult(null);
    setLogs([]);
    
    addLog('开始测试图片生成...');
    
    try {
      // 获取服务状态
      const status = jimengAIService.getServiceStatus();
      addLog(`服务状态: ${JSON.stringify(status, null, 2)}`);
      
      // 测试图片生成
      addLog('调用 generateDestinationImage...');
      const imageUrl = await jimengAIService.generateDestinationImage('北京', 'cinematic');
      
      if (imageUrl) {
        addLog(`✅ 图片生成成功: ${imageUrl}`);
        setResult({
          success: true,
          imageUrl,
          message: '图片生成成功'
        });
      } else {
        addLog('❌ 图片生成失败，返回null');
        setResult({
          success: false,
          message: '图片生成失败'
        });
      }
    } catch (error) {
      addLog(`❌ 错误: ${error.message}`);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🖼️ 图片生成测试
          </h1>
          <p className="text-xl text-gray-300">
            直接测试即梦AI图片生成功能
          </p>
        </div>

        {/* 测试按钮 */}
        <div className="text-center mb-8">
          <button
            onClick={testImageGeneration}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-2xl text-xl font-bold transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? '🔄 生成中...' : '🎨 测试图片生成'}
          </button>
        </div>

        {/* 结果显示 */}
        {result && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">📋 测试结果</h2>
            <div className={`p-4 rounded-xl ${result.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
              <div className={`text-lg font-bold mb-2 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success ? '✅ 成功' : '❌ 失败'}
              </div>
              <div className="text-white/90">
                {result.message || result.error}
              </div>
              {result.imageUrl && (
                <div className="mt-4">
                  <div className="text-sm text-gray-400 mb-2">生成的图片:</div>
                  <img 
                    src={result.imageUrl} 
                    alt="Generated"
                    className="max-w-full h-auto rounded-lg border border-white/20"
                    onError={(e) => {
                      console.log('Image load error');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="text-xs text-gray-400 mt-2 break-all">
                    URL: {result.imageUrl}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 日志显示 */}
        {logs.length > 0 && (
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">📝 详细日志</h2>
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
            <p>• 这个页面直接调用 BytePlus Seedream 4.5 模型进行图片生成</p>
            <p>• 会显示完整的API调用过程和结果</p>
            <p>• 如果BytePlus API不可用，会自动使用高质量Unsplash备用图片</p>
            <p>• 所有日志信息都会在控制台和页面上显示</p>
            <p>• 获取API密钥: <a href="https://console.byteplus.com/modelark/api-key" target="_blank" className="text-blue-300 underline">BytePlus控制台</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}