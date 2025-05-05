# Bitcoin Core Integration Guide

This document provides detailed information on integrating with Bitcoin Core 28.1 for the modern implementation of Bitcoin Node Manager.

## Bitcoin Core RPC Interface

Bitcoin Core provides a JSON-RPC interface that allows applications to interact with the node. The modern implementation will use this interface to retrieve information and perform actions on the node.

### RPC Connection Setup

```javascript
// Example using bitcoin-core npm package
const Client = require('bitcoin-core');
const client = new Client({
  network: 'mainnet', // or 'testnet'
  username: process.env.BITCOIN_RPC_USER,
  password: process.env.BITCOIN_RPC_PASSWORD,
  host: process.env.BITCOIN_RPC_HOST || '127.0.0.1',
  port: process.env.BITCOIN_RPC_PORT || 8332,
  timeout: 30000
});
```

### Key RPC Methods

#### Node Information

```javascript
// Get node information
const getNodeInfo = async () => {
  const [networkInfo, blockchainInfo, mempoolInfo] = await Promise.all([
    client.getNetworkInfo(),
    client.getBlockchainInfo(),
    client.getMempoolInfo()
  ]);
  
  return {
    version: networkInfo.version,
    protocolVersion: networkInfo.protocolversion,
    blocks: blockchainInfo.blocks,
    headers: blockchainInfo.headers,
    difficulty: blockchainInfo.difficulty,
    verificationProgress: blockchainInfo.verificationprogress,
    mempool: {
      transactions: mempoolInfo.size,
      size: mempoolInfo.bytes,
      maxSize: mempoolInfo.maxmempool,
      usage: mempoolInfo.usage
    },
    connections: networkInfo.connections,
    networks: networkInfo.networks
  };
};
```

#### Peer Management

```javascript
// Get peer information
const getPeers = async () => {
  const peerInfo = await client.getPeerInfo();
  return peerInfo.map(peer => ({
    id: peer.id,
    address: peer.addr,
    addressBind: peer.addrbind,
    addrLocal: peer.addrlocal,
    services: peer.services,
    servicesNames: peer.servicesnames,
    relaytxes: peer.relaytxes,
    lastSend: peer.lastsend,
    lastRecv: peer.lastrecv,
    bytesSent: peer.bytessent,
    bytesRecv: peer.bytesrecv,
    connTime: peer.conntime,
    timeOffset: peer.timeoffset,
    pingTime: peer.pingtime,
    minPing: peer.minping,
    version: peer.version,
    subver: peer.subver,
    inbound: peer.inbound,
    startingHeight: peer.startingheight,
    banscore: peer.banscore,
    synced_headers: peer.synced_headers,
    synced_blocks: peer.synced_blocks,
    inflight: peer.inflight,
    whitelisted: peer.whitelisted,
    permissions: peer.permissions,
    minfeefilter: peer.minfeefilter,
    bytessent_per_msg: peer.bytessent_per_msg,
    bytesrecv_per_msg: peer.bytesrecv_per_msg
  }));
};

// Disconnect a peer
const disconnectPeer = async (nodeId) => {
  return await client.disconnectNode({ id: nodeId });
};

// Ban a peer
const banPeer = async (ip, banTime = 86400) => {
  return await client.setNetworkActive(ip, banTime);
};

// List banned peers
const getBannedPeers = async () => {
  return await client.listBanned();
};

// Unban a peer
const unbanPeer = async (ip) => {
  return await client.setNetworkActive(ip);
};
```

#### Block Information

```javascript
// Get recent blocks
const getRecentBlocks = async (count = 10) => {
  const blockCount = await client.getBlockCount();
  const blocks = [];
  
  for (let i = 0; i < count; i++) {
    const blockHash = await client.getBlockHash(blockCount - i);
    const block = await client.getBlock(blockHash);
    blocks.push(block);
  }
  
  return blocks;
};

// Get block details
const getBlockDetails = async (blockHash) => {
  return await client.getBlock(blockHash, 2); // Verbosity level 2 includes transaction details
};
```

#### Mempool Information

```javascript
// Get mempool information
const getMempoolInfo = async () => {
  return await client.getMempoolInfo();
};

// Get mempool transactions
const getMempoolTransactions = async () => {
  const txids = await client.getRawMempool();
  return txids;
};

// Get detailed mempool transactions (limited by count to avoid performance issues)
const getDetailedMempoolTransactions = async (count = 100) => {
  const txids = await client.getRawMempool();
  const limitedTxids = txids.slice(0, count);
  
  const transactions = [];
  for (const txid of limitedTxids) {
    const tx = await client.getRawMempoolEntry(txid);
    transactions.push({
      txid,
      ...tx
    });
  }
  
  return transactions;
};
```

#### Wallet Information (Read-only)

```javascript
// Get wallet information
const getWalletInfo = async () => {
  try {
    return await client.getWalletInfo();
  } catch (error) {
    // Handle case where wallet is not available
    console.error('Wallet not available:', error.message);
    return null;
  }
};

// Get wallet transactions
const getWalletTransactions = async (count = 10) => {
  try {
    return await client.listTransactions('*', count);
  } catch (error) {
    console.error('Wallet transactions not available:', error.message);
    return [];
  }
};

// Get wallet addresses
const getWalletAddresses = async () => {
  try {
    const addresses = await client.listReceivedByAddress(0, true);
    return addresses;
  } catch (error) {
    console.error('Wallet addresses not available:', error.message);
    return [];
  }
};
```

## Error Handling

Proper error handling is essential when interacting with the Bitcoin Core RPC API:

```javascript
// Example error handling wrapper
const safeRpcCall = async (method, ...args) => {
  try {
    return await method(...args);
  } catch (error) {
    // Handle specific RPC errors
    if (error.code) {
      switch (error.code) {
        case -28:
          throw new Error('Bitcoin Core is still starting up or warming up');
        case -8:
          throw new Error('Invalid parameter');
        case -5:
          throw new Error('Invalid Bitcoin address');
        default:
          throw new Error(`Bitcoin RPC error (${error.code}): ${error.message}`);
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Could not connect to Bitcoin Core. Is it running?');
    }
    
    // Re-throw other errors
    throw error;
  }
};
```

## Caching Strategy

To reduce load on the Bitcoin Core node and improve performance, implement a caching strategy:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 }); // Default TTL of 60 seconds

// Example cached RPC call
const getCachedNodeInfo = async () => {
  const cacheKey = 'node_info';
  
  // Check if data is in cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch from Bitcoin Core
  const nodeInfo = await getNodeInfo();
  
  // Store in cache
  cache.set(cacheKey, nodeInfo);
  
  return nodeInfo;
};
```

## WebSocket Updates

For real-time updates, implement a WebSocket service that periodically checks for changes and broadcasts them to connected clients:

```javascript
const socketIo = require('socket.io');
const http = require('http');
const server = http.createServer();
const io = socketIo(server);

// Set up authentication middleware for Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify JWT token
  if (isValidToken(token)) {
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

// Broadcast updates
const broadcastNodeUpdates = async () => {
  const nodeInfo = await getNodeInfo();
  io.emit('node_update', nodeInfo);
};

// Broadcast peer updates
const broadcastPeerUpdates = async () => {
  const peers = await getPeers();
  io.emit('peers_update', peers);
};

// Set up periodic updates
setInterval(broadcastNodeUpdates, 10000); // Every 10 seconds
setInterval(broadcastPeerUpdates, 30000); // Every 30 seconds

// Handle client connections
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send initial data
  getNodeInfo().then(info => socket.emit('node_update', info));
  getPeers().then(peers => socket.emit('peers_update', peers));
  
  // Handle subscription to specific updates
  socket.on('subscribe', (channel) => {
    socket.join(channel);
    console.log(`Client subscribed to ${channel}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(3001, () => {
  console.log('WebSocket server running on port 3001');
});
```

## Bitcoin Core Version Compatibility

Bitcoin Core 28.1 introduces some changes from previous versions. Here's how to handle version-specific features:

```javascript
// Check Bitcoin Core version and adapt functionality
const checkBitcoinCoreVersion = async () => {
  const networkInfo = await client.getNetworkInfo();
  const version = networkInfo.version;
  
  // Store version information
  const major = Math.floor(version / 10000);
  const minor = Math.floor((version % 10000) / 100);
  const patch = version % 100;
  
  console.log(`Bitcoin Core version: ${major}.${minor}.${patch}`);
  
  // Return version information and feature flags
  return {
    version: `${major}.${minor}.${patch}`,
    numericVersion: version,
    features: {
      // Feature flags based on version
      hasDescriptorWallets: version >= 220000, // Available since 0.22.0
      hasTaproot: version >= 220000, // Taproot support since 0.22.0
      hasCompactFilters: version >= 190000, // Available since 0.19.0
      hasRBF: version >= 120000, // Replace-by-fee since 0.12.0
    }
  };
};
```

## Security Considerations

When integrating with Bitcoin Core, consider these security aspects:

1. **RPC Credentials**: Store RPC credentials securely using environment variables or a secure configuration system.

2. **Limited RPC Access**: Configure Bitcoin Core to only accept RPC connections from the application server.

3. **Read-only Operations**: For most dashboard functionality, read-only RPC methods are sufficient. Be cautious with methods that modify node state.

4. **Rate Limiting**: Implement rate limiting for RPC calls to prevent overloading the Bitcoin Core node.

5. **Error Handling**: Properly handle and log errors without exposing sensitive information to users.

6. **Input Validation**: Validate all user inputs before passing them to RPC methods.

## Testing Bitcoin Core Integration

Create comprehensive tests for the Bitcoin Core integration:

```javascript
// Example Jest test for Bitcoin Core integration
describe('Bitcoin Core Integration', () => {
  let client;
  
  beforeAll(() => {
    // Set up test client
    client = new Client({
      network: 'regtest', // Use regtest for testing
      username: 'test',
      password: 'test',
      host: '127.0.0.1',
      port: 18443
    });
  });
  
  test('should connect to Bitcoin Core', async () => {
    const networkInfo = await client.getNetworkInfo();
    expect(networkInfo).toBeDefined();
    expect(networkInfo.version).toBeGreaterThan(0);
  });
  
  test('should get blockchain info', async () => {
    const blockchainInfo = await client.getBlockchainInfo();
    expect(blockchainInfo).toBeDefined();
    expect(blockchainInfo.chain).toBe('regtest');
  });
  
  // Add more tests for specific functionality
});
```

## Mocking Bitcoin Core for Development

For development without a Bitcoin Core node, create mock responses:

```javascript
// Example mock Bitcoin Core client
class MockBitcoinClient {
  async getNetworkInfo() {
    return {
      version: 280100,
      subversion: '/Satoshi:28.1.0/',
      protocolversion: 70016,
      localservices: '000000000000040d',
      localservicesnames: ['NETWORK', 'BLOOM', 'WITNESS', 'NETWORK_LIMITED'],
      localrelay: true,
      timeoffset: 0,
      networkactive: true,
      connections: 8,
      connections_in: 0,
      connections_out: 8,
      networks: [
        {
          name: 'ipv4',
          limited: false,
          reachable: true,
          proxy: '',
          proxy_randomize_credentials: false
        },
        {
          name: 'ipv6',
          limited: false,
          reachable: true,
          proxy: '',
          proxy_randomize_credentials: false
        },
        {
          name: 'onion',
          limited: true,
          reachable: false,
          proxy: '',
          proxy_randomize_credentials: false
        }
      ],
      relayfee: 0.00001000,
      incrementalfee: 0.00001000,
      localaddresses: [],
      warnings: ''
    };
  }
  
  // Add more mock methods as needed
}

// Use environment variable to switch between real and mock client
const getBitcoinClient = () => {
  if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_BITCOIN === 'true') {
    return new MockBitcoinClient();
  } else {
    return new Client({
      network: process.env.BITCOIN_NETWORK || 'mainnet',
      username: process.env.BITCOIN_RPC_USER,
      password: process.env.BITCOIN_RPC_PASSWORD,
      host: process.env.BITCOIN_RPC_HOST || '127.0.0.1',
      port: process.env.BITCOIN_RPC_PORT || 8332
    });
  }
};
```
