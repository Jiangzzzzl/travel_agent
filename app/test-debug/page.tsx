'use client';

import { useState, useEffect } from 'react';
import { jimengAIService } from '../../lib/jimeng-ai-service';

export default function TestDebugPage() {
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 获取服务状态
    const status = jimengAIService.getServiceStatus();
    setServiceStatus(status);
    console.log('🔍 JiMeng AI Service Status:', status);
  }, []);

  const testImageGeneration = async (destination: string) => {
    setIsLoading(true);
    console.log('🧪 Testing image generation for:', destination);
    
    const startTime = Date.now();
    try {
      const imageUrl = await jimengAIService.generateDestinationImage(destination, 'cinematic');
      const endTime = Date.now();
      
      const result = {
        destination,
        imageUrl,
        success: !!imageUrl,
        duration: endTime - startTime,
        timestamp: new Date().toLocaleTimeString()
      };
      
      console.log('✅ Test result:', result);
      setTestResults(prev => [result, ...prev]);
    } catch (error) {
      console.error('❌ Test failed:', error);
      const result = {
        destination,
        imageUrl: null,
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toLocaleTimeString()
      };
      setTestResults(prev => [result, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const testDestinations = ['北京', '上海', '西安', '大理', '东京', '巴黎'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔧 JiMeng AI 调试页面
          </h1>
          <p className="text-xl text-gray-300">
            测试图片生成功能和API连接状态
          </p>
        </div>

        {/* 服务状态 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📊 服务状态</h2>
          {serviceStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">配置状态</div>
                <div className={`text-lg font-bold ${serviceStatus.isConfigured ? 'text-green-400' : 'text-red-400'}`}>
                  {serviceStatus.isConfigured ? '✅ 已配置' : '❌ 未配置'}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">API密钥</div>
                <div className={`text-lg font-bold ${serviceStatus.hasApiKey ? 'text-green-400' : 'text-red-400'}`}>
                  {serviceStatus.hasApiKey ? `✅ ${serviceStatus.keyLength} 字符` : '❌ 无密钥'}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">API地址</div>
                <div className="text-lg font-bold text-blue-400 truncate">
                  {serviceStatus.baseUrl}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">认证方式</div>
                <div className="text-lg font-bold text-blue-400">
                  {serviceStatus.authMethod}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">凭据有效性</div>
                <div className={`text-lg font-bold ${serviceStatus.credentialsValid ? 'text-green-400' : 'text-red-400'}`}>
                  {serviceStatus.credentialsValid ? '✅ 有效' : '❌ 无效'}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">解码后Access Key</div>
                <div className="text-lg font-bold text-blue-400 truncate">
                  {serviceStatus.decodedAccessKey}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">解码后Secret Key</div>
                <div className="text-lg font-bold text-blue-400 truncate">
                  {serviceStatus.decodedSecretKey}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 md:col-span-2">
                <div className="text-sm text-gray-400">建议操作</div>
                <div className="text-lg font-bold text-yellow-400">
                  {serviceStatus.recommendedAction}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 测试按钮 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">🧪 测试图片生成</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {testDestinations.map((destination) => (
              <button
                key={destination}
                onClick={() => testImageGeneration(destination)}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isLoading ? '⏳' : '🎨'} {destination}
              </button>
            ))}
          </div>
        </div>

        {/* 测试结果 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📋 测试结果</h2>
          {testResults.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              点击上方按钮开始测试图片生成功能
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl ${result.success ? '✅' : '❌'}`} />
                      <span className="font-bold text-white">{result.destination}</span>
                      <span className="text-sm text-gray-400">{result.timestamp}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {result.duration}ms
                    </div>
                  </div>
                  
                  {result.success && result.imageUrl ? (
                    <div className="mt-3">
                      <div className="text-sm text-gray-400 mb-2">生成的图片:</div>
                      <div className="flex items-center gap-4">
                        <img 
                          src={result.imageUrl} 
                          alt={result.destination}
                          className="w-24 h-16 object-cover rounded-lg border border-white/20"
                          onError={(e) => {
                            console.log('❌ Image preview failed to load');
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="flex-1">
                          <div className="text-xs text-gray-400 break-all">
                            {result.imageUrl}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="text-sm text-red-400">
                        {result.error || '图片生成失败，使用备用图片'}
                      </div>
                      {result.imageUrl && (
                        <div className="text-xs text-gray-400 mt-1 break-all">
                          备用图片: {result.imageUrl}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 说明 */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-yellow-400 mb-2">💡 调试说明</h3>
          <div className="text-yellow-200 text-sm space-y-2">
            <p>• 当前使用BytePlus ModelArk平台的Seedream 4.5模型进行图片生成</p>
            <p>• 如果API密钥未配置或无效，系统会自动使用高质量Unsplash作为备用图片源</p>
            <p>• 所有API调用和错误信息都会在浏览器控制台中显示</p>
            <p>• 测试结果会显示每次调用的耗时和成功状态</p>
            <p>• 获取真实API密钥: <a href="https://console.byteplus.com/modelark/api-key" target="_blank" className="text-yellow-300 underline">BytePlus控制台</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}