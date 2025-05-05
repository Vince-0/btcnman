'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import PeerFilters from '../../components/PeerFilters';
import dynamic from 'next/dynamic';
import Script from 'next/script';

// Dynamically import the PeerMap component to avoid SSR issues with Leaflet
const PeerMap = dynamic(() => import('../../components/PeerMap'), { ssr: false });

export default function PeersPage() {
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({ total: 0, filtered: 0 });
  const router = useRouter();

  const fetchPeers = async (filterParams = {}, sortParams = {}, includeGeo = false) => {
    try {
      setLoading(true);

      // Check if token exists (the API client will handle adding it to requests)
      if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
        router.push('/login');
        return;
      }

      try {
        // Build query parameters
        const queryParams = new URLSearchParams();

        // Add filter parameters
        if (filterParams.connectionType) {
          queryParams.append('connectionType', filterParams.connectionType);
        }

        if (filterParams.version) {
          queryParams.append('version', filterParams.version);
        }

        if (filterParams.services) {
          queryParams.append('services', filterParams.services);
        }

        if (filterParams.country) {
          queryParams.append('country', filterParams.country);
        }

        // Add sort parameters
        if (sortParams.field) {
          queryParams.append('sortBy', sortParams.field);
          queryParams.append('sortOrder', sortParams.order || 'asc');
        }

        // Add geolocation parameter
        if (includeGeo) {
          queryParams.append('geo', 'true');
        }

        const response = await api.get(`/bitcoin/peers?${queryParams.toString()}`);

        // Check if the response has the new format with peers property
        if (response.data && response.data.peers) {
          setPeers(response.data.peers);
          setStats({
            total: response.data.total || response.data.peers.length,
            filtered: response.data.filtered || response.data.peers.length
          });

          if (response.data.lastUpdated) {
            setLastUpdated(new Date(response.data.lastUpdated));
          }

          // Show a warning if using mock data
          if (response.data._isMockData) {
            setError('Note: Displaying mock data because the Bitcoin node is unavailable.');
          } else {
            setError(null);
          }
        } else {
          // Handle old format for backward compatibility
          setPeers(response.data);
          setStats({
            total: response.data.length,
            filtered: response.data.length
          });
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

  useEffect(() => {
    fetchPeers(filters, sort, showMap);
  }, [router]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchPeers(newFilters, sort, showMap);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    fetchPeers(filters, newSort, showMap);
  };

  const handleToggleMap = () => {
    const newShowMap = !showMap;
    setShowMap(newShowMap);
    fetchPeers(filters, sort, newShowMap);
  };

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

  if (loading && peers.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leaflet CSS and JS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
      />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Connected Peers</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleToggleMap}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
          <button
            onClick={() => fetchPeers(filters, sort, showMap)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <PeerFilters onFilterChange={handleFilterChange} onSortChange={handleSortChange} />

      {/* Stats and Last Updated */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          Showing {stats.filtered} of {stats.total} peers
        </div>
        {lastUpdated && (
          <div>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Map View */}
      {showMap && (
        <div className="bg-white shadow rounded-lg overflow-hidden p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Peer Locations</h2>
          <PeerMap peers={peers} />
        </div>
      )}

      {/* Table View */}
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
                {showMap && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                )}
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
                  {showMap && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {peer.geolocation ? (
                        `${peer.geolocation.city}, ${peer.geolocation.country}`
                      ) : (
                        'Unknown'
                      )}
                    </td>
                  )}
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
                  <td colSpan={showMap ? "7" : "6"} className="px-6 py-4 text-center text-sm text-gray-500">
                    No peers connected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && peers.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
    </div>
  );
}
