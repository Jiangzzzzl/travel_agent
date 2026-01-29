import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing Gemini API connection with proxy...');
    console.log('Proxy settings:', {
      HTTP_PROXY: process.env.HTTP_PROXY,
      HTTPS_PROXY: process.env.HTTPS_PROXY,
      GLOBAL_AGENT_HTTP_PROXY: process.env.GLOBAL_AGENT_HTTP_PROXY,
      GLOBAL_AGENT_HTTPS_PROXY: process.env.GLOBAL_AGENT_HTTPS_PROXY,
    });
    
    const model = google('gemini-2.5-flash');
    
    const result = await generateText({
      model,
      prompt: 'Say hello in Chinese',
      maxTokens: 50,
    });
    
    console.log('✅ Gemini API test successful:', result.text);
    
    return NextResponse.json({
      success: true,
      message: 'Proxy test successful',
      result: result.text,
      proxySettings: {
        HTTP_PROXY: process.env.HTTP_PROXY,
        HTTPS_PROXY: process.env.HTTPS_PROXY,
        GLOBAL_AGENT_HTTP_PROXY: process.env.GLOBAL_AGENT_HTTP_PROXY,
        GLOBAL_AGENT_HTTPS_PROXY: process.env.GLOBAL_AGENT_HTTPS_PROXY,
      }
    });
  } catch (error: any) {
    console.error('❌ Gemini API test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Proxy test failed',
      error: error.message,
      proxySettings: {
        HTTP_PROXY: process.env.HTTP_PROXY,
        HTTPS_PROXY: process.env.HTTPS_PROXY,
        GLOBAL_AGENT_HTTP_PROXY: process.env.GLOBAL_AGENT_HTTP_PROXY,
        GLOBAL_AGENT_HTTPS_PROXY: process.env.GLOBAL_AGENT_HTTPS_PROXY,
      }
    }, { status: 500 });
  }
}