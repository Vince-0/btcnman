'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function PeersPage() {
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPeers = async () => {
      try {
        // Check if token exists (the API client will handle adding it to requests)
        if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
          router.push('/login');
          return;
        }

        try {
          const response = await api.get('/bitcoin/peers');

          // Check if the response has the new format with peers property
          if (response.data && response.data.peers) {
            setPeers(response.data.peers);

            // Show a warning if using mock data
            if (response.data._isMockData) {
              setError('Note: Displaying mock data because the Bitcoin node is unavailable.');
            }
          } else {
            // Handle old format for backward compatibility
            setPeers(response.data);
          }
        } catch (apiError) {
          console.error('API fetch error:', apiError);

          // Get the error message from the response if available
          const errorMessage = apiError.response?.data?.message || apiError.message;

          // Handle timeout errors specifically
          if (apiError.code === 'ECONNABORTED' && apiError.message.includes('timeout')) {
            setError('The request to the Bitcoin node timed out. The node might be busy processing a large request.');
          } else {
            setError(`Failed to fetch peers: ${errorMessage}`);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPeers();
  }, [router]);

  const handleDisconnect = async (nodeId) => {
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('token')) return;

      try {
        await api.post('/bitcoin/peers/disconnect', { nodeId });

        // Refresh the peers list
        setPeers(peers.filter(peer => peer.id !== nodeId));
      } catch (apiError) {
        console.error('API error:', apiError);

        // Handle timeout errors specifically
        if (apiError.code === 'ECONNABORTED' && apiError.message.includes('timeout')) {
          setError('The request to disconnect the peer timed out. The node might be busy.');
        } else {
          setError(`Failed to disconnect peer: ${apiError.message}`);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBan = async (ip, banTime = 86400) => {
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('token')) return;

      try {
        await api.post('/bitcoin/peers/ban', { ip, banTime });

        // Refresh the peers list
        const peerIp = ip.split(':')[0];
        setPeers(peers.filter(peer => !peer.addr.startsWith(peerIp)));
      } catch (apiError) {
        console.error('API error:', apiError);

        // Handle timeout errors specifically
        if (apiError.code === 'ECONNABORTED' && apiError.message.includes('timeout')) {
          setError('The request to ban the peer timed out. The node might be busy.');
        } else {
          setError(`Failed to ban peer: ${apiError.message}`);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Connected Peers</h1>
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
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connection Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ping
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {peers.map((peer, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {peer.addr}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {peer.outbound ? 'Outbound' : 'Inbound'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {peer.subver}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {peer.pingtime ? `${(peer.pingtime * 1000).toFixed(2)} ms` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {peer.services}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDisconnect(peer.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Disconnect
                      </button>
                      <button
                        onClick={() => handleBan(peer.addr)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Ban
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {peers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No peers connected
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
