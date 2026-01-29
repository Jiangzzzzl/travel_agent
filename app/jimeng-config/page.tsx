'use client';

import { useState, useEffect } from 'react';
import { jimengAIService } from '../../lib/jimeng-ai-service';

export default function JimengConfigPage() {
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const status = jimengAIService.getServiceStatus();
    setServiceStatus(status);
  }, []);

  const configMethods = [
    {
      id: 'api-key',
      title: 'API Key 方式',
      description: '使用单一的API密钥进行认证',
      envVars: ['JIMENG_AI_API_KEY'],
      example: 'JIMENG_AI_API_KEY=your_api_key_here',
      status: serviceStatus?.hasApiKey
    },
    {
      id: 'access-key',
      title: 'Access Key + Secret Key',
      description: '类似阿里云的认证方式，使用访问密钥对',
      envVars: ['JIMENG_AI_ACCESS_KEY_ID', 'JIMENG_AI_SECRET_ACCESS_KEY'],
      example: `JIMENG_AI_ACCESS_KEY_ID=your_access_key_id
JIMENG_AI_SECRET_ACCESS_KEY=your_secret_access_key`,
      status: serviceStatus?.hasAccessKey && serviceStatus?.hasSecretKey
    },
    {
      id: 'bearer-token',
      title: 'Bearer Token',
      description: '使用Bearer令牌进行认证',
      envVars: ['JIMENG_AI_BEARER_TOKEN'],
      example: 'JIMENG_AI_BEARER_TOKEN=your_bearer_token_here',
      status: serviceStatus?.hasBearerToken
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔧 即梦AI 配置指南
          </h1>
          <p className="text-xl text-gray-300">
            配置即梦AI API以启用图片生成功能
          </p>
        </div>

        {/* 当前状态 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">📊 当前配置状态</h2>
          {serviceStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">总体状态</div>
                <div className={`text-lg font-bold ${serviceStatus.isConfigured ? 'text-green-400' : 'text-red-400'}`}>
                  {serviceStatus.isConfigured ? '✅ 已配置' : '❌ 未配置'}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">认证方式</div>
                <div className="text-lg font-bold text-blue-400">
                  {serviceStatus.authMethod}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">API地址</div>
                <div className="text-sm font-mono text-purple-400 truncate">
                  {serviceStatus.baseUrl}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-sm text-gray-400">状态</div>
                <div className={`text-lg font-bold ${serviceStatus.isConfigured ? 'text-green-400' : 'text-yellow-400'}`}>
                  {serviceStatus.isConfigured ? '可用' : '需配置'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 标签导航 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['overview', 'methods', 'troubleshooting'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {tab === 'overview' && '📋 概述'}
              {tab === 'methods' && '🔑 配置方法'}
              {tab === 'troubleshooting' && '🔧 故障排除'}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">🎯 即梦AI 简介</h3>
              <div className="space-y-4 text-white/90">
                <p>即梦AI是字节跳动旗下的AI图片生成服务，隶属于CapCut品牌。它提供高质量的文本到图片生成功能。</p>
                <p>由于即梦AI的API文档可能不公开或需要特殊申请，我们的系统支持多种可能的认证方式：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>API Key</strong> - 单一密钥认证</li>
                  <li><strong>Access Key + Secret Key</strong> - 双密钥认证（类似阿里云）</li>
                  <li><strong>Bearer Token</strong> - 令牌认证</li>
                </ul>
                <p>如果无法获取即梦AI的API访问权限，系统会自动使用Unsplash作为备用图片源。</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-blue-400 mb-3">💡 重要提示</h4>
              <div className="text-blue-200 space-y-2">
                <p>• 即梦AI的API可能需要企业账户或特殊申请</p>
                <p>• 如果您有即梦AI的API访问权限，请联系他们的技术支持获取正确的认证信息</p>
                <p>• 系统已配置完善的备用图片机制，即使没有API也能正常工作</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'methods' && (
          <div className="space-y-6">
            {configMethods.map((method) => (
              <div key={method.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{method.title}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    method.status ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {method.status ? '✅ 已配置' : '⚪ 未配置'}
                  </div>
                </div>
                
                <p className="text-white/80 mb-4">{method.description}</p>
                
                <div className="bg-black/30 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">环境变量配置:</div>
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                    {method.example}
                  </pre>
                </div>
                
                <div className="text-sm text-white/60">
                  <strong>需要的环境变量:</strong> {method.envVars.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'troubleshooting' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">🔧 常见问题</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-white mb-2">Q: 图片无法生成怎么办？</h4>
                  <p className="text-white/80">A: 检查以下几点：</p>
                  <ul className="list-disc list-inside text-white/70 ml-4 mt-2 space-y-1">
                    <li>确认API密钥配置正确</li>
                    <li>检查网络连接</li>
                    <li>查看浏览器控制台的错误信息</li>
                    <li>尝试访问调试页面 /test-debug</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-white mb-2">Q: 如何获取即梦AI的API访问权限？</h4>
                  <p className="text-white/80">A: 即梦AI的API可能需要：</p>
                  <ul className="list-disc list-inside text-white/70 ml-4 mt-2 space-y-1">
                    <li>企业账户申请</li>
                    <li>联系字节跳动商务团队</li>
                    <li>通过CapCut官方渠道申请</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-white mb-2">Q: 备用图片系统如何工作？</h4>
                  <p className="text-white/80">A: 当即梦AI不可用时，系统会：</p>
                  <ul className="list-disc list-inside text-white/70 ml-4 mt-2 space-y-1">
                    <li>自动使用Unsplash提供高质量图片</li>
                    <li>根据景点名称智能搜索相关图片</li>
                    <li>确保用户体验不受影响</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-yellow-400 mb-3">⚠️ 调试建议</h4>
              <div className="text-yellow-200 space-y-2">
                <p>1. 访问 <code className="bg-black/30 px-2 py-1 rounded">/test-debug</code> 页面测试API连接</p>
                <p>2. 检查浏览器控制台的详细日志信息</p>
                <p>3. 确认 .env.local 文件中的配置正确</p>
                <p>4. 重启开发服务器使环境变量生效</p>
              </div>
            </div>
          </div>
        )}

        {/* 快速链接 */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/test-debug"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300"
            >
              🧪 API调试页面
            </a>
            <a
              href="/test-final"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300"
            >
              🌟 完整体验测试
            </a>
            <a
              href="/"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300"
            >
              🏠 返回主页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}