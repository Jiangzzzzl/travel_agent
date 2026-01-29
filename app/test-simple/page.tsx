'use client';

export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Simple Test Page
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-lg text-gray-700">
            This is a simple test page to check if the basic Next.js setup is working.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            If you can see this page, the basic setup is working correctly.
          </p>
        </div>
      </div>
    </div>
  );
}