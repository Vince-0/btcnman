'use client';

import Link from 'next/link';

export default function StartPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bitcoin Node Manager</h1>
          <p className="text-gray-600">Modern implementation for Bitcoin Core 28.1</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-blue-800 mb-2">Welcome!</h2>
            <p className="text-blue-700 text-sm">
              This application allows you to monitor and manage your Bitcoin node.
              Please select an option below to continue.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/login" 
              className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-center transition-colors"
            >
              Login
            </Link>
            
            <Link 
              href="/register" 
              className="block w-full py-3 px-4 bg-white hover:bg-gray-50 text-indigo-600 font-medium rounded-md text-center border border-indigo-600 transition-colors"
            >
              Register
            </Link>
            
            <Link 
              href="/dashboard" 
              className="block w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md text-center transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Default login: admin / admin123</p>
          <p className="mt-1">Connected to Bitcoin Core at 169.255.240.110</p>
        </div>
      </div>
    </main>
  );
}
