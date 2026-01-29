// ByteDance Seedream (即梦AI) 图片生成服务
// 通过 fal.ai 平台调用 ByteDance Seedream 3.0 模型
interface FalAIResponse {
  images: Array<{
    url: string;
    width?: number;
    height?: number;
  }>;
  seed: number;
}

interface GenerateImageRequest {
  prompt: string;
  image_size?: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9' | 'auto_2K' | 'auto_4K' | { width: number; height: number };
  num_images?: number;
  max_images?: number;
  seed?: number;
  enable_safety_checker?: boolean;
  sync_mode?: boolean;
}

class JimengAIService {
  private apiKey: string;
  private baseUrl: string;
  private isConfigured: boolean;

  constructor() {
    // 获取 FAL AI API Key (用于调用 ByteDance Seedream)
    this.apiKey = process.env.JIMENG_AI_API_KEY || process.env.FAL_KEY || '';
    this.baseUrl = 'https://fal.run/fal-ai/bytedance/seedream/v4.5/text-to-image';
    
    // 检查是否有有效的API密钥
    const hasValidApiKey = this.apiKey && 
      this.apiKey !== 'your_jimeng_ai_api_key_here' && 
      this.apiKey.length > 20;
    
    this.isConfigured = !!hasValidApiKey;
    
    console.log('🎨 JiMeng AI Service (Fal.ai) initialized:', {
      hasApiKey: hasValidApiKey,
      isConfigured: this.isConfigured,
      baseUrl: this.baseUrl,
      keyLength: this.apiKey.length
    });
    
    if (!this.isConfigured) {
      console.warn('⚠️ JiMeng AI (Fal.ai) credentials not configured.');
      console.warn('💡 Please configure FAL_KEY or JIMENG_AI_API_KEY:');
      console.warn('   - Get API Key from: https://fal.ai/dashboard');
      console.warn('   - Image generation will use high-quality Picsum fallback images');
    }
  }

  // 生成认证头 - Fal.ai 格式
  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Key ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Travel-Agent/1.0'
    };
  }

  // 生成旅行目的地相关的图片 - 使用 Fal.ai ByteDance Seedream 模型
  async generateDestinationImage(destination: string, style: string = 'cinematic'): Promise<string | null> {
    console.log('🎨 Starting Fal.ai Seedream image generation for:', destination, 'Style:', style, 'Configured:', this.isConfigured);
    
    if (!this.isConfigured) {
      console.log('⚠️ Fal.ai credentials not configured, using high-quality fallback image for:', destination);
      return this.getFallbackImage(destination, 'destination');
    }

    try {
      // 构建专业的提示词
      const prompt = this.buildDestinationPrompt(destination, style);
      console.log('📝 Generated prompt:', prompt);
      
      // Fal.ai API调用
      const requestBody = {
        prompt: prompt,
        image_size: 'landscape_16_9', // 16:9 宽屏比例，适合目的地展示
        num_images: 1,
        enable_safety_checker: true
      };

      console.log('🌐 Calling Fal.ai endpoint:', this.baseUrl);
      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      console.log('📥 API Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const result: FalAIResponse = await response.json();
        console.log('✅ Fal.ai API Response:', JSON.stringify(result, null, 2));
        
        if (result.images && result.images.length > 0 && result.images[0].url) {
          const imageUrl = result.images[0].url;
          console.log('🖼️ Image generated successfully:', imageUrl);
          return imageUrl;
        } else {
          console.log('⚠️ No image URL in response, using fallback');
          return this.getFallbackImage(destination, 'destination');
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Fal.ai API Error:', response.status, errorText.substring(0, 500));
        
        // 如果是认证错误，提供更详细的信息
        if (response.status === 401) {
          console.log('🔐 Authentication failed - please check your Fal.ai API key');
          console.log('💡 Get your API key from: https://fal.ai/dashboard');
        } else if (response.status === 403) {
          console.log('🚫 Access forbidden - check your API key permissions');
        } else if (response.status === 429) {
          console.log('⏱️ Rate limit exceeded - please try again later');
        }
        
        return this.getFallbackImage(destination, 'destination');
      }
    } catch (error) {
      console.error('❌ Fal.ai Seedream generation error:', error);
      console.log('🔄 Falling back to high-quality Unsplash image');
      return this.getFallbackImage(destination, 'destination');
    }
  }

  // 为景点生成专业的提示词
  private buildDestinationPrompt(destination: string, style: string): string {
    const stylePrompts = {
      'ancient': 'ancient architecture, golden hour lighting, majestic historical buildings, warm cinematic tones, traditional cultural elements',
      'romantic': 'romantic atmosphere, soft pastel colors, dreamy lighting, elegant architecture, sunset glow, intimate ambiance',
      'futuristic': 'modern architecture, sleek design, neon lights, cyberpunk aesthetic, dramatic lighting, high-tech elements',
      'mystical': 'mystical atmosphere, ethereal lighting, mysterious ambiance, deep blue and purple tones, magical elements',
      'serene': 'peaceful natural scenery, soft natural lighting, zen atmosphere, green and blue tones, tranquil environment',
      'vibrant': 'vibrant colors, energetic atmosphere, dynamic composition, bright and lively, bustling city life',
      'cinematic': 'cinematic composition, dramatic lighting, epic scale, movie-like quality, stunning visual impact'
    };

    const destinationPrompts = {
      '北京': 'Beijing Forbidden City, traditional Chinese architecture, red walls and golden roofs, imperial palace',
      '上海': 'Shanghai skyline, modern skyscrapers, Bund waterfront, futuristic cityscape',
      '西安': 'Xi\'an Terracotta Warriors, ancient Chinese imperial architecture, historical monuments, Tang dynasty',
      '大理': 'Dali Erhai Lake, traditional Bai architecture, mountains and water scenery, Yunnan landscape',
      '巴黎': 'Paris Eiffel Tower, Haussmanian architecture, romantic European cityscape, Seine river',
      '东京': 'Tokyo modern skyline, Japanese architecture blend, neon lights and traditional elements, urban landscape',
      '圣托里尼': 'Santorini white buildings, blue domes, Aegean Sea, Greek island architecture, cliff-side village'
    };

    const basePrompt = destinationPrompts[destination] || `${destination} landmark architecture, famous tourist destination`;
    const stylePrompt = stylePrompts[style] || stylePrompts['cinematic'];

    return `${basePrompt}, ${stylePrompt}, professional travel photography, 8K resolution, masterpiece quality, no text, no watermark, stunning composition`;
  }

  // 生成景点特定的图片 - 使用 Fal.ai Seedream 模型
  async generateAttractionImage(attraction: string, destination: string): Promise<string | null> {
    if (!this.isConfigured) {
      console.log('🎨 Fal.ai not configured, using fallback image for attraction:', attraction);
      return this.getFallbackImage(attraction, 'attraction');
    }

    const prompt = `${attraction} in ${destination}, professional travel photography, beautiful lighting, high quality, detailed architecture, scenic view, 8K resolution, no text, no watermark`;
    
    try {
      console.log('🎨 Generating attraction image for:', attraction, 'in', destination);
      
      const requestBody = {
        prompt: prompt,
        image_size: 'square_hd', // 正方形高清，适合景点卡片
        num_images: 1,
        enable_safety_checker: true
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result: FalAIResponse = await response.json();
        if (result.images && result.images.length > 0 && result.images[0].url) {
          console.log('✅ Attraction image generated:', result.images[0].url);
          return result.images[0].url;
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Attraction image API error:', response.status, errorText.substring(0, 200));
      }

      return this.getFallbackImage(attraction, 'attraction');
    } catch (error) {
      console.error('Attraction image generation error:', error);
      return this.getFallbackImage(attraction, 'attraction');
    }
  }

  // 获取备用图片（当API不可用时）- 使用多个图片源
  private getFallbackImage(name: string, type: 'destination' | 'attraction'): string {
    console.log('🖼️ Generating high-quality fallback image for:', name, 'Type:', type);
    
    const width = type === 'destination' ? 1792 : 1024;
    const height = type === 'destination' ? 1024 : 1024;
    
    // 构建搜索词，确保有有效的搜索内容
    const baseTerms = type === 'destination' 
      ? ['travel', 'landscape', 'architecture', 'city', 'landmark', 'scenic', 'beautiful']
      : ['travel', 'tourist', 'attraction', 'landmark', 'architecture', 'scenic'];
    
    // 城市名称映射到英文关键词
    const cityKeywords: Record<string, string[]> = {
      '北京': ['beijing', 'forbidden', 'city', 'temple', 'heaven', 'great', 'wall'],
      '上海': ['shanghai', 'bund', 'skyline', 'oriental', 'pearl', 'tower'],
      '西安': ['xian', 'terracotta', 'warriors', 'ancient', 'pagoda', 'wall'],
      '大理': ['dali', 'erhai', 'lake', 'yunnan', 'mountains', 'temple'],
      '东京': ['tokyo', 'shibuya', 'temple', 'skyscraper', 'neon', 'modern'],
      '巴黎': ['paris', 'eiffel', 'tower', 'louvre', 'seine', 'architecture'],
      '圣托里尼': ['santorini', 'greece', 'blue', 'white', 'aegean', 'sea']
    };
    
    // 获取城市特定关键词，如果没有则使用通用词汇
    const citySpecificTerms = cityKeywords[name] || ['destination', 'travel'];
    const searchTerms = [...citySpecificTerms, ...baseTerms].join('+');
    
    // 添加随机种子避免缓存
    const randomSeed = Math.floor(Math.random() * 10000);
    
    // 使用Picsum作为主要备用源（更稳定）
    const fallbackUrl = `https://picsum.photos/${width}/${height}?random=${randomSeed}`;
    
    console.log('🔗 High-quality fallback image URL:', fallbackUrl);
    console.log('🔍 Search terms used:', searchTerms);
    
    return fallbackUrl;
  }

  // 检查服务是否已配置
  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  // 获取服务状态信息
  getServiceStatus() {
    const hasValidApiKey = this.apiKey && 
      this.apiKey !== 'your_jimeng_ai_api_key_here' && 
      this.apiKey.length > 20;

    return {
      isConfigured: this.isConfigured,
      hasApiKey: hasValidApiKey,
      keyLength: this.apiKey.length,
      baseUrl: this.baseUrl,
      authMethod: hasValidApiKey ? 'Fal.ai API Key' : 'None',
      credentialsValid: hasValidApiKey,
      recommendedAction: !this.isConfigured ? 
        'Get Fal.ai API Key from: https://fal.ai/dashboard' : 
        'Ready to generate images with ByteDance Seedream'
    };
  }
}

export const jimengAIService = new JimengAIService();
export type { GenerateImageRequest, FalAIResponse };