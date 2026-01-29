// 激进的生成式UI系统 - 为每个城市创造完全不同的体验
export interface CityPersonality {
  name: string;
  soul: 'ancient' | 'romantic' | 'futuristic' | 'mystical' | 'vibrant' | 'serene' | 'rebellious';
  energy: 'explosive' | 'flowing' | 'pulsing' | 'gentle' | 'chaotic' | 'rhythmic';
  essence: string; // 城市的核心精神
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    mood: string[];
  };
  typography: {
    style: 'calligraphy' | 'neon' | 'carved' | 'handwritten' | 'digital' | 'organic';
    weight: 'light' | 'bold' | 'black' | 'variable';
    spacing: 'tight' | 'loose' | 'dramatic';
  };
  layout: {
    pattern: 'spiral' | 'constellation' | 'river' | 'mountain' | 'web' | 'explosion' | 'maze';
    rhythm: 'steady' | 'syncopated' | 'crescendo' | 'staccato' | 'legato';
    scale: 'intimate' | 'grand' | 'overwhelming' | 'delicate';
  };
  interactions: {
    style: 'gentle' | 'dramatic' | 'playful' | 'mysterious' | 'explosive' | 'zen';
    feedback: 'subtle' | 'bold' | 'magical' | 'mechanical' | 'organic';
  };
  atmosphere: {
    lighting: 'golden' | 'neon' | 'misty' | 'harsh' | 'soft' | 'dramatic';
    texture: 'smooth' | 'rough' | 'silky' | 'metallic' | 'organic' | 'crystalline';
    mood: 'nostalgic' | 'electric' | 'peaceful' | 'intense' | 'dreamy' | 'raw';
  };
  // 新增：完全自定义的视觉特征
  signature: {
    uniqueElements: string[]; // 独特的视觉元素
    brandColors: string[]; // 品牌色彩
    visualMetaphors: string[]; // 视觉隐喻
    culturalSymbols: string[]; // 文化符号
    architecturalStyle: string; // 建筑风格
    naturalElements: string[]; // 自然元素
  };
}

export interface RadicalUITheme {
  // 完全自定义的布局系统
  layout: {
    type: 'organic_flow' | 'geometric_explosion' | 'calligraphy_scroll' | 'neon_grid' | 'mountain_cascade' | 'ocean_waves' | 'ancient_temple' | 'cyber_matrix' | 'romantic_garden' | 'mystical_constellation';
    cardArrangement: 'scattered' | 'clustered' | 'flowing' | 'structured' | 'chaotic' | 'harmonious' | 'spiral' | 'radial' | 'organic';
    spacing: { x: number; y: number; chaos: number };
    scale: { min: number; max: number; variance: number };
  };
  
  // 动态视觉效果
  visuals: {
    backgroundType: 'particles' | 'waves' | 'geometry' | 'calligraphy' | 'neon' | 'nature';
    cardStyle: 'paper' | 'glass' | 'metal' | 'fabric' | 'stone' | 'digital' | 'jade' | 'hologram' | 'parchment' | 'crystal';
    borders: 'none' | 'thin' | 'thick' | 'decorative' | 'glowing' | 'torn' | 'carved' | 'neon' | 'organic' | 'mystical';
    shadows: 'soft' | 'hard' | 'colored' | 'multiple' | 'none' | 'inner' | 'dramatic' | 'glowing' | 'ancient' | 'ethereal';
  };
  
  // 交互行为
  interactions: {
    hover: 'lift' | 'glow' | 'rotate' | 'scale' | 'morph' | 'explode' | 'ancient_rise' | 'cyber_glitch' | 'romantic_bloom' | 'mystical_float';
    click: 'ripple' | 'flash' | 'shake' | 'bounce' | 'fade' | 'transform' | 'ancient_crack' | 'cyber_hack' | 'romantic_sparkle' | 'mystical_portal';
    entrance: 'fade' | 'slide' | 'spiral' | 'explode' | 'grow' | 'materialize' | 'ancient_emerge' | 'cyber_decode' | 'romantic_blossom' | 'mystical_manifest';
  };
  
  // 色彩系统
  colors: {
    palette: string[];
    distribution: 'monochrome' | 'complementary' | 'triadic' | 'rainbow' | 'gradient' | 'chaotic' | 'imperial' | 'cyber' | 'romantic' | 'mystical';
    saturation: number;
    brightness: number;
  };
  
  // 文字系统
  typography: {
    fonts: string[];
    sizes: number[];
    weights: number[];
    styles: ('normal' | 'italic' | 'oblique')[];
  };
}

class RadicalUIGenerator {
  // 深度分析城市个性 - 完全重写，更加激进
  analyzeCityPersonality(cityName: string, description?: string): CityPersonality {
    const city = cityName.toLowerCase();
    
    // 预定义的城市个性档案 - 完全重新设计，每个城市都有独特的DNA
    const cityProfiles: Record<string, Partial<CityPersonality>> = {
      '西安': {
        soul: 'ancient',
        energy: 'pulsing',
        essence: '十三朝古都的帝王威严，兵马俑守护的千年秘密',
        colors: {
          primary: '#B8860B', // 帝王金
          secondary: '#8B0000', // 深红朱砂
          accent: '#CD853F', // 古铜色
          mood: ['#F4E4BC', '#E6B800', '#CC5500', '#8B4513', '#DAA520']
        },
        typography: {
          style: 'carved',
          weight: 'black',
          spacing: 'dramatic'
        },
        layout: {
          pattern: 'constellation',
          rhythm: 'steady',
          scale: 'grand'
        },
        interactions: {
          style: 'dramatic',
          feedback: 'bold'
        },
        atmosphere: {
          lighting: 'golden',
          texture: 'rough',
          mood: 'nostalgic'
        },
        signature: {
          uniqueElements: ['兵马俑剪影', '古城墙纹理', '青铜器纹饰', '汉字书法', '龙纹图案'],
          brandColors: ['#B8860B', '#8B0000', '#CD853F', '#DAA520', '#A0522D'],
          visualMetaphors: ['帝王宝座', '古代卷轴', '青铜鼎器', '城墙砖石', '丝绸之路'],
          culturalSymbols: ['龙', '凤', '兵马俑', '古钟', '玉璧'],
          architecturalStyle: '唐代宫殿建筑',
          naturalElements: ['黄土高原', '秦岭山脉', '渭河', '古槐树', '牡丹花']
        }
      },
      
      '北京': {
        soul: 'ancient',
        energy: 'pulsing',
        essence: '紫禁城的皇家威严，胡同里的京味文化',
        colors: {
          primary: '#DC143C', // 中国红
          secondary: '#FFD700', // 皇家金
          accent: '#8B4513', // 故宫棕
          mood: ['#FF6347', '#FFA500', '#CD853F', '#D2691E', '#B22222']
        }
      },
      
      '大理': {
        soul: 'serene',
        energy: 'flowing',
        essence: '苍山洱海间的风花雪月，白族文化的诗意栖居',
        colors: {
          primary: '#4682B4', // 洱海蓝
          secondary: '#228B22', // 苍山绿
          accent: '#F0E68C', // 夕阳金
          mood: ['#E0F6FF', '#B8E6B8', '#FFE4B5', '#D3D3D3', '#87CEEB']
        }
      },
      
      '东京': {
        soul: 'futuristic',
        energy: 'explosive',
        essence: '霓虹闪烁的赛博朋克都市，传统与未来的极致碰撞',
        colors: {
          primary: '#FF0080', // 霓虹粉
          secondary: '#00FFFF', // 电子蓝
          accent: '#FFFF00', // 警示黄
          mood: ['#FF69B4', '#00CED1', '#ADFF2F', '#FF1493', '#00FF7F']
        }
      },
      
      '巴黎': {
        soul: 'romantic',
        energy: 'rhythmic',
        essence: '塞纳河畔的艺术与爱情，香榭丽舍的浪漫华尔兹',
        colors: {
          primary: '#C41E3A', // 玫瑰红
          secondary: '#FFD700', // 香槟金
          accent: '#E6E6FA', // 薰衣草紫
          mood: ['#FFC0CB', '#F0E68C', '#DDA0DD', '#F5F5DC', '#FFB6C1']
        }
      },
      
      '圣托里尼': {
        soul: 'mystical',
        energy: 'gentle',
        essence: '爱琴海上的蓝白梦境，古希腊神话的浪漫传说',
        colors: {
          primary: '#0077BE', // 爱琴海蓝
          secondary: '#FFFFFF', // 圣洁白
          accent: '#FF6B35', // 夕阳橙
          mood: ['#87CEEB', '#F0F8FF', '#FFE4B5', '#E0E0E0', '#B0E0E6']
        }
      }
    };

    // 获取城市档案或创建默认档案
    const profile = cityProfiles[cityName] || this.generateDefaultProfile(cityName, description);
    
    // 完善缺失的属性
    return {
      name: cityName,
      soul: profile.soul || 'serene',
      energy: profile.energy || 'flowing',
      essence: profile.essence || `探索${cityName}的独特魅力`,
      colors: profile.colors || {
        primary: '#8B5CF6',
        secondary: '#06B6D4',
        accent: '#F59E0B',
        mood: ['#E0E7FF', '#CFFAFE', '#FEF3C7', '#FEE2E2', '#F3E8FF']
      },
      typography: profile.typography || {
        style: 'organic',
        weight: 'bold',
        spacing: 'loose'
      },
      layout: profile.layout || {
        pattern: 'river',
        rhythm: 'legato',
        scale: 'intimate'
      },
      interactions: profile.interactions || {
        style: 'gentle',
        feedback: 'organic'
      },
      atmosphere: profile.atmosphere || {
        lighting: 'soft',
        texture: 'smooth',
        mood: 'peaceful'
      },
      signature: profile.signature || {
        uniqueElements: ['自然风光', '文化遗产', '现代建筑'],
        brandColors: ['#8B5CF6', '#06B6D4', '#F59E0B'],
        visualMetaphors: ['山水画', '现代都市', '文化符号'],
        culturalSymbols: ['传统图案', '现代元素'],
        architecturalStyle: '现代与传统融合',
        naturalElements: ['山', '水', '天空', '植物']
      }
    };
  }

  // 生成默认档案
  private generateDefaultProfile(cityName: string, description?: string): Partial<CityPersonality> {
    // 基于城市名称和描述生成基础档案
    return {
      soul: 'serene',
      energy: 'flowing',
      essence: `探索${cityName}的独特魅力`,
      colors: {
        primary: '#8B5CF6',
        secondary: '#06B6D4',
        accent: '#F59E0B',
        mood: ['#E0E7FF', '#CFFAFE', '#FEF3C7', '#FEE2E2', '#F3E8FF']
      }
    };
  }

  // 生成激进主题
  generateRadicalTheme(personality: CityPersonality): RadicalUITheme {
    return {
      layout: this.generateRadicalLayout(personality),
      visuals: this.generateRadicalVisuals(personality),
      interactions: this.generateRadicalInteractions(personality),
      colors: this.generateRadicalColors(personality),
      typography: this.generateRadicalTypography(personality)
    };
  }

  private generateRadicalLayout(personality: CityPersonality): RadicalUITheme['layout'] {
    const layoutMap: Record<CityPersonality['soul'], RadicalUITheme['layout']['type']> = {
      'ancient': 'ancient_temple',
      'romantic': 'romantic_garden', 
      'futuristic': 'cyber_matrix',
      'mystical': 'mystical_constellation',
      'vibrant': 'geometric_explosion',
      'serene': 'organic_flow',
      'rebellious': 'neon_grid'
    };

    // 根据城市个性生成不同的卡片排列方式
    const arrangementMap: Record<CityPersonality['soul'], RadicalUITheme['layout']['cardArrangement']> = {
      'ancient': 'structured',      // 古代：对称结构
      'romantic': 'flowing',        // 浪漫：流动布局
      'futuristic': 'scattered',    // 未来：散点排列
      'mystical': 'scattered',      // 神秘：散点分布
      'vibrant': 'chaotic',         // 活力：动态混乱
      'serene': 'harmonious',       // 宁静：和谐排列
      'rebellious': 'clustered'     // 叛逆：聚集分组
    };

    return {
      type: layoutMap[personality.soul],
      cardArrangement: arrangementMap[personality.soul],
      spacing: { 
        x: personality.energy === 'chaotic' ? 30 : 20, 
        y: personality.energy === 'explosive' ? 40 : 20, 
        chaos: personality.energy === 'chaotic' ? 0.8 : 0.2 
      },
      scale: { 
        min: personality.soul === 'mystical' ? 0.7 : 0.8, 
        max: personality.soul === 'vibrant' ? 1.3 : 1.2, 
        variance: personality.energy === 'explosive' ? 0.5 : 0.3 
      }
    };
  }

  private generateRadicalVisuals(personality: CityPersonality): RadicalUITheme['visuals'] {
    const backgroundMap: Record<CityPersonality['soul'], RadicalUITheme['visuals']['backgroundType']> = {
      'ancient': 'calligraphy',
      'romantic': 'particles',
      'futuristic': 'neon',
      'mystical': 'geometry',
      'vibrant': 'geometry',
      'serene': 'nature',
      'rebellious': 'neon'
    };

    return {
      backgroundType: backgroundMap[personality.soul],
      cardStyle: 'glass',
      borders: 'thin',
      shadows: 'soft'
    };
  }

  private generateRadicalInteractions(personality: CityPersonality): RadicalUITheme['interactions'] {
    return {
      hover: 'lift',
      click: 'ripple',
      entrance: 'fade'
    };
  }

  private generateRadicalColors(personality: CityPersonality): RadicalUITheme['colors'] {
    return {
      palette: [
        personality.colors.primary,
        personality.colors.secondary,
        personality.colors.accent,
        ...personality.colors.mood.slice(0, 2)
      ],
      distribution: 'complementary',
      saturation: 0.8,
      brightness: 0.9
    };
  }

  private generateRadicalTypography(personality: CityPersonality): RadicalUITheme['typography'] {
    return {
      fonts: ['Inter', 'Noto Sans SC'],
      sizes: [14, 16, 18, 24, 32, 48],
      weights: [400, 500, 600, 700, 800],
      styles: ['normal']
    };
  }
}

export const radicalUIGenerator = new RadicalUIGenerator();