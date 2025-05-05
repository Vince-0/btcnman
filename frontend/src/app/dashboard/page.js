'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { PieChart } from '../../components/charts';
import dynamic from 'next/dynamic';
import Script from 'next/script';

// Dynamically import the PeerMap component to avoid SSR issues with Leaflet
const PeerMap = dynamic(() => import('../../components/PeerMap'), { ssr: false });

export default function Dashboard() {
  const [nodeInfo, setNodeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNodeInfo = async () => {
      try {
        // Check if token exists (the API client will handle adding it to requests)
        if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
          console.error('No token found in localStorage');
          setError('You are not logged in. Please log in to view the dashboard.');
          setLoading(false);
          return;
        }

        // Try to fetch data from the API using our API client with increased timeout
        try {
          console.log('Fetching node info from API...');

          // Request peer data with geolocation for the map
          const response = await api.get('/bitcoin/info?geo=true');

          console.log('API data received:', Object.keys(response.data));

          // Check if peerInfo has geolocation data
          if (response.data.peerInfo && response.data.peerInfo.length > 0) {
            console.log('First peer data:', response.data.peerInfo[0]);
            console.log('Peers with geolocation:', response.data.peerInfo.filter(p => p.geolocation).length);
          }

          // Set the node info data
          setNodeInfo(response.data);

          // Show a warning if using mock data
          if (response.data._isMockData) {
            setError('Note: Displaying mock data because the Bitcoin node is unavailable.');
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
      }
    };

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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Connection Issue</p>
          <p>Could not connect to the Bitcoin node at 169.255.240.110. Using demo data instead.</p>
        </div>

        {/* Node Info Cards with Demo Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Version</h2>
            <p className="text-2xl font-bold">/Satoshi:28.1.0/</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Connections</h2>
            <p className="text-2xl font-bold">8</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Block Height</h2>
            <p className="text-2xl font-bold">825,000</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Mempool Size</h2>
            <p className="text-2xl font-bold">2,500 txs</p>
          </div>
        </div>

        {/* Demo Network Information */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Network Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Network</span>
              <span className="font-medium">mainnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Difficulty</span>
              <span className="font-medium">78,352,956,298,608</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mempool Usage</span>
              <span className="font-medium">125.45 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Relay Fee</span>
              <span className="font-medium">0.00001000 BTC/kB</span>
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

  // Prepare data for charts
  const router = useRouter();

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

      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Node Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Version</h2>
          <p className="text-2xl font-bold">{nodeInfo.networkInfo.subversion}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Connections</h2>
          <p className="text-2xl font-bold">{nodeInfo.networkInfo.connections}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Block Height</h2>
          <p className="text-2xl font-bold">{nodeInfo.blockchainInfo.blocks}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Mempool Size</h2>
          <p className="text-2xl font-bold">{nodeInfo.mempoolInfo.size} txs</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Peer Connections</h2>
          <div className="h-64">
            <PieChart
              data={peerConnectionData}
              labels={peerConnectionLabels}
              onClick={handlePeerTypeClick}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Peer Versions</h2>
          <div className="h-64">
            <PieChart
              data={peerVersionData}
              labels={peerVersionLabels}
              onClick={handlePeerTypeClick}
              options={{
                plugins: {
                  legend: {
                    position: 'right',
                    align: 'center',
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Peer Locations</h2>
          <div className="h-64">
            <PeerMap peers={nodeInfo.peerInfo} />
          </div>
        </div>


        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Network Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Network</span>
              <span className="font-medium">{nodeInfo.blockchainInfo.chain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Difficulty</span>
              <span className="font-medium">{nodeInfo.blockchainInfo.difficulty.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mempool Usage</span>
              <span className="font-medium">{(nodeInfo.mempoolInfo.usage / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Relay Fee</span>
              <span className="font-medium">{nodeInfo.mempoolInfo.mempoolminfee} BTC/kB</span>
            </div>
          </div>
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
