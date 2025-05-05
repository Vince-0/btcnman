'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function BannedPage() {
  const [bannedPeers, setBannedPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBannedPeers = async () => {
      try {
        // Check if token exists (the API client will handle adding it to requests)
        if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
          router.push('/login');
          return;
        }

        try {
          const response = await api.get('/bitcoin/peers/banned');

          // Check if the response has the new format with bannedPeers property
          if (response.data && response.data.bannedPeers) {
            setBannedPeers(response.data.bannedPeers);

            // Show a warning if using mock data
            if (response.data._isMockData) {
              setError('Note: Displaying mock data because the Bitcoin node is unavailable.');
            }
          } else {
            // Handle old format for backward compatibility
            setBannedPeers(response.data);
          }
        } catch (apiError) {
          console.error('API fetch error:', apiError);

          // Get the error message from the response if available
          const errorMessage = apiError.response?.data?.message || apiError.message;

          // Handle timeout errors specifically
          if (apiError.code === 'ECONNABORTED' && apiError.message.includes('timeout')) {
            setError('The request to the Bitcoin node timed out. The node might be busy processing a large request.');
          } else {
            setError(`Failed to fetch banned peers: ${errorMessage}`);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBannedPeers();
  }, [router]);

  const handleUnban = async (ip) => {
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('token')) return;

      try {
        const response = await api.post('/bitcoin/peers/unban', { ip });

        // Check if the operation was successful
        if (response.data && response.data.success === false) {
          setError(response.data.message || 'Failed to unban peer');
          return;
        }

        // Refresh the banned peers list
        setBannedPeers(bannedPeers.filter(peer => peer.address !== ip));
      } catch (apiError) {
        console.error('API error:', apiError);

        // Get the error message from the response if available
        const errorMessage = apiError.response?.data?.message || apiError.message;

        // Handle timeout errors specifically
        if (apiError.code === 'ECONNABORTED' && apiError.message.includes('timeout')) {
          setError('The request to unban the peer timed out. The node might be busy.');
        } else {
          setError(`Failed to unban peer: ${errorMessage}`);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  // Format the ban time to a human-readable format
  const formatBanTime = (banTime) => {
    const now = Math.floor(Date.now() / 1000);
    const remainingSeconds = banTime - now;

    if (remainingSeconds <= 0) {
      return 'Expired';
    }

    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor((remainingSeconds % 86400) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Banned Peers</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ban Until
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bannedPeers.map((peer, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {peer.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(peer.ban_until * 1000).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatBanTime(peer.ban_until)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleUnban(peer.address)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Unban
                    </button>
                  </td>
                </tr>
              ))}
              {bannedPeers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No banned peers
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
