'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ApiTest() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test direct connection to backend
      console.log('Testing direct connection to backend...');
      try {
        const directResponse = await fetch('http://localhost:3001/', {
          method: 'GET',
          mode: 'cors',
        });

        const directData = await directResponse.json();
        setResult({
          message: 'Direct connection successful',
          data: directData
        });
      } catch (directErr) {
        console.error('Direct connection failed:', directErr);

        // Try using the proxy instead
        console.log('Trying proxy connection...');
        const proxyResponse = await fetch('/api', {
          method: 'GET',
        });

        if (!proxyResponse.ok) {
          throw new Error(`HTTP error! Status: ${proxyResponse.status}`);
        }

        const proxyData = await proxyResponse.json();
        setResult({
          message: 'Proxy connection successful',
          data: proxyData
        });
      }
    } catch (err) {
      console.error('API test error:', err);
      setError(err.message || 'Failed to connect to the API');
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Try using the proxy for login
      console.log('Testing login via proxy...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! Status: ${response.status}`);
      }

      setResult({
        message: 'Login successful',
        data
      });
    } catch (err) {
      console.error('Login test error:', err);

      // If proxy fails, try direct connection
      try {
        console.log('Trying direct login...');
        const directResponse = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'admin',
            password: 'admin123'
          }),
          mode: 'cors',
        });

        const directData = await directResponse.json();

        if (!directResponse.ok) {
          throw new Error(directData.message || `HTTP error! Status: ${directResponse.status}`);
        }

        setResult({
          message: 'Direct login successful',
          data: directData
        });
      } catch (directErr) {
        // If both fail, show the original error
        setError(err.message || 'Failed to test login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
          <p className="mb-4 text-gray-600">
            This page tests the connection to the backend API.
          </p>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={testApi}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Test API Connection
            </button>

            <button
              onClick={testLogin}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Test Login API
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-2">Testing...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Success</p>
              <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Home
          </Link>

          <Link
            href="/login"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
