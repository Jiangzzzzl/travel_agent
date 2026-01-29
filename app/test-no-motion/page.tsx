'use client';

import { useState } from 'react';
import { radicalUIGenerator } from '../../lib/radical-ui-generator';

export default function TestNoMotionPage() {
  const [showDetails, setShowDetails] = useState(false);
  
  const destination = '北京';
  const personality = radicalUIGenerator.analyzeCityPersonality(destination);
  const theme = radicalUIGenerator.generateRadicalTheme(personality);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Test Without Framer Motion
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">City Personality Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>目的地:</strong> {destination}
            </div>
            <div>
              <strong>城市个性:</strong> {personality.soul}
            </div>
            <div>
              <strong>能量:</strong> {personality.energy}
            </div>
            <div>
              <strong>主题类型:</strong> {theme.layout.type}
            </div>
            <div>
              <strong>主色调:</strong> 
              <span 
                className="inline-block w-4 h-4 rounded ml-2"
                style={{ backgroundColor: personality.colors.primary }}
              />
              {personality.colors.primary}
            </div>
            <div>
              <strong>背景类型:</strong> {theme.visuals.backgroundType}
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {showDetails ? '隐藏详情' : '显示详情'}
            </button>
          </div>
          
          {showDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold mb-2">城市精神:</h3>
              <p className="text-gray-700">{personality.essence}</p>
              
              <h3 className="font-bold mt-4 mb-2">色彩情绪:</h3>
              <div className="flex gap-2">
                {personality.colors.mood.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            This page tests the radical UI generator without framer-motion.
          </p>
        </div>
      </div>
    </div>
  );
}