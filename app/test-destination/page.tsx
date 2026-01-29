'use client';

import React, { useState, useEffect } from 'react';
import { destinationContext, useDestinationContext } from '@/lib/destination-context';

export default function TestDestinationPage() {
  const { destination } = useDestinationContext();
  const [testInput, setTestInput] = useState('Dali Erhai Lake Tour');
  const [logs, setLogs] = useState<string[]>([]);

  // Capture console logs
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      setLogs(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${message}`]);
      originalLog(...args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const handleTest = () => {
    console.log('🧪 Testing destination detection with:', testInput);
    console.log('🧪 Current listener count before:', destinationContext.getListenerCount());
    
    // Test the predefined destination info lookup directly
    console.log('🧪 Testing predefined destination lookup...');
    const predefinedInfo = destinationContext.getPredefinedDestinationInfo(testInput);
    console.log('🧪 Predefined info result:', predefinedInfo);
    
    destinationContext.setDestinationDirect(testInput);
    console.log('🧪 Current destination after:', destinationContext.getCurrentDestination()?.name);
    console.log('🧪 Current listener count after:', destinationContext.getListenerCount());
  };

  const handleClear = () => {
    console.log('🧹 Clearing destination');
    destinationContext.clearDestination();
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Destination Detection Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Destination */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Current Destination (from Hook)</h2>
            <div className="p-4 bg-gray-100 rounded-md">
              {destination ? (
                <div className="space-y-2">
                  <p><strong>Name:</strong> {destination.name}</p>
                  <p><strong>Country:</strong> {destination.country}</p>
                  <p><strong>Region:</strong> {destination.region}</p>
                  <p><strong>Coordinates:</strong> {destination.coordinates ? `${destination.coordinates.lat}, ${destination.coordinates.lng}` : 'N/A'}</p>
                  <p><strong>Radius:</strong> {destination.radius}km</p>
                  <p><strong>Aliases:</strong> {destination.aliases?.join(', ') || 'None'}</p>
                </div>
              ) : (
                <p className="text-gray-500">No destination set</p>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h3 className="font-semibold text-blue-900 mb-2">Direct Context Check:</h3>
              <p><strong>Direct call result:</strong> {destinationContext.getCurrentDestination()?.name || 'None'}</p>
              <p><strong>Listener count:</strong> {destinationContext.getListenerCount()}</p>
            </div>
          </div>

          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Destination Detection</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Input:
                </label>
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter destination to test..."
                />
              </div>
              
              <button
                onClick={handleTest}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Test Detection
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTestInput('Dali Erhai Lake Tour')}
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors text-sm"
                >
                  Dali Erhai Lake Tour
                </button>
                <button
                  onClick={() => setTestInput('大理洱海')}
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors text-sm"
                >
                  大理洱海
                </button>
                <button
                  onClick={() => setTestInput('Dali & Erhai Lake')}
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors text-sm"
                >
                  Dali & Erhai Lake
                </button>
                <button
                  onClick={() => setTestInput('杭州博物馆')}
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors text-sm"
                >
                  杭州博物馆
                </button>
              </div>
              
              <button
                onClick={handleClear}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
              >
                Clear Destination & Logs
              </button>
            </div>
          </div>
        </div>

        {/* Console Logs */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Console Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}