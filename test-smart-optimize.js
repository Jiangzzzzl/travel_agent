// 简单测试Smart Optimize功能
const { itineraryStore } = require('./lib/itinerary-store');

async function testSmartOptimize() {
  console.log('🧪 Testing Smart Optimize functionality...');
  
  // 清空现有行程
  itineraryStore.clear();
  
  // 设置3天行程
  itineraryStore.setTotalDays(3);
  
  // 添加一些测试景点
  const testAttractions = [
    {
      id: 'test-1',
      name: '故宫博物院',
      location: '北京市东城区景山前街4号',
      emoji: '🏛️',
      estimatedDuration: '3小时',
      coordinates: { lat: 39.9163, lng: 116.3972 },
      priority: 5
    },
    {
      id: 'test-2', 
      name: '天坛公园',
      location: '北京市东城区天坛路甲1号',
      emoji: '🏛️',
      estimatedDuration: '2小时',
      coordinates: { lat: 39.8823, lng: 116.4066 },
      priority: 4
    },
    {
      id: 'test-3',
      name: '颐和园',
      location: '北京市海淀区新建宫门路19号',
      emoji: '🏞️',
      estimatedDuration: '4小时',
      coordinates: { lat: 39.9999, lng: 116.2755 },
      priority: 4
    },
    {
      id: 'test-4',
      name: '北海公园',
      location: '北京市西城区文津街1号',
      emoji: '🏞️',
      estimatedDuration: '2小时',
      coordinates: { lat: 39.9289, lng: 116.3883 },
      priority: 3
    }
  ];
  
  console.log(`📝 Adding ${testAttractions.length} test attractions...`);
  
  // 添加景点到行程
  for (const attraction of testAttractions) {
    await itineraryStore.addAttractionAuto(attraction);
  }
  
  // 检查添加后的状态
  const beforeOptimize = itineraryStore.getAllDayPlans();
  const totalBeforeOptimize = itineraryStore.getTotalAttractions();
  
  console.log(`📊 Before optimize: ${totalBeforeOptimize} attractions`);
  beforeOptimize.forEach(day => {
    console.log(`  Day ${day.day}: ${day.attractions.length} attractions - ${day.attractions.map(a => a.name).join(', ')}`);
  });
  
  // 执行Smart Optimize
  console.log('🔄 Running Smart Optimize...');
  await itineraryStore.reoptimizeItinerary();
  
  // 检查优化后的状态
  const afterOptimize = itineraryStore.getAllDayPlans();
  const totalAfterOptimize = itineraryStore.getTotalAttractions();
  
  console.log(`📊 After optimize: ${totalAfterOptimize} attractions`);
  afterOptimize.forEach(day => {
    console.log(`  Day ${day.day}: ${day.attractions.length} attractions - ${day.attractions.map(a => a.name).join(', ')}`);
  });
  
  // 验证结果
  if (totalBeforeOptimize === totalAfterOptimize) {
    console.log('✅ SUCCESS: All attractions preserved during optimization!');
    
    // 检查是否有更好的分布
    const distributionBefore = beforeOptimize.map(d => d.attractions.length);
    const distributionAfter = afterOptimize.map(d => d.attractions.length);
    
    console.log(`📈 Distribution before: [${distributionBefore.join(', ')}]`);
    console.log(`📈 Distribution after:  [${distributionAfter.join(', ')}]`);
    
    return true;
  } else {
    console.log(`❌ FAILED: Lost ${totalBeforeOptimize - totalAfterOptimize} attractions during optimization!`);
    return false;
  }
}

// 运行测试
testSmartOptimize().then(success => {
  console.log(success ? '🎉 Test passed!' : '💥 Test failed!');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});