// 景点收藏状态管理
export interface SavedAttraction {
  id: string;
  name: string;
  location: string;
  type: string;
  description: string;
  emoji?: string;
  vibeColor?: string;
  rating?: number;
}

class AttractionStore {
  private attractions: SavedAttraction[] = [];
  private listeners: (() => void)[] = [];

  // 添加景点到收藏
  addAttraction(attraction: SavedAttraction) {
    const exists = this.attractions.find(a => a.id === attraction.id);
    if (!exists) {
      this.attractions.push(attraction);
      this.notifyListeners();
    }
  }

  // 移除景点
  removeAttraction(id: string) {
    this.attractions = this.attractions.filter(a => a.id !== id);
    this.notifyListeners();
  }

  // 检查是否已收藏
  isLiked(id: string): boolean {
    return this.attractions.some(a => a.id === id);
  }

  // 获取所有收藏的景点
  getAttractions(): SavedAttraction[] {
    return [...this.attractions];
  }

  // 清空收藏
  clear() {
    this.attractions = [];
    this.notifyListeners();
  }

  // 订阅状态变化
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const attractionStore = new AttractionStore();