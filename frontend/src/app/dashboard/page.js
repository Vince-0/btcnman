'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { PieChart } from '../../components/charts';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import NodeDetailsCard from './NodeDetailsCard';


// Dynamically import the PeerMap component to avoid SSR issues with Leaflet
const PeerMap = dynamic(() => import('../../components/PeerMap'), { ssr: false });

export default function Dashboard() {
  const router = useRouter();
  const [nodeInfo, setNodeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNodeInfo = async (skipCache = false) => {
    try {
      setRefreshing(true);

      // Check if token exists (the API client will handle adding it to requests)
      if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
        console.error('No token found in localStorage');
        setError('You are not logged in. Please log in to view the dashboard.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Try to fetch data from the API using our API client with increased timeout
      try {
        console.log('Fetching node info from API...');

        // Request peer data with geolocation for the map
        // If skipCache is true, add useCache=false to skip the cache
        const url = skipCache
          ? '/bitcoin/info?geo=true&useCache=false'
          : '/bitcoin/info?geo=true';

        const response = await api.get(url);

        console.log('API data received:', Object.keys(response.data));

        // Check if peerInfo has geolocation data
        if (response.data.peerInfo && response.data.peerInfo.length > 0) {
          console.log('First peer data:', response.data.peerInfo[0]);
          console.log('Peers with geolocation:', response.data.peerInfo.filter(p => p.geolocation).length);
        }

        // Set the node info data
        setNodeInfo(response.data);

        // Set last updated time if available
        if (response.data.lastUpdated) {
          setLastUpdated(new Date(response.data.lastUpdated));
        }

        // Show a warning if using mock data
        if (response.data._isMockData) {
          setError('Note: Displaying mock data because the Bitcoin node is unavailable.');
        } else {
          setError(null);
        }
      } catch (apiError) {
        console.error('API fetch error:', apiError);

        // Get the error message from the response if available
        const errorMessage = apiError.response?.data?.message || apiError.message;

        // Handle timeout errors specifically
        if (apiError.code === 'ECONNABORTED' && apiError.message.includes('timeout')) {
          setError('The request to the Bitcoin node timed out. The node might be busy processing a large request.');
        } else {
          setError(`Failed to connect to the Bitcoin node: ${errorMessage}`);
        }
      }
    } catch (err) {
      console.error('General error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchNodeInfo(true); // Skip cache
  };

  useEffect(() => {
    fetchNodeInfo();
  }, []);

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

  if (!nodeInfo) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-bold">Connection Issue</p>
            <p>Could not connect to the Bitcoin node at 169.255.240.110. Using demo data instead.</p>
          </div>
        </div>

        {/* Node Info Card with Demo Data - Combined Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Node Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm">Version</span>
              <span className="text-xl font-bold">/Satoshi:28.1.0/</span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-600 text-sm">Connections</span>
              <span className="text-xl font-bold">8</span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-600 text-sm">Block Height</span>
              <span className="text-xl font-bold">825,000</span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-600 text-sm">Mempool Size</span>
              <span className="text-xl font-bold">2,500 txs</span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-600 text-sm">Total Upload</span>
              <span className="text-xl font-bold">3.45 GB</span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-600 text-sm">Total Download</span>
              <span className="text-xl font-bold">28.72 GB</span>
            </div>
          </div>
        </div>

        {/* Demo Network Information */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-md font-semibold text-gray-700 mb-3">Network Information</h2>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Network</span>
              <span className="font-medium text-sm">mainnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Difficulty</span>
              <span className="font-medium text-sm">78,352,956,298,608</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Hash Rate</span>
              <span className="font-medium text-sm">560.82 EH/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Mempool Usage</span>
              <span className="font-medium text-sm">125.45 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Relay Fee</span>
              <span className="font-medium text-sm">0.00001000 BTC/kB</span>
            </div>
          </div>
        </div>


        {/* Demo Peers */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Peers</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connection Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ping Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">192.168.1.100:8333</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Outbound</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">/Satoshi:28.1.0/</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">45.23 ms</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">203.0.113.42:8333</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Inbound</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">/Satoshi:27.0.0/</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">78.12 ms</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">198.51.100.23:8333</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Outbound</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">/Satoshi:28.0.1/</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">102.45 ms</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total upload/download traffic
  const totalUpload = nodeInfo.peerInfo.reduce((sum, peer) => sum + (peer.bytessent || 0), 0);
  const totalDownload = nodeInfo.peerInfo.reduce((sum, peer) => sum + (peer.bytesrecv || 0), 0);

  // Format traffic values
  const formatTraffic = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  // Calculate network hash rate from difficulty
  const calculateHashRate = (difficulty) => {
    // Formula: hashrate = difficulty * 2^32 / 600
    // 2^32 = 4,294,967,296
    // 600 seconds = 10 minutes (average block time)
    const hashRate = difficulty * 4294967296 / 600;

    // Format the hash rate
    if (hashRate < 1000) return `${hashRate.toFixed(2)} H/s`;
    if (hashRate < 1000000) return `${(hashRate / 1000).toFixed(2)} KH/s`;
    if (hashRate < 1000000000) return `${(hashRate / 1000000).toFixed(2)} MH/s`;
    if (hashRate < 1000000000000) return `${(hashRate / 1000000000).toFixed(2)} GH/s`;
    if (hashRate < 1000000000000000) return `${(hashRate / 1000000000000).toFixed(2)} TH/s`;
    if (hashRate < 1000000000000000000) return `${(hashRate / 1000000000000000).toFixed(2)} PH/s`;
    return `${(hashRate / 1000000000000000000).toFixed(2)} EH/s`;
  };

  // Prepare peer connection type data (inbound/outbound)
  const peerConnectionData = [
    nodeInfo.peerInfo.filter(peer => !peer.outbound).length,
    nodeInfo.peerInfo.filter(peer => peer.outbound).length,
  ];
  const peerConnectionLabels = ['Inbound', 'Outbound'];

  // Prepare peer version data
  const peerVersions = {};
  nodeInfo.peerInfo.forEach(peer => {
    const version = peer.subver || 'Unknown';
    peerVersions[version] = (peerVersions[version] || 0) + 1;
  });

  // Sort versions by count (descending) and take top 5, group others
  const sortedVersions = Object.entries(peerVersions)
    .sort((a, b) => b[1] - a[1]);

  const topVersions = sortedVersions.slice(0, 5);
  const otherVersions = sortedVersions.slice(5);

  const peerVersionLabels = topVersions.map(([version]) => version);
  const peerVersionData = topVersions.map(([_, count]) => count);

  // Add "Other" category if there are more versions
  if (otherVersions.length > 0) {
    const otherCount = otherVersions.reduce((sum, [_, count]) => sum + count, 0);
    peerVersionLabels.push('Other');
    peerVersionData.push(otherCount);
  }

  // Handle chart click events
  const handlePeerTypeClick = (index) => {
    router.push('/peers');
  };

  return (
    <div className="space-y-4">
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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center"
          >
            {refreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>

      {/* Node Info Card - Combined Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Node Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Version</span>
            <span className="text-xl font-bold">{nodeInfo.networkInfo.subversion}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Connections</span>
            <span className="text-xl font-bold">{nodeInfo.networkInfo.connections}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Block Height</span>
            <span className="text-xl font-bold">{nodeInfo.blockchainInfo.blocks.toLocaleString()}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Mempool Size</span>
            <span className="text-xl font-bold">{nodeInfo.mempoolInfo.size.toLocaleString()} txs</span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Total Upload</span>
            <span className="text-xl font-bold">{formatTraffic(totalUpload)}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Total Download</span>
            <span className="text-xl font-bold">{formatTraffic(totalDownload)}</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Peer Statistics Section */}
        <div className="bg-white p-4 pb-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Peer Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col items-center md:items-end md:pr-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Connection Types</h3>
              <div className="h-52 w-44">
                <PieChart
                  data={peerConnectionData}
                  labels={peerConnectionLabels}
                  onClick={handlePeerTypeClick}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                        align: 'center',
                        labels: {
                          boxWidth: 10,
                          padding: 8,
                          font: {
                            size: 10
                          }
                        }
                      },
                      tooltip: {
                        bodyFont: {
                          size: 10
                        }
                      }
                    },
                    layout: {
                      padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 15
                      }
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start md:pl-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Version Distribution</h3>
              <div className="h-52 w-52">
                <PieChart
                  data={peerVersionData}
                  labels={peerVersionLabels}
                  onClick={handlePeerTypeClick}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right',
                        align: 'start',
                        labels: {
                          boxWidth: 10,
                          padding: 6,
                          font: {
                            size: 9
                          }
                        }
                      },
                      tooltip: {
                        bodyFont: {
                          size: 10
                        }
                      }
                    },
                    layout: {
                      padding: {
                        left: 0,
                        right: 0,
                        top: 5,
                        bottom: 5
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-md font-semibold text-gray-700 mb-3">Network Information</h2>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Network</span>
              <span className="font-medium text-sm">{nodeInfo.blockchainInfo.chain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Difficulty</span>
              <span className="font-medium text-sm">{nodeInfo.blockchainInfo.difficulty.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Hash Rate</span>
              <span className="font-medium text-sm">{calculateHashRate(nodeInfo.blockchainInfo.difficulty)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Mempool Usage</span>
              <span className="font-medium text-sm">{(nodeInfo.mempoolInfo.usage / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Relay Fee</span>
              <span className="font-medium text-sm">{nodeInfo.mempoolInfo.mempoolminfee} BTC/kB</span>
            </div>
          </div>
        </div>

      </div>

      {/* Node Details */}
      <NodeDetailsCard nodeInfo={nodeInfo} />

      {/* Peer Locations Map */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Peer Locations</h2>
        <div className="h-80 relative">
          <PeerMap peers={nodeInfo.peerInfo} />
        </div>
      </div>

      {/* Recent Peers */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Peers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connection Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ping Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nodeInfo.peerInfo.slice(0, 5).map((peer, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{peer.addr}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {peer.outbound ? 'Outbound' : 'Inbound'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peer.subver}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peer.pingtime ? `${(peer.pingtime * 1000).toFixed(2)} ms` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
