import React from 'react';

// 目的地上下文管理器
// 管理当前对话中的目的地信息，用于限制景点搜索范围

export interface DestinationInfo {
  name: string;           // 目的地名称
  country?: string;       // 国家
  region?: string;        // 地区/省份
  coordinates?: {         // 坐标（用于地理范围限制）
    lat: number;
    lng: number;
  };
  radius?: number;        // 搜索半径（公里）
  aliases?: string[];     // 别名（如：北京、Beijing、Peking）
}

class DestinationContextManager {
  private currentDestination: DestinationInfo | null = null;
  private listeners: (() => void)[] = [];

  /**
   * 直接设置目的地（不进行文本检测）
   */
  setDestinationDirect(destinationName: string) {
    console.log('🎯 DestinationContext: setDestinationDirect called with:', destinationName);
    
    // 尝试从预定义城市中找到匹配的目的地信息
    const predefinedInfo = this.getPredefinedDestinationInfo(destinationName);
    if (predefinedInfo) {
      console.log('✅ DestinationContext: Found predefined info for:', destinationName, predefinedInfo);
      this.setDestination(predefinedInfo);
    } else {
      // 如果没有预定义信息，创建基础目的地信息
      console.log('📍 DestinationContext: Creating basic destination info for:', destinationName);
      const basicInfo = {
        name: destinationName,
        radius: 50
      };
      console.log('📍 DestinationContext: Basic info created:', basicInfo);
      this.setDestination(basicInfo);
    }
  }
  setDestination(destination: DestinationInfo) {
    console.log('🎯 DestinationContext: Setting destination context:', destination.name);
    this.currentDestination = destination;
    this.notifyListeners();
    console.log('🎯 DestinationContext: Notified', this.listeners.length, 'listeners');
  }

  /**
   * 获取当前目的地
   */
  getCurrentDestination(): DestinationInfo | null {
    return this.currentDestination;
  }

  /**
   * 从文本中自动检测并设置目的地
   */
  detectAndSetDestination(text: string): DestinationInfo | null {
    console.log('🔍 Detecting destination from text:', text);
    
    // 确保输入是字符串
    const textStr = typeof text === 'string' ? text : String(text);
    console.log('🔍 Converted text to string:', textStr);
    
    const detected = this.detectDestinationFromText(textStr);
    if (detected) {
      console.log('✅ Destination detected:', detected.name);
      this.setDestination(detected);
    } else {
      console.log('❌ No destination detected in text');
    }
    return detected;
  }

  /**
   * 检测文本中的目的地信息
   */
  private detectDestinationFromText(text: string): DestinationInfo | null {
    console.log('🔍 Analyzing text for destination:', text);
    
    // 确保输入是字符串并且有效
    if (!text || typeof text !== 'string') {
      console.log('❌ Invalid text input:', typeof text, text);
      return null;
    }
    
    const textStr = text.trim();
    if (textStr.length === 0) {
      console.log('❌ Empty text input');
      return null;
    }
    
    // 首先尝试从复合格式中提取主要城市名称
    // 例如：'大理洱海 (Dali & Erhai Lake)' -> '大理'
    // 例如：'Xi An 3-Day Culture Trip' -> 'Xi An'
    
    // 特殊处理：直接检查是否包含已知城市名
    const knownCities = [
      '北京', '上海', '西安', '杭州', '成都', '大理', '宁波', '潮汕', '澳门', '清迈', '东京', '巴黎', '伦敦', '纽约',
      'Beijing', 'Shanghai', 'Xi An', 'Hangzhou', 'Chengdu', 'Dali', 'Ningbo', 'Chaoshan', 'Macau', 'Chiang Mai', 
      'Tokyo', 'Paris', 'London', 'New York', 'Santorini'
    ];
    
    for (const city of knownCities) {
      if (textStr.includes(city)) {
        console.log('🎯 Found known city in compound text:', city);
        if (this.isValidDestination(city)) {
          console.log('✅ Known city is valid:', city);
          return this.createDestinationInfo(city);
        }
      }
    }
    
    // 如果没有找到已知城市，尝试正则表达式提取
    const compoundPatterns = [
      // 英文城市名 + 数字 + Day + 其他词汇 (如: "Xi An 3-Day Culture Trip")
      /^([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+\d+[-\s]*[Dd]ay/,
      // 中文城市名 + 景点名 + 英文括号格式 - 只提取前2个中文字符作为城市名
      /^([\u4e00-\u9fa5]{2})[\u4e00-\u9fa5]*\s*\([^)]+\)$/,
      // 中文城市名 + 景点名（无括号） - 只提取前2个中文字符作为城市名  
      /^([\u4e00-\u9fa5]{2})[\u4e00-\u9fa5]+$/,
      // 英文城市名 + 其他信息
      /^([A-Za-z\s]{3,15})\s*[&\-\+]?\s*[A-Za-z\s]*$/,
    ];
    
    for (const pattern of compoundPatterns) {
      const match = textStr.match(pattern);
      if (match && match[1]) {
        const extractedCity = match[1].trim();
        console.log('🎯 Extracted city from compound format:', extractedCity);
        
        // 检查提取的城市名是否有效
        if (this.isValidDestination(extractedCity)) {
          console.log('✅ Extracted city is valid:', extractedCity);
          return this.createDestinationInfo(extractedCity);
        }
      }
    }
    
    // 首先检查是否已经有目的地上下文，如果有且查询中没有明确指定其他地方，则保持当前目的地
    if (this.currentDestination) {
      const currentDestName = this.currentDestination.name.toLowerCase();
      const textLower = textStr.toLowerCase();
      
      // 如果文本中没有明确提到其他城市，保持当前目的地
      const otherCityMentioned = this.hasOtherCityMention(textStr, this.currentDestination.name);
      if (!otherCityMentioned) {
        console.log('🎯 Keeping current destination context:', this.currentDestination.name);
        return this.currentDestination;
      }
    }
    
    // 目的地检测模式 - 更精确的检测
    const destinationPatterns = [
      // 明确的旅行意图 - 中文模式（改进版，避免匹配到动词）
      /(?:去|到|游览|旅游|参观|想去|计划去|打算去)\s*([A-Za-z\u4e00-\u9fa5]{2,15})(?=\s|$|[玩游览旅游参观，。！？])/gi,
      // 英文旅行意图模式 - 支持多词城市名
      /(?:plan.*?trip\s+to|visit|explore|travel\s+to|go\s+to|trip\s+to)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)/gi,
      // 行程规划模式 - 中英文
      /([A-Za-z\u4e00-\u9fa5]+(?:\s+[A-Za-z]+)*)\s*(?:\d+[-\s]*day|day|days|\d+日游|\d+天|\d+日行程|itinerary|trip|culture\s+trip)/gi,
      // 景点查询模式 - 更宽松的匹配
      /([A-Za-z\u4e00-\u9fa5]{2,15})\s*(?:的|有什么|哪里有|附近的)?\s*(?:景点|博物馆|寺庙|公园|古迹|名胜|好玩|attractions?|places?|museums?|temples?)/gi,
      // 直接城市名 + 地点类型
      /([A-Za-z\u4e00-\u9fa5]{2,15})\s*(?:市|城|地区|area|city)/gi,
      // 单独的知名城市名（如果在预定义列表中） - 扩展英文城市
      /\b(杭州|西安|北京|上海|成都|大理|宁波|清迈|东京|巴黎|伦敦|纽约|潮汕|Tokyo|Paris|London|New\s+York|Xi\s*An|Beijing|Shanghai|Hangzhou|Chengdu|Dali|Ningbo|Chiang\s+Mai|Santorini)\b/gi,
    ];

    for (const pattern of destinationPatterns) {
      console.log('🔍 Testing pattern:', pattern.source);
      const matches = textStr.matchAll(pattern);
      for (const match of matches) {
        const potentialDest = match[1]?.trim();
        console.log('🎯 Potential destination found:', potentialDest);
        if (potentialDest && this.isValidDestination(potentialDest)) {
          console.log('✅ Valid destination confirmed:', potentialDest);
          return this.createDestinationInfo(potentialDest);
        } else {
          console.log('❌ Invalid destination:', potentialDest);
        }
      }
    }

    console.log('❌ No destination found in text');
    return null;
  }

  /**
   * 检查文本中是否提到了其他城市
   */
  private hasOtherCityMention(text: string, currentCity: string): boolean {
    const knownCities = [
      '北京', '上海', '西安', '杭州', '成都', '大理', '清迈', '东京', '巴黎', '伦敦', '纽约', '宁波', '潮汕', '澳门',
      'Beijing', 'Shanghai', 'Xi An', 'Hangzhou', 'Chengdu', 'Dali', 'Chiang Mai', 
      'Tokyo', 'Paris', 'London', 'New York', 'Ningbo', 'Santorini'
    ];
    const textLower = text.toLowerCase();
    const currentLower = currentCity.toLowerCase();
    
    return knownCities.some(city => {
      const cityLower = city.toLowerCase();
      return cityLower !== currentLower && textLower.includes(cityLower);
    });
  }

  /**
   * 验证是否为有效的目的地名称
   */
  private isValidDestination(name: string): boolean {
    // 标准化名称 - 移除动词后缀
    const normalizedName = name
      .replace(/[玩游览旅游参观]$/, '')
      .replace(/[，。！？\s]+$/, '')
      .trim();
    
    // 过滤掉常见的非目的地词汇
    const excludeWords = [
      '景点', '地方', '什么', '哪里', '怎么', '如何', '推荐', 'attractions', 'places', 
      'where', 'what', 'how', 'recommend', '好玩', '有趣', '值得', '必去', '博物馆', 
      'museums', '寺庙', 'temples', '公园', 'parks', '古迹', '名胜', '玩', 'culture',
      'trip', 'day', 'days', 'itinerary', 'plan', 'travel'
    ];
    
    const lowerName = normalizedName.toLowerCase();
    if (excludeWords.some(word => lowerName === word || lowerName.endsWith(word))) {
      return false;
    }

    // 长度检查
    if (normalizedName.length < 2 || normalizedName.length > 20) {
      return false;
    }

    // 必须包含字母或中文字符
    if (!/[A-Za-z\u4e00-\u9fa5]/.test(normalizedName)) {
      return false;
    }

    // 检查是否是预定义的城市
    const predefinedInfo = this.getPredefinedDestinationInfo(normalizedName);
    if (predefinedInfo) {
      console.log('✅ Found in predefined destinations:', normalizedName);
      return true;
    }

    // 对于不在预定义列表中的，进行更严格的验证
    // 如果包含明显的城市标识符，也认为是有效的
    const cityIndicators = ['市', '城', '镇', 'city', 'town'];
    if (cityIndicators.some(indicator => lowerName.includes(indicator))) {
      return true;
    }

    // 如果是2-4个中文字符，可能是城市名
    if (/^[\u4e00-\u9fa5]{2,4}$/.test(normalizedName)) {
      return true;
    }

    // 如果是英文且长度合适，也可能是城市名（但要排除常见的非城市词汇）
    if (/^[A-Za-z\s]{3,15}$/.test(normalizedName)) {
      // 额外检查：不能是纯粹的动词或形容词
      const commonNonCityWords = ['culture', 'trip', 'day', 'days', 'plan', 'travel', 'visit', 'explore'];
      if (!commonNonCityWords.includes(lowerName)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 创建目的地信息对象
   */
  private createDestinationInfo(name: string): DestinationInfo {
    // 标准化目的地名称 - 移除常见的动词后缀和中间的旅游词汇
    let normalizedName = name
      .replace(/[玩游览旅游参观]$/, '') // 移除末尾的动词
      .replace(/[，。！？\s]+$/, '') // 移除末尾的标点和空格
      .replace(/旅游?/, '') // 移除中间的"旅"或"旅游"
      .replace(/游玩?/, '') // 移除中间的"游"或"游玩"
      .trim();
    
    console.log('🔧 Creating destination info, normalized from', name, 'to', normalizedName);
    
    // 获取预定义的目的地信息
    const predefinedInfo = this.getPredefinedDestinationInfo(normalizedName);
    if (predefinedInfo) {
      return predefinedInfo;
    }

    // 创建基础目的地信息
    return {
      name: normalizedName,
      radius: 50, // 默认搜索半径50公里
    };
  }

  /**
   * 获取预定义的目的地信息 (public for testing)
   */
  getPredefinedDestinationInfo(name: string): DestinationInfo | null {
    console.log('🔍 getPredefinedDestinationInfo called with:', name);
    
    const destinations: Record<string, DestinationInfo> = {
      // 中国主要城市
      '北京': {
        name: '北京',
        country: '中国',
        coordinates: { lat: 39.9042, lng: 116.4074 },
        radius: 100,
        aliases: ['Beijing', 'Peking', '北京市', 'beijing']
      },
      '上海': {
        name: '上海',
        country: '中国',
        coordinates: { lat: 31.2304, lng: 121.4737 },
        radius: 80,
        aliases: ['Shanghai', '上海市', 'shanghai']
      },
      '西安': {
        name: '西安',
        country: '中国',
        coordinates: { lat: 34.3416, lng: 108.9398 },
        radius: 60,
        aliases: ['Xi\'an', 'Xian', 'Xi An', '西安市', 'xian', 'xi an']
      },
      '杭州': {
        name: '杭州',
        country: '中国',
        coordinates: { lat: 30.2741, lng: 120.1551 },
        radius: 50,
        aliases: ['Hangzhou', '杭州市', 'hangzhou']
      },
      '成都': {
        name: '成都',
        country: '中国',
        coordinates: { lat: 30.5728, lng: 104.0668 },
        radius: 60,
        aliases: ['Chengdu', '成都市', 'chengdu']
      },
      '大理': {
        name: '大理',
        country: '中国',
        region: '云南省',
        coordinates: { lat: 25.6066, lng: 100.2692 },
        radius: 40,
        aliases: ['Dali', '大理市', 'dali', 'Dali Erhai Lake Tour', 'Dali & Erhai Lake']
      },
      '宁波': {
        name: '宁波',
        country: '中国',
        region: '浙江省',
        coordinates: { lat: 29.8683, lng: 121.5440 },
        radius: 50,
        aliases: ['Ningbo', '宁波市', 'ningbo']
      },
      '潮汕': {
        name: '潮汕',
        country: '中国',
        region: '广东省',
        coordinates: { lat: 23.3540, lng: 116.6819 },
        radius: 60,
        aliases: ['Chaoshan', '潮州', '汕头', 'chaoshan']
      },
      '清迈': {
        name: '清迈',
        country: '泰国',
        coordinates: { lat: 18.7883, lng: 98.9853 },
        radius: 30,
        aliases: ['Chiang Mai', 'เชียงใหม่', 'chiang mai', 'chiangmai']
      },

      // 国际城市
      '东京': {
        name: '东京',
        country: '日本',
        coordinates: { lat: 35.6762, lng: 139.6503 },
        radius: 50,
        aliases: ['Tokyo', '東京', 'tokyo']
      },
      '巴黎': {
        name: '巴黎',
        country: '法国',
        coordinates: { lat: 48.8566, lng: 2.3522 },
        radius: 40,
        aliases: ['Paris', 'paris']
      },
      '伦敦': {
        name: '伦敦',
        country: '英国',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        radius: 50,
        aliases: ['London', 'london']
      },
      '纽约': {
        name: '纽约',
        country: '美国',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        radius: 60,
        aliases: ['New York', 'NYC', 'new york', 'nyc']
      },

      // 英文城市名作为主键
      'Tokyo': {
        name: 'Tokyo',
        country: 'Japan',
        coordinates: { lat: 35.6762, lng: 139.6503 },
        radius: 50,
        aliases: ['东京', '東京', 'tokyo']
      },
      'Paris': {
        name: 'Paris',
        country: 'France',
        coordinates: { lat: 48.8566, lng: 2.3522 },
        radius: 40,
        aliases: ['巴黎', 'paris']
      },
      'London': {
        name: 'London',
        country: 'United Kingdom',
        coordinates: { lat: 51.5074, lng: -0.1278 },
        radius: 50,
        aliases: ['伦敦', 'london']
      },
      'New York': {
        name: 'New York',
        country: 'United States',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        radius: 60,
        aliases: ['纽约', 'NYC', 'new york', 'nyc']
      },
      'Xi An': {
        name: 'Xi An',
        country: 'China',
        coordinates: { lat: 34.3416, lng: 108.9398 },
        radius: 60,
        aliases: ['西安', 'Xi\'an', 'Xian', '西安市', 'xian', 'xi an']
      },
      'Beijing': {
        name: 'Beijing',
        country: 'China',
        coordinates: { lat: 39.9042, lng: 116.4074 },
        radius: 100,
        aliases: ['北京', 'Peking', '北京市', 'beijing']
      },
      'Shanghai': {
        name: 'Shanghai',
        country: 'China',
        coordinates: { lat: 31.2304, lng: 121.4737 },
        radius: 80,
        aliases: ['上海', '上海市', 'shanghai']
      },
      'Hangzhou': {
        name: 'Hangzhou',
        country: 'China',
        coordinates: { lat: 30.2741, lng: 120.1551 },
        radius: 50,
        aliases: ['杭州', '杭州市', 'hangzhou']
      },
      'Chengdu': {
        name: 'Chengdu',
        country: 'China',
        coordinates: { lat: 30.5728, lng: 104.0668 },
        radius: 60,
        aliases: ['成都', '成都市', 'chengdu']
      },
      'Dali': {
        name: 'Dali',
        country: 'China',
        region: 'Yunnan Province',
        coordinates: { lat: 25.6066, lng: 100.2692 },
        radius: 40,
        aliases: ['大理', '大理市', 'dali', 'Dali Erhai Lake Tour', 'Dali & Erhai Lake']
      },
      'Chiang Mai': {
        name: 'Chiang Mai',
        country: 'Thailand',
        coordinates: { lat: 18.7883, lng: 98.9853 },
        radius: 30,
        aliases: ['清迈', 'เชียงใหม่', 'chiang mai', 'chiangmai']
      },
      'Santorini': {
        name: 'Santorini',
        country: 'Greece',
        coordinates: { lat: 36.3932, lng: 25.4615 },
        radius: 20,
        aliases: ['圣托里尼', 'santorini', 'Santorini Sunset Route']
      },
    };

    // 直接匹配（不区分大小写）
    const lowerName = name.toLowerCase().trim();
    console.log('🔍 Searching for destination with lowerName:', lowerName);
    
    for (const [key, info] of Object.entries(destinations)) {
      console.log('🔍 Checking key:', key, 'against:', lowerName);
      if (key.toLowerCase() === lowerName) {
        console.log('✅ Direct match found:', key, '→', info.name);
        return info;
      }
      
      // 检查别名（不区分大小写，支持部分匹配）
      if (info.aliases?.some(alias => {
        const aliasLower = alias.toLowerCase();
        console.log('🔍 Checking alias:', alias, '(', aliasLower, ') against:', lowerName);
        const exactMatch = aliasLower === lowerName;
        const partialMatch = (lowerName.length >= 3 && aliasLower.includes(lowerName)) ||
                           (lowerName.length >= 3 && lowerName.includes(aliasLower));
        console.log('🔍 Alias check results - exact:', exactMatch, 'partial:', partialMatch);
        return exactMatch || partialMatch;
      })) {
        console.log('✅ Alias match found for key:', key, '→', info.name);
        return info;
      }
    }

    console.log('❌ No match found for:', name);
    return null;
  }

  /**
   * 检查景点是否在当前目的地范围内
   */
  isAttractionInDestination(attractionName: string, attractionLocation?: string): boolean {
    if (!this.currentDestination) {
      return true; // 没有设置目的地时，不限制
    }

    const destination = this.currentDestination;
    const attractionNameLower = attractionName.toLowerCase();
    const attractionLocationLower = (attractionLocation || '').toLowerCase();
    const destName = destination.name.toLowerCase();

    console.log('🔍 Checking attraction in destination:');
    console.log('   Attraction:', attractionName);
    console.log('   Location:', attractionLocation);
    console.log('   Destination:', destination.name);

    // 检查地址是否包含目的地名称或别名
    const destNames = [destination.name, ...(destination.aliases || [])];
    
    const isMatch = destNames.some(name => {
      const nameLower = name.toLowerCase();
      return (
        // 地址包含目的地名称
        attractionLocationLower.includes(nameLower) ||
        attractionLocationLower.includes(nameLower + '市') ||
        attractionLocationLower.includes(nameLower + '区') ||
        attractionLocationLower.includes(nameLower + '县') ||
        // 景点名称包含目的地名称（但地址也必须相关）
        (attractionNameLower.includes(nameLower) && 
         (attractionLocationLower.includes(nameLower) || attractionLocationLower.length < 10))
      );
    });

    // 额外检查：排除明确提到其他城市的结果
    const otherCities = ['北京', '上海', '西安', '杭州', '成都', '大理', '广州', '深圳', '南京', '苏州'];
    const mentionsOtherCity = otherCities
      .filter(city => city.toLowerCase() !== destName)
      .some(city => attractionLocationLower.includes(city.toLowerCase()));

    const finalResult = isMatch && !mentionsOtherCity;
    
    console.log('   Match result:', finalResult);
    console.log('   Mentions other city:', mentionsOtherCity);
    
    return finalResult;
  }

  /**
   * 生成地理限制的搜索查询
   */
  buildLocationRestrictedQuery(originalQuery: string): string {
    if (!this.currentDestination) {
      return originalQuery;
    }

    const destination = this.currentDestination;
    
    // 如果查询中已经包含目的地信息，直接返回
    const queryLower = originalQuery.toLowerCase();
    const destNames = [destination.name, ...(destination.aliases || [])];
    
    const alreadyHasLocation = destNames.some(name => 
      queryLower.includes(name.toLowerCase())
    );

    if (alreadyHasLocation) {
      return originalQuery;
    }

    // 添加地理限制
    let restrictedQuery = `${destination.name} ${originalQuery}`;
    
    // 添加更具体的地理信息
    if (destination.country && destination.country !== '中国') {
      restrictedQuery += ` ${destination.country}`;
    }
    
    if (destination.region) {
      restrictedQuery += ` ${destination.region}`;
    }

    return restrictedQuery;
  }

  /**
   * 清除当前目的地
   */
  clearDestination() {
    console.log('🧹 Clearing destination context');
    this.currentDestination = null;
    this.notifyListeners();
  }

  /**
   * 订阅目的地变化
   */
  subscribe(listener: () => void): () => void {
    console.log('🔗 DestinationContext: New listener subscribed, total listeners:', this.listeners.length + 1);
    this.listeners.push(listener);
    return () => {
      console.log('🔗 DestinationContext: Listener unsubscribed, remaining listeners:', this.listeners.length - 1);
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * 获取监听器数量（用于调试）
   */
  getListenerCount(): number {
    return this.listeners.length;
  }
  private notifyListeners() {
    console.log('🔔 DestinationContext: Notifying', this.listeners.length, 'listeners');
    this.listeners.forEach((listener, index) => {
      console.log(`🔔 DestinationContext: Calling listener ${index + 1}`);
      try {
        listener();
        console.log(`✅ DestinationContext: Listener ${index + 1} called successfully`);
      } catch (error) {
        console.error(`❌ DestinationContext: Listener ${index + 1} failed:`, error);
      }
    });
  }

  /**
   * 获取目的地显示信息
   */
  getDestinationDisplayInfo(): { name: string; flag?: string; description?: string } | null {
    if (!this.currentDestination) return null;

    const destination = this.currentDestination;
    const countryFlags: Record<string, string> = {
      '中国': '🇨🇳',
      '日本': '🇯🇵',
      '泰国': '🇹🇭',
      '法国': '🇫🇷',
      '英国': '🇬🇧',
      '美国': '🇺🇸',
    };

    return {
      name: destination.name,
      flag: destination.country ? countryFlags[destination.country] : undefined,
      description: destination.region ? `${destination.country} ${destination.region}` : destination.country
    };
  }
}

// 导出单例实例
export const destinationContext = new DestinationContextManager();

// 导出类型和实用函数
export { DestinationContextManager };

/**
 * React Hook 用于订阅目的地变化
 */
export function useDestinationContext() {
  const [destination, setDestination] = React.useState<DestinationInfo | null>(
    destinationContext.getCurrentDestination()
  );

  React.useEffect(() => {
    console.log('🔗 useDestinationContext: Setting up subscription');
    const unsubscribe = destinationContext.subscribe(() => {
      console.log('🔗 useDestinationContext: Destination changed, updating state');
      const newDestination = destinationContext.getCurrentDestination();
      setDestination(newDestination);
    });
    
    console.log('🔗 useDestinationContext: Subscription set up, current listener count:', destinationContext.getListenerCount());
    
    return unsubscribe;
  }, []);

  // 同步当前状态（防止初始化时的状态不一致）
  React.useEffect(() => {
    const currentDestination = destinationContext.getCurrentDestination();
    if (currentDestination?.name !== destination?.name) {
      console.log('🔗 useDestinationContext: Syncing state, current:', currentDestination?.name, 'hook state:', destination?.name);
      setDestination(currentDestination);
    }
  }, [destination]);

  return {
    destination,
    setDestination: (dest: DestinationInfo) => destinationContext.setDestination(dest),
    clearDestination: () => destinationContext.clearDestination(),
    detectFromText: (text: string) => destinationContext.detectAndSetDestination(text),
    buildRestrictedQuery: (query: string) => destinationContext.buildLocationRestrictedQuery(query),
    isInDestination: (name: string, location?: string) => 
      destinationContext.isAttractionInDestination(name, location)
  };
}