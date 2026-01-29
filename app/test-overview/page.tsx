'use client';

export default function TestOverviewPage() {
  const testPages = [
    {
      path: '/test-genui',
      title: '🎨 GenUI 景点推荐系统',
      description: '基于 Flutter GenUI 设计理念的动态 UI 系统',
      features: ['动态组件', '智能筛选', '响应式布局', '多视图模式'],
      status: 'recommended'
    },
    {
      path: '/planning',
      title: '📋 智能行程规划',
      description: '完整的旅行规划体验，包含景点推荐和行程安排',
      features: ['AI推荐', '行程规划', '景点收藏', '时间估算'],
      status: 'stable'
    },
    {
      path: '/test-debug',
      title: '🔧 系统调试面板',
      description: '查看系统状态、API配置和错误日志',
      features: ['API状态检查', '错误诊断', '性能监控', '配置验证'],
      status: 'debug'
    },
    {
      path: '/fal-config',
      title: '⚙️ Fal.ai 配置指南',
      description: '图像生成服务配置说明（可选功能）',
      features: ['配置指南', '认证方式', '故障排除', '环境变量'],
      status: 'config'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recommended': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'debug': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'config': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'stable': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'basic': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'simple': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'static': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'recommended': return '推荐';
      case 'debug': return '调试';
      case 'config': return '配置';
      case 'stable': return '稳定';
      case 'basic': return '基础';
      case 'simple': return '简化';
      case 'static': return '静态';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🧪 测试页面总览
          </h1>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            基于 Flutter GenUI 设计理念的智能旅行规划系统
          </p>
        </div>

        {/* 快速导航 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-12 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">🚀 快速开始</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="/test-genui"
              className="group bg-gradient-to-br from-green-600/20 to-green-500/10 border border-green-500/30 rounded-2xl p-6 hover:from-green-600/30 hover:to-green-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="text-xl font-bold text-white mb-2">GenUI 系统</h3>
                <p className="text-green-200 text-sm">推荐首次使用</p>
              </div>
            </a>
            
            <a
              href="/planning"
              className="group bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-2xl p-6 hover:from-blue-600/30 hover:to-blue-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-xl font-bold text-white mb-2">行程规划</h3>
                <p className="text-blue-200 text-sm">完整旅行体验</p>
              </div>
            </a>
            
            <a
              href="/test-debug"
              className="group bg-gradient-to-br from-purple-600/20 to-purple-500/10 border border-purple-500/30 rounded-2xl p-6 hover:from-purple-600/30 hover:to-purple-500/20 transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🔧</div>
                <h3 className="text-xl font-bold text-white mb-2">系统调试</h3>
                <p className="text-purple-200 text-sm">检查系统状态</p>
              </div>
            </a>
          </div>
        </div>

        {/* 所有测试页面 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {testPages.map((page) => (
            <div
              key={page.path}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                  {page.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(page.status)}`}>
                  {getStatusText(page.status)}
                </span>
              </div>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                {page.description}
              </p>
              
              <div className="mb-6">
                <h4 className="text-sm font-bold text-white/90 mb-3">功能特性:</h4>
                <div className="flex flex-wrap gap-2">
                  {page.features.map((feature, featureIndex) => (
                    <span
                      key={featureIndex}
                      className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm border border-white/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              <a
                href={page.path}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 group-hover:shadow-lg"
              >
                <span>访问页面</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* 系统状态 */}
        <div className="mt-12 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">📊 系统状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-lg font-bold text-green-400">GenUI 系统</div>
              <div className="text-sm text-white/60">Flutter 风格设计</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <div className="text-lg font-bold text-blue-400">响应式布局</div>
              <div className="text-sm text-white/60">多视图模式</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💾</div>
              <div className="text-lg font-bold text-purple-400">数据管理</div>
              <div className="text-sm text-white/60">智能状态管理</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔧</div>
              <div className="text-lg font-bold text-yellow-400">组件目录</div>
              <div className="text-sm text-white/60">动态组件系统</div>
            </div>
          </div>
        </div>

        {/* 底部链接 */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>返回主页</span>
          </a>
        </div>
      </div>
    </div>
  );
}