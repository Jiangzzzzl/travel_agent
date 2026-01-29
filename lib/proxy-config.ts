// 代理配置 - 用于访问 Google Gemini API
import { HttpsProxyAgent } from 'https-proxy-agent';

export function createProxyAgent() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  
  if (!proxyUrl) {
    console.log('⚠️ No proxy configured');
    return undefined;
  }

  console.log('✅ Configuring proxy:', proxyUrl);
  return new HttpsProxyAgent(proxyUrl);
}

// 为 fetch 配置代理
export function createProxyFetch() {
  const agent = createProxyAgent();
  
  if (!agent) {
    return fetch;
  }

  return async (url: RequestInfo | URL, init?: RequestInit) => {
    const fetchInit = {
      ...init,
      // @ts-ignore
      agent,
    };
    
    console.log('🌐 Fetching via proxy:', url.toString().substring(0, 100));
    return fetch(url, fetchInit);
  };
}