'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: 'light',
    refreshInterval: 30,
    maxPeersToShow: 100,
    maxTransactionsToShow: 50,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Save settings to localStorage
    localStorage.setItem('settings', JSON.stringify(settings));

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSaved(true);

      // Hide the saved message after 3 seconds
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {saved && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Settings saved successfully!
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Appearance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <select
                    name="theme"
                    value={settings.theme}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refresh Interval (seconds)
                  </label>
                  <input
                    type="number"
                    name="refreshInterval"
                    value={settings.refreshInterval}
                    onChange={handleChange}
                    min="5"
                    max="300"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Peers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Peers to Show
                  </label>
                  <input
                    type="number"
                    name="maxPeersToShow"
                    value={settings.maxPeersToShow}
                    onChange={handleChange}
                    min="10"
                    max="1000"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Explorer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Transactions to Show
                  </label>
                  <input
                    type="number"
                    name="maxTransactionsToShow"
                    value={settings.maxTransactionsToShow}
                    onChange={handleChange}
                    min="10"
                    max="500"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">About</h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Bitcoin Node Manager - Modern Implementation
          </p>
          <p className="text-sm text-gray-600">Version: 1.0.0</p>
          <p className="text-sm text-gray-600">
            A modern implementation of Bitcoin Node Manager for monitoring and managing Bitcoin Core nodes.
          </p>
        </div>
      </div>
    </div>
  );
}
