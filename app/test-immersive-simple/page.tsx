'use client';

import { useState } from 'react';
import { ImmersiveSimple } from '../../components/travel/immersive-simple';
import { radicalUIGenerator } from '../../lib/radical-ui-generator';

// 测试数据
const testAttractions = [
  {
    name: '故宫博物院',
    location: '北京市东城区',
    description: '明清两代的皇家宫殿，世界文化遗产',
    tags: ['历史', '文化', '建筑'],
    vibeColor: '#DC143C',
    emoji: '🏯',
    rating: 4.8,
    bestTime: '上午',
    estimatedDuration: '3-4小时',
    attractionType: 'cultural'
  },
  {
    name: '天安门广场',
    location: '北京市东城区',
    description: '世界最大的城市广场，见证历史的地方',
    tags: ['历史', '政治', '地标'],
    vibeColor: '#FFD700',
    emoji: '🏛️',
    rating: 4.7,
    bestTime: '早晨',
    estimatedDuration: '1-2小时',
    attractionType: 'landmark'
  },
  {
    name: '长城',
    location: '北京市延庆区',
    description: '万里长城的精华段，世界七大奇迹之一',
    tags: ['历史', '自然', '徒步'],
    vibeColor: '#8B4513',
    emoji: '🏔️',
    rating: 4.9,
    bestTime: '全天',
    estimatedDuration: '半天',
    attractionType: 'natural'
  },
  {
    name: '颐和园',
    location: '北京市海淀区',
    description: '清代皇家园林，中国古典园林艺术的杰作',
    tags: ['园林', '历史', '湖泊'],
    vibeColor: '#228B22',
    emoji: '🏞️',
    rating: 4.6,
    bestTime: '下午',
    estimatedDuration: '2-3小时',
    attractionType: 'cultural'
  },
  {
    name: '天坛',
    location: '北京市东城区',
    description: '明清皇帝祭天的场所，建筑艺术的瑰宝',
    tags: ['历史', '建筑', '宗教'],
    vibeColor: '#4682B4',
    emoji: '⛩️',
    rating: 4.5,
    bestTime: '上午',
    estimatedDuration: '2小时',
    attractionType: 'cultural'
  },
  {
    name: '北海公园',
    location: '北京市西城区',
    description: '中国现存最古老的皇家园林之一',
    tags: ['园林', '湖泊', '历史'],
    vibeColor: '#20B2AA',
    emoji: '🌸',
    rating: 4.4,
    bestTime: '下午',
    estimatedDuration: '2-3小时',
    attractionType: 'natural'
  }
];

export default function TestImmersiveSimplePage() {
  const destination = '北京';
  const personality = radicalUIGenerator.analyzeCityPersonality(destination);
  const theme = radicalUIGenerator.generateRadicalTheme(personality);

  return (
    <ImmersiveSimple
      destination={destination}
      attractions={testAttractions}
      personality={personality}
      theme={theme}
    />
  );
}