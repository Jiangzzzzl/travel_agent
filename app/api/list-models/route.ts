import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Listing available Gemini models...');
    
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' }, { status: 400 });
    }
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to list models:', errorText);
      return NextResponse.json({ 
        error: 'Failed to list models', 
        details: errorText 
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log('✅ Available models:', data);
    
    // 提取模型名称
    const modelNames = data.models?.map((model: any) => ({
      name: model.name,
      displayName: model.displayName,
      supportedGenerationMethods: model.supportedGenerationMethods,
    })) || [];
    
    return NextResponse.json({
      success: true,
      models: modelNames,
      fullResponse: data
    });
    
  } catch (error: any) {
    console.error('❌ Error listing models:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}