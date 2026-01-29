'use client';

import { useState, useEffect } from 'react';
import { jimengAIService } from '../../lib/jimeng-ai-service';
import { ExternalLink, Key, AlertCircle, CheckCircle, Copy } from 'lucide-react';

export default function FalConfigPage() {
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const status = jimengAIService.getServiceStatus();
    setServiceStatus(status);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎨 即梦AI配置中心 (Fal.ai)
          </h1>
          <p className="text-xl text-gray-300">
            配置Fal.ai API以启用ByteDance Seedream图片生成功能
          </p>
        </div>

        {/* 当前状态 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📊 当前状态</h2>
          {serviceStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">配置状态</div>
                <div className={`text-lg font-bold flex items-center gap-2 ${serviceStatus.isConfigured ? 'text-green-400' : 'text-red-400'}`}>
                  {serviceStatus.isConfigured ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {serviceStatus.isConfigured ? '已配置' : '未配置'}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">认证方式</div>
                <div className="text-lg font-bold text-blue-400">
                  {serviceStatus.authMethod}
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

        {/* 配置说明 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">🔑 获取Fal.ai API密钥</h2>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              {showInstructions ? '隐藏说明' : '显示详细说明'}
            </button>
          </div>

          {showInstructions && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  步骤1: 注册Fal.ai账号
                </h3>
                <div className="text-blue-200 space-y-2">
                  <p>1. 访问 <a href="https://fal.ai" target="_blank" className="text-blue-300 underline flex items-center gap-1 inline-flex">Fal.ai官网 <ExternalLink className="w-4 h-4" /></a></p>
                  <p>2. 注册或登录您的Fal.ai账号</p>
                  <p>3. Fal.ai是一个AI模型平台，提供ByteDance Seedream等模型的API访问</p>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-green-400 mb-3">步骤2: 获取API密钥</h3>
                <div className="text-green-200 space-y-2">
                  <p>1. 访问 <a href="https://fal.ai/dashboard" target="_blank" className="text-green-300 underline flex items-center gap-1 inline-flex">Fal.ai控制台 <ExternalLink className="w-4 h-4" /></a></p>
                  <p>2. 在Dashboard中找到"API Keys"部分</p>
                  <p>3. 创建新的API密钥</p>
                  <p>4. 复制生成的API密钥（格式类似：fal_xxxxxxxx）</p>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-purple-400 mb-3">步骤3: 配置环境变量</h3>
                <div className="text-purple-200 space-y-3">
                  <p>在项目根目录的 <code className="bg-black/30 px-2 py-1 rounded">.env.local</code> 文件中添加：</p>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400"># Fal.ai API密钥</span>
                      <button
                        onClick={() => copyToClipboard('JIMENG_AI_API_KEY=your_fal_ai_api_key_here')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-green-400">JIMENG_AI_API_KEY=your_fal_ai_api_key_here</div>
                    <div className="text-gray-400 mt-2"># 或者使用</div>
                    <div className="text-green-400">FAL_KEY=your_fal_ai_api_key_here</div>
                  </div>
                  <p className="text-sm">⚠️ 将 <code>your_fal_ai_api_key_here</code> 替换为您从Fal.ai获取的真实API密钥</p>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-orange-400 mb-3">步骤4: 重启应用</h3>
                <div className="text-orange-200 space-y-2">
                  <p>1. 保存 <code className="bg-black/30 px-2 py-1 rounded">.env.local</code> 文件</p>
                  <p>2. 重启开发服务器（Ctrl+C 然后 npm run dev）</p>
                  <p>3. 访问测试页面验证配置是否成功</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 测试区域 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">🧪 测试功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/test-quick"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-6 rounded-xl transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-bold text-lg mb-2">快速测试</div>
              <div className="text-sm text-white/80">一键测试图片生成</div>
            </a>
            
            <a
              href="/test-image-simple"
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white p-6 rounded-xl transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="text-2xl mb-2">🖼️</div>
              <div className="font-bold text-lg mb-2">图片测试</div>
              <div className="text-sm text-white/80">测试多种图片源</div>
            </a>

            <a
              href="/test-final"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-6 rounded-xl transition-all duration-300 hover:scale-105 text-center"
            >
              <div className="text-2xl mb-2">🌟</div>
              <div className="font-bold text-lg mb-2">完整体验</div>
              <div className="text-sm text-white/80">沉浸式旅行体验</div>
            </a>
          </div>
        </div>

        {/* 常见问题 */}
        <div className="mt-8 bg-gray-500/10 border border-gray-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-300 mb-4">❓ 常见问题</h3>
          <div className="text-gray-400 text-sm space-y-3">
            <div>
              <strong className="text-white">Q: 为什么选择Fal.ai而不是直接调用BytePlus？</strong>
              <p>A: Fal.ai提供了更简单的API接口和更好的开发者体验，无需复杂的认证流程。</p>
            </div>
            <div>
              <strong className="text-white">Q: Fal.ai的收费如何？</strong>
              <p>A: Fal.ai按使用量收费，新用户通常有免费额度。具体价格请查看官网。</p>
            </div>
            <div>
              <strong className="text-white">Q: 如果不配置API密钥会怎样？</strong>
              <p>A: 系统会自动使用高质量的Unsplash图片作为备用，不影响用户体验。</p>
            </div>
            <div>
              <strong className="text-white">Q: 支持哪些图片尺寸？</strong>
              <p>A: 支持多种尺寸，包括正方形、16:9横屏、4:3等，最高可达2K分辨率。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}