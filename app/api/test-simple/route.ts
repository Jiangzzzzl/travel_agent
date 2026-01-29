import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing simple Gemini API call...');
    
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' }, { status: 400 });
    }
    
    // 尝试最简单的 generateContent 调用
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Say hello in Chinese"
            }]
          }]
        })
      }
    );
    
    const responseText = await response.text();
    console.log('📝 Response status:', response.status);
    console.log('📝 Response text:', responseText);
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'API call failed', 
        status: response.status,
        details: responseText 
      }, { status: response.status });
    }
    
    const data = JSON.parse(responseText);
    
    return NextResponse.json({
      success: true,
      response: data,
      proxyUsed: true
    });
    
  } catch (error: any) {
    console.error('�?Error in simple test:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
