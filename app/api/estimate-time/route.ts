import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { attractionName, attractionType, location } = await req.json();
    
    console.log('🤖 Server-side time estimation for:', attractionName);
    
    const prompt = `作为旅游专家，请为以下景点估算合理的游览时间：

景点名称：${attractionName}
景点类型：${attractionType}
${location ? `位置：${location}` : ''}

请考虑以下因素：
1. 景点的规模和复杂程度
2. 典型游客的游览习惯
3. 主要看点和活动
4. 交通和排队时间

请只返回时间估算，格式如："2-3小时" 或 "半天" 或 "全天" 或 "1小时"，不要其他解释。

示例：
- 迪士尼乐园：全天
- 故宫博物院：4-5小时
- 小型寺庙：1小时
- 大型博物馆：3-4小时`;

    const result = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: prompt,
    });

    const timeEstimate = result.text?.trim() || '';
    
    console.log('🤖 Server Gemini time estimate:', timeEstimate);
    
    // 验证返回的时间格式
    if (timeEstimate && /(全天|半天|整天|一天|一整天|\d+.*小时|\d+.*天|\d+.*分钟|\d+.*hour|\d+.*day|\d+.*minute)/.test(timeEstimate)) {
      console.log('✅ Valid time format detected:', timeEstimate);
      return Response.json({ 
        success: true, 
        timeEstimate,
        attractionName 
      });
    } else {
      console.warn('⚠️ Invalid time format:', timeEstimate, 'using fallback');
      return Response.json({ 
        success: false, 
        error: 'Invalid time format',
        fallback: getFallbackTime(attractionType)
      });
    }
    
  } catch (error) {
    console.error('❌ Server time estimation failed:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      fallback: '2小时'
    });
  }
}

function getFallbackTime(attractionType: string): string {
  const fallbackTimes: Record<string, string> = {
    'cultural': '2-3小时',
    'nature': '2-4小时',
    'shopping': '2-3小时',
    'entertainment': '3-5小时',
    'religious': '1-2小时',
    'historical': '3-4小时'
  };
  
  return fallbackTimes[attractionType] || '2小时';
}