// 代理配置工具 - Vercel 兼容版本

/**
 * 设置全局代理，专门处理 Google API 请求
 * 在 Vercel 环境中自动禁用
 */
export function setupGoogleApiProxy() {
  // 只在服务器端运行
  if (typeof window !== 'undefined') {
    return;
  }

  // 在 Vercel 环境中禁用代理
  if (process.env.VERCEL) {
    console.log('🚀 Running on Vercel, proxy disabled');
    return;
  }

  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  
  if (!proxyUrl) {
    console.log('📡 No proxy configured for Google API');
    return;
  }

  console.log('🌐 Setting up proxy for Google API (local development):', proxyUrl);

  try {
    // 只在本地开发环境使用代理
    const { ProxyAgent } = require('undici');
    const proxyAgent = new ProxyAgent(proxyUrl);
    
    // 保存原始的 fetch
    const originalFetch = globalThis.fetch;
    
    // 重写 fetch 函数使用 undici ProxyAgent
    globalThis.fetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      
      // 只对 Google API 请求使用代理
      if (urlString.includes('generativelanguage.googleapis.com') || 
          urlString.includes('googleapis.com')) {
        
        console.log('🔄 Using proxy for Google API request:', urlString);
        
        // 使用 undici 的 fetch 和 ProxyAgent
        const undici = require('undici');
        
        return undici.fetch(url, {
          ...options,
          dispatcher: proxyAgent
        });
      }
      
      // 其他请求使用原始 fetch
      return originalFetch(url, options);
    };
    
    console.log('✅ Google API proxy setup completed (local development)');
    
  } catch (error) {
    console.error('❌ Failed to setup proxy:', error);
  }
}

/**
 * 强制使用 IPv4 的 DNS 解析
 * 在 Vercel 环境中自动禁用
 */
export function forceIPv4() {
  // 只在服务器端运行
  if (typeof window !== 'undefined') {
    return;
  }

  // 在 Vercel 环境中禁用
  if (process.env.VERCEL) {
    console.log('🚀 Running on Vercel, IPv4 preference disabled');
    return;
  }

  try {
    // 设置 Node.js DNS 优先使用 IPv4（仅本地开发）
    const dns = require('dns');
    dns.setDefaultResultOrder('ipv4first');
    console.log('🌐 DNS set to prefer IPv4 (local development)');
  } catch (error) {
    console.error('❌ Failed to set IPv4 preference:', error);
  }
}