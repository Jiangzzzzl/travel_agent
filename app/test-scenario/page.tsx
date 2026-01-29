'use client';

import React, { useState } from 'react';
import { destinationContext, useDestinationContext } from '@/lib/destination-context';
import { parseJSONComponents } from '@/lib/parse-json-components';

export default function TestScenarioPage() {
  const { destination } = useDestinationContext();
  const [testResult, setTestResult] = useState<string>('');

  const simulateUserQuery = () => {
    console.log('🎭 Simulating user query: "Dali Erhai Lake Tour"');
    
    // Simulate what happens when AI responds with a destinationHero component
    const mockAIResponse = `{
      "components": [
        {
          "type": "destinationHero",
          "destination": "Dali Erhai Lake Tour",
          "tagline": "Ancient City Meets Pristine Lake",
          "highlights": ["Erhai Lake", "Dali Ancient City", "Three Pagodas"],
          "themeColor": "#4F46E5",
          "emoji": "🏔️",
          "backgroundPattern": "nature"
        }
      ]
    }`;
    
    console.log('🎭 Parsing mock AI response...');
    const result = parseJSONComponents(mockAIResponse);
    
    console.log('🎭 Parse result:', result);
    console.log('🎭 Current destination after parsing:', destinationContext.getCurrentDestination()?.name);
    
    setTestResult(`Parsed ${result.components.length} components. Current destination: ${destinationContext.getCurrentDestination()?.name || 'None'}`);
  };

  const testDirectSetting = () => {
    console.log('🎯 Testing direct destination setting...');
    destinationContext.setDestinationDirect('Dali Erhai Lake Tour');
    console.log('🎯 Current destination after direct setting:', destinationContext.getCurrentDestination()?.name);
    setTestResult(`Direct setting result: ${destinationContext.getCurrentDestination()?.name || 'None'}`);
  };

  const clearDestination = () => {
    console.log('🧹 Clearing destination...');
    destinationContext.clearDestination();
    setTestResult('Destination cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Scenario Test</h1>
        <p className="text-gray-600 mb-8">
          This page simulates the exact scenario where a user asks about "Dali Erhai Lake Tour" 
          and tests if the right panel properly detects the destination.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current State */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 rounded-md">
                <h3 className="font-semibold mb-2">Destination from Hook:</h3>
                {destination ? (
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {destination.name}</p>
                    <p><strong>Country:</strong> {destination.country}</p>
                    <p><strong>Region:</strong> {destination.region}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No destination set</p>
                )}
              </div>
              
              <div className="p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold mb-2">Direct Context Check:</h3>
                <p className="text-sm"><strong>Name:</strong> {destinationContext.getCurrentDestination()?.name || 'None'}</p>
                <p className="text-sm"><strong>Listeners:</strong> {destinationContext.getListenerCount()}</p>
              </div>
              
              {testResult && (
                <div className="p-4 bg-green-50 rounded-md">
                  <h3 className="font-semibold mb-2">Test Result:</h3>
                  <p className="text-sm">{testResult}</p>
                </div>
              )}
            </div>
          </div>

          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Scenarios</h2>
            
            <div className="space-y-4">
              <button
                onClick={simulateUserQuery}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                🎭 Simulate User Query
                <div className="text-sm opacity-90 mt-1">
                  (Simulate AI response with destinationHero)
                </div>
              </button>
              
              <button
                onClick={testDirectSetting}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
              >
                🎯 Test Direct Setting
                <div className="text-sm opacity-90 mt-1">
                  (Call setDestinationDirect directly)
                </div>
              </button>
              
              <button
                onClick={clearDestination}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
              >
                🧹 Clear Destination
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-md">
              <h3 className="font-semibold text-yellow-800 mb-2">Expected Behavior:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• User asks about "Dali Erhai Lake Tour"</li>
                <li>• AI responds with destinationHero component</li>
                <li>• JSON parsing calls setDestinationDirect</li>
                <li>• Right panel should show "大理" as destination</li>
                <li>• Search should be restricted to Dali area</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Simulated Right Panel */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Simulated Right Panel Behavior</h2>
          <div className="p-4 bg-gray-100 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Search Scope:</span>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                destination 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {destination ? destination.name : '全球'}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {destination 
                ? `Search will be restricted to ${destination.name} area (${destination.radius}km radius)`
                : 'Search will be global (no geographic restrictions)'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}