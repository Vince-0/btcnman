'use client';

import React from 'react';

/**
 * Format a timestamp to a readable date/time
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date/time
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

/**
 * Calculate uptime from a connection timestamp
 * @param {number} connTime - Connection timestamp in seconds
 * @returns {string} Formatted uptime
 */
const calculateUptime = (connTime) => {
  if (!connTime) return 'N/A';

  const now = Math.floor(Date.now() / 1000);
  const uptime = now - connTime;

  const days = Math.floor(uptime / (24 * 60 * 60));
  const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((uptime % (60 * 60)) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Format bytes to a human-readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
const formatBytes = (bytes) => {
  if (bytes === 0 || bytes === undefined) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Get color for service tag
 * @param {string} service - Service name
 * @returns {string} Tailwind CSS classes for the service tag
 */
const getServiceTagColor = (service) => {
  const colors = {
    'NETWORK': 'bg-blue-100 text-blue-800',
    'GETUTXO': 'bg-purple-100 text-purple-800',
    'BLOOM': 'bg-green-100 text-green-800',
    'WITNESS': 'bg-yellow-100 text-yellow-800',
    'NETWORK_LIMITED': 'bg-indigo-100 text-indigo-800',
  };

  return colors[service] || 'bg-gray-100 text-gray-800';
};

/**
 * Node Details Card Component
 * Displays detailed information about the Bitcoin node
 */
const NodeDetailsCard = ({ nodeInfo }) => {
  if (!nodeInfo) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Node Details</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                  <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { networkInfo, blockchainInfo, mempoolInfo } = nodeInfo;

  // Get the earliest connection time from peers to estimate node uptime
  const earliestConnTime = nodeInfo.peerInfo && nodeInfo.peerInfo.length > 0
    ? Math.min(...nodeInfo.peerInfo.map(peer => peer.conntime || Infinity).filter(time => time !== Infinity))
    : null;

  // Check network capabilities
  const networks = networkInfo?.networks || [];
  const ipv4Enabled = networks.some(net => net.name === 'ipv4' && net.reachable);
  const ipv6Enabled = networks.some(net => net.name === 'ipv6' && net.reachable);
  const torEnabled = networks.some(net => net.name === 'onion' && net.reachable);

  // Check if pruning is enabled
  const pruningEnabled = blockchainInfo?.pruned || false;

  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Node Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Protocol & Network */}
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-2">Protocol & Network</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Protocol Version</span>
              <span className="font-medium text-sm">{networkInfo.protocolversion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Port</span>
              <span className="font-medium text-sm">
                {networkInfo.localaddresses && networkInfo.localaddresses.length > 0
                  ? networkInfo.localaddresses[0].port
                  : '8333'}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600 text-sm min-w-[120px] shrink-0">Services</span>
              <div className="flex flex-wrap justify-end gap-1 ml-4">
                {networkInfo.localservicesnames?.length > 0 ? (
                  networkInfo.localservicesnames.map((service, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getServiceTagColor(service)}`}
                    >
                      {service}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">N/A</span>
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Network</span>
              <span className="font-medium text-sm">{blockchainInfo.chain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Relay Fee</span>
              <span className="font-medium text-sm">{networkInfo.relayfee} BTC</span>
            </div>
          </div>
        </div>

        {/* Time & Status */}
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-2">Time & Status</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Node Time</span>
              <span className="font-medium text-sm">{formatTimestamp(blockchainInfo.mediantime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Estimated Uptime</span>
              <span className="font-medium text-sm">{calculateUptime(earliestConnTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Time Offset</span>
              <span className="font-medium text-sm">{networkInfo.timeoffset} seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Network Active</span>
              <span className="font-medium text-sm">{networkInfo.networkactive ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Initial Block Download</span>
              <span className="font-medium text-sm">{blockchainInfo.initialblockdownload ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Storage & Memory */}
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-2">Storage & Memory</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Blockchain Size</span>
              <span className="font-medium text-sm">{formatBytes(blockchainInfo.size_on_disk)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Pruning Enabled</span>
              <span className="font-medium text-sm">{pruningEnabled ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Mempool Max Size</span>
              <span className="font-medium text-sm">{formatBytes(mempoolInfo.maxmempool)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Mempool Min Fee</span>
              <span className="font-medium text-sm">{mempoolInfo.mempoolminfee} BTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Min Relay Tx Fee</span>
              <span className="font-medium text-sm">{mempoolInfo.minrelaytxfee} BTC</span>
            </div>
          </div>
        </div>

        {/* Network Capabilities */}
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-2">Network Capabilities</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">IPv4</span>
              <span className={`font-medium text-sm ${ipv4Enabled ? 'text-green-600' : 'text-red-600'}`}>
                {ipv4Enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">IPv6</span>
              <span className={`font-medium text-sm ${ipv6Enabled ? 'text-green-600' : 'text-red-600'}`}>
                {ipv6Enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Tor</span>
              <span className={`font-medium text-sm ${torEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {torEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Local Relay</span>
              <span className={`font-medium text-sm ${networkInfo.localrelay ? 'text-green-600' : 'text-red-600'}`}>
                {networkInfo.localrelay ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Verification Progress</span>
              <span className="font-medium text-sm">{(blockchainInfo.verificationprogress * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Connection Details */}
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-2">Connection Details</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Total Connections</span>
              <span className="font-medium text-sm">{networkInfo.connections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Inbound</span>
              <span className="font-medium text-sm">{networkInfo.connections_in || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Outbound</span>
              <span className="font-medium text-sm">{networkInfo.connections_out || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Local Address</span>
              <span className="font-medium text-sm">
                {networkInfo.localaddresses && networkInfo.localaddresses.length > 0
                  ? networkInfo.localaddresses[0].address
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 text-sm">Unbroadcast Txs</span>
              <span className="font-medium text-sm">{mempoolInfo.unbroadcastcount || 0}</span>
            </div>
          </div>
        </div>

        {/* Warnings & Notices */}
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-2">Warnings & Notices</h3>
          <div className="space-y-1.5">
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm">Network Warnings</span>
              <span className="font-medium text-sm mt-1">
                {networkInfo.warnings ? (
                  <div className="p-2 bg-yellow-50 text-yellow-700 rounded text-sm">
                    {networkInfo.warnings}
                  </div>
                ) : (
                  <div className="p-2 bg-green-50 text-green-700 rounded text-sm">
                    No warnings
                  </div>
                )}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm">Blockchain Warnings</span>
              <span className="font-medium text-sm mt-1">
                {blockchainInfo.warnings ? (
                  <div className="p-2 bg-yellow-50 text-yellow-700 rounded text-sm">
                    {blockchainInfo.warnings}
                  </div>
                ) : (
                  <div className="p-2 bg-green-50 text-green-700 rounded text-sm">
                    No warnings
                  </div>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsCard;
