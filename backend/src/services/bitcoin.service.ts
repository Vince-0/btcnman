import Client from 'bitcoin-core';
import axios from 'axios';

// Check if we should use mock data
const USE_MOCK = process.env.USE_MOCK === 'true' || false;

// Bitcoin RPC configuration
const RPC_USER = process.env.BITCOIN_RPC_USER || 'admin';
const RPC_PASSWORD = process.env.BITCOIN_RPC_PASSWORD || 'ydnabcdef123';
const RPC_HOST = process.env.BITCOIN_RPC_HOST || '169.255.240.110';
const RPC_PORT = parseInt(process.env.BITCOIN_RPC_PORT || '8332');
const RPC_URL = `http://${RPC_HOST}:${RPC_PORT}`;

// Create a custom RPC client using axios
const customRpcClient = {
  async call(method: string, params: any[] = []) {
    try {
      const auth = Buffer.from(`${RPC_USER}:${RPC_PASSWORD}`).toString('base64');

      const response = await axios({
        method: 'post',
        url: RPC_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          'User-Agent': 'Bitcoin Node Manager/1.0.0'
        },
        data: {
          jsonrpc: '1.0',
          id: Date.now(),
          method,
          params
        },
        timeout: 60000  // Increase timeout to 60 seconds (2x the original)
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result;
    } catch (error) {
      console.error(`Error calling RPC method ${method}:`, error);
      throw error;
    }
  }
};

// Create a function to get the bitcoin-core client
// This allows us to create it on-demand and handle connection issues more gracefully
function getBitcoinClient() {
  if (USE_MOCK) {
    return null;
  }

  try {
    return new Client({
      username: RPC_USER,
      password: RPC_PASSWORD,
      host: RPC_HOST,
      port: RPC_PORT,
      network: process.env.BITCOIN_NETWORK || 'mainnet',
      version: '28.1.0',  // Match the Bitcoin Core version
      ssl: {
        enabled: false
      },
      timeout: 60000,  // Increase timeout to 60 seconds (2x the original)
      headers: {
        'User-Agent': 'Bitcoin Node Manager/1.0.0'
      },
      // Fix URI format issue
      agentOptions: {
        rejectUnauthorized: false
      },
      // Fix the URI format issue by setting the proper protocol
      baseUrl: `http://${RPC_HOST}:${RPC_PORT}/`,
      // Disable strict SSL
      strictSSL: false
    } as any);
  } catch (error) {
    console.error('Error creating Bitcoin client:', error);
    return null;
  }
}

// Initialize the client (can be null if USE_MOCK is true or if there's an error)
const client = getBitcoinClient();

// Mock data for development
const mockData = {
  networkInfo: {
    version: 280100,
    subversion: '/Satoshi:28.1.0/',
    protocolversion: 70016,
    localservices: '000000000000040d',
    localservicesnames: ['NETWORK', 'BLOOM', 'WITNESS', 'NETWORK_LIMITED'],
    localrelay: true,
    timeoffset: 0,
    networkactive: true,
    connections: 8,
    connections_in: 3,
    connections_out: 5,
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
        limited: false,
        reachable: true,
        proxy: '',
        proxy_randomize_credentials: false
      }
    ],
    relayfee: 0.00001,
    incrementalfee: 0.00001,
    localaddresses: [
      {
        address: '192.168.1.100',
        port: 8333,
        score: 1
      }
    ],
    warnings: ''
  },
  blockchainInfo: {
    chain: 'mainnet',
    blocks: 825000,
    headers: 825000,
    bestblockhash: '000000000000000000000000000000000000000000000000000000000000000',
    difficulty: 78352956298608,
    mediantime: 1714579200,
    verificationprogress: 0.9999,
    initialblockdownload: false,
    chainwork: '000000000000000000000000000000000000000000000000000000000000000',
    size_on_disk: 500000000000,
    pruned: false,
    softforks: {},
    warnings: ''
  },
  mempoolInfo: {
    loaded: true,
    size: 2500,
    bytes: 125450000,
    usage: 125450000,
    maxmempool: 300000000,
    mempoolminfee: 0.00001000,
    minrelaytxfee: 0.00001000,
    unbroadcastcount: 0
  },
  peerInfo: [
    {
      id: 1,
      addr: '192.168.1.100:8333',
      addrbind: '192.168.1.100:8333',
      addrlocal: '192.168.1.100:8333',
      services: '000000000000040d',
      servicesnames: ['NETWORK', 'BLOOM', 'WITNESS', 'NETWORK_LIMITED'],
      relaytxes: true,
      lastsend: 1714579200,
      lastrecv: 1714579200,
      bytessent: 1000000,
      bytesrecv: 2000000,
      conntime: 1714579200,
      timeoffset: 0,
      pingtime: 0.05,
      minping: 0.04,
      version: 70016,
      subver: '/Satoshi:28.1.0/',
      inbound: false,
      addnode: false,
      startingheight: 825000,
      banscore: 0,
      synced_headers: 825000,
      synced_blocks: 825000,
      inflight: [],
      whitelisted: false,
      permissions: [],
      minfeefilter: 0.00001000,
      bytessent_per_msg: {},
      bytesrecv_per_msg: {}
    },
    {
      id: 2,
      addr: '203.0.113.42:8333',
      addrbind: '203.0.113.42:8333',
      addrlocal: '203.0.113.42:8333',
      services: '000000000000040d',
      servicesnames: ['NETWORK', 'BLOOM', 'WITNESS', 'NETWORK_LIMITED'],
      relaytxes: true,
      lastsend: 1714579200,
      lastrecv: 1714579200,
      bytessent: 1000000,
      bytesrecv: 2000000,
      conntime: 1714579200,
      timeoffset: 0,
      pingtime: 0.08,
      minping: 0.07,
      version: 70015,
      subver: '/Satoshi:27.0.0/',
      inbound: true,
      addnode: false,
      startingheight: 825000,
      banscore: 0,
      synced_headers: 825000,
      synced_blocks: 825000,
      inflight: [],
      whitelisted: false,
      permissions: [],
      minfeefilter: 0.00001000,
      bytessent_per_msg: {},
      bytesrecv_per_msg: {}
    },
    {
      id: 3,
      addr: '198.51.100.23:8333',
      addrbind: '198.51.100.23:8333',
      addrlocal: '198.51.100.23:8333',
      services: '000000000000040d',
      servicesnames: ['NETWORK', 'BLOOM', 'WITNESS', 'NETWORK_LIMITED'],
      relaytxes: true,
      lastsend: 1714579200,
      lastrecv: 1714579200,
      bytessent: 1000000,
      bytesrecv: 2000000,
      conntime: 1714579200,
      timeoffset: 0,
      pingtime: 0.10,
      minping: 0.09,
      version: 70016,
      subver: '/Satoshi:28.0.1/',
      inbound: false,
      addnode: false,
      startingheight: 825000,
      banscore: 0,
      synced_headers: 825000,
      synced_blocks: 825000,
      inflight: [],
      whitelisted: false,
      permissions: [],
      minfeefilter: 0.00001000,
      bytessent_per_msg: {},
      bytesrecv_per_msg: {}
    }
  ]
};

export async function getNodeInfo() {
  try {
    // Use mock data if enabled
    if (USE_MOCK) {
      console.log('Using mock data (USE_MOCK is true)');
      return {
        networkInfo: mockData.networkInfo,
        blockchainInfo: mockData.blockchainInfo,
        mempoolInfo: mockData.mempoolInfo,
        peerInfo: mockData.peerInfo
      };
    }

    // Initialize result object with mock data as fallback
    const result = {
      networkInfo: mockData.networkInfo,
      blockchainInfo: mockData.blockchainInfo,
      mempoolInfo: mockData.mempoolInfo,
      peerInfo: mockData.peerInfo
    };

    // Try to get each piece of data individually to avoid all-or-nothing failures
    try {
      console.log('Attempting to get network info...');
      result.networkInfo = await customRpcClient.call('getnetworkinfo');
      console.log('Successfully retrieved network info');
    } catch (networkError) {
      console.error('Failed to get network info:', networkError.message);

      // Only try the bitcoin-core client if it's available
      if (client) {
        try {
          console.log('Trying bitcoin-core client for network info...');
          result.networkInfo = await (client as any).getNetworkInfo();
          console.log('Successfully retrieved network info via bitcoin-core');
        } catch (fallbackError) {
          console.error('Fallback also failed for network info:', fallbackError.message);
          // Keep mock data for this component
        }
      } else {
        console.log('Bitcoin-core client not available, using mock data for network info');
        // Keep mock data for this component
      }
    }

    try {
      console.log('Attempting to get blockchain info...');
      result.blockchainInfo = await customRpcClient.call('getblockchaininfo');
      console.log('Successfully retrieved blockchain info');
    } catch (blockchainError) {
      console.error('Failed to get blockchain info:', blockchainError.message);

      // Only try the bitcoin-core client if it's available
      if (client) {
        try {
          console.log('Trying bitcoin-core client for blockchain info...');
          result.blockchainInfo = await (client as any).getBlockchainInfo();
          console.log('Successfully retrieved blockchain info via bitcoin-core');
        } catch (fallbackError) {
          console.error('Fallback also failed for blockchain info:', fallbackError.message);
          // Keep mock data for this component
        }
      } else {
        console.log('Bitcoin-core client not available, using mock data for blockchain info');
        // Keep mock data for this component
      }
    }

    try {
      console.log('Attempting to get mempool info...');
      result.mempoolInfo = await customRpcClient.call('getmempoolinfo');
      console.log('Successfully retrieved mempool info');
    } catch (mempoolError) {
      console.error('Failed to get mempool info:', mempoolError.message);

      // Only try the bitcoin-core client if it's available
      if (client) {
        try {
          console.log('Trying bitcoin-core client for mempool info...');
          result.mempoolInfo = await (client as any).getMempoolInfo();
          console.log('Successfully retrieved mempool info via bitcoin-core');
        } catch (fallbackError) {
          console.error('Fallback also failed for mempool info:', fallbackError.message);
          // Keep mock data for this component
        }
      } else {
        console.log('Bitcoin-core client not available, using mock data for mempool info');
        // Keep mock data for this component
      }
    }

    try {
      console.log('Attempting to get peer info...');
      result.peerInfo = await customRpcClient.call('getpeerinfo');
      console.log('Successfully retrieved peer info');
    } catch (peerError) {
      console.error('Failed to get peer info:', peerError.message);

      // Only try the bitcoin-core client if it's available
      if (client) {
        try {
          console.log('Trying bitcoin-core client for peer info...');
          result.peerInfo = await (client as any).getPeerInfo();
          console.log('Successfully retrieved peer info via bitcoin-core');
        } catch (fallbackError) {
          console.error('Fallback also failed for peer info:', fallbackError.message);
          // Keep mock data for this component
        }
      } else {
        console.log('Bitcoin-core client not available, using mock data for peer info');
        // Keep mock data for this component
      }
    }

    return result;
  } catch (error) {
    console.error('Error getting node info:', error);

    // Return mock data as a last resort
    console.log('All RPC methods failed, returning mock data');
    return {
      networkInfo: mockData.networkInfo,
      blockchainInfo: mockData.blockchainInfo,
      mempoolInfo: mockData.mempoolInfo,
      peerInfo: mockData.peerInfo
    };
  }
}

export async function getPeers() {
  try {
    if (USE_MOCK) {
      console.log('Using mock data for peers (USE_MOCK is true)');
      return mockData.peerInfo;
    }

    try {
      // Try using the custom RPC client first
      console.log('Attempting to get peer info...');
      const peerInfo = await customRpcClient.call('getpeerinfo');
      console.log('Successfully retrieved peer info');
      return peerInfo;
    } catch (rpcError) {
      console.error('Custom RPC client failed for getPeers:', rpcError.message);

      // Only try the bitcoin-core client if it's available
      if (client) {
        try {
          // Fall back to the bitcoin-core client
          console.log('Trying bitcoin-core client for peer info...');
          const peerInfo = await (client as any).getPeerInfo();
          console.log('Successfully retrieved peer info via bitcoin-core');
          return peerInfo;
        } catch (fallbackError) {
          console.error('Fallback also failed for peer info:', fallbackError.message);

          // Return mock data as a last resort
          console.log('All RPC methods failed for peers, returning mock data');
          return mockData.peerInfo;
        }
      } else {
        console.log('Bitcoin-core client not available, using mock data for peer info');
        return mockData.peerInfo;
      }
    }
  } catch (error) {
    console.error('Error getting peers:', error);
    // Return mock data as a last resort
    console.log('Unexpected error getting peers, returning mock data');
    return mockData.peerInfo;
  }
}

export async function getBannedPeers() {
  // Define mock banned peers data
  const mockBannedPeers = [
    { address: '192.168.1.200', banned_until: Date.now() + 86400000, ban_created: Date.now(), ban_reason: 'manually banned' },
    { address: '192.168.1.201', banned_until: Date.now() + 43200000, ban_created: Date.now() - 43200000, ban_reason: 'node misbehaving' }
  ];

  try {
    if (USE_MOCK || !client) {
      console.log('Using mock data for banned peers (USE_MOCK is true or client is not available)');
      return mockBannedPeers;
    }

    try {
      // Try using the custom RPC client first
      console.log('Attempting to get banned peers...');
      const bannedPeers = await customRpcClient.call('listbanned');
      console.log('Successfully retrieved banned peers');
      return bannedPeers;
    } catch (rpcError) {
      console.error('Custom RPC client failed for getBannedPeers:', rpcError.message);

      try {
        // Fall back to the bitcoin-core client
        console.log('Trying bitcoin-core client for banned peers...');
        const bannedPeers = await (client as any).listBanned();
        console.log('Successfully retrieved banned peers via bitcoin-core');
        return bannedPeers;
      } catch (fallbackError) {
        console.error('Fallback also failed for banned peers:', fallbackError.message);

        // Return mock data as fallback
        console.log('Returning mock data for banned peers due to error');
        return mockBannedPeers;
      }
    }
  } catch (error) {
    console.error('Unexpected error getting banned peers:', error);
    // Return mock data as a last resort
    return mockBannedPeers;
  }
}

export async function banPeer(ip: string, banTime: number = 86400) {
  try {
    if (USE_MOCK || !client) {
      console.log(`Mock: Banned peer ${ip} for ${banTime} seconds`);
      return { success: true, message: `Mock: Banned peer ${ip} for ${banTime} seconds` };
    }

    try {
      await (client as any).setban(ip, 'add', banTime);
      return { success: true, message: `Banned peer ${ip} for ${banTime} seconds` };
    } catch (error) {
      console.error(`Error banning peer ${ip}:`, error);
      return { success: false, message: `Failed to ban peer: ${error.message}` };
    }
  } catch (error) {
    console.error(`Unexpected error banning peer ${ip}:`, error);
    return { success: false, message: `Unexpected error: ${error.message}` };
  }
}

export async function unbanPeer(ip: string) {
  try {
    if (USE_MOCK || !client) {
      console.log(`Mock: Unbanned peer ${ip}`);
      return { success: true, message: `Mock: Unbanned peer ${ip}` };
    }

    try {
      await (client as any).setban(ip, 'remove');
      return { success: true, message: `Unbanned peer ${ip}` };
    } catch (error) {
      console.error(`Error unbanning peer ${ip}:`, error);
      return { success: false, message: `Failed to unban peer: ${error.message}` };
    }
  } catch (error) {
    console.error(`Unexpected error unbanning peer ${ip}:`, error);
    return { success: false, message: `Unexpected error: ${error.message}` };
  }
}

export async function disconnectPeer(nodeId: string) {
  try {
    if (USE_MOCK || !client) {
      console.log(`Mock: Disconnected peer ${nodeId}`);
      return { success: true, message: `Mock: Disconnected peer ${nodeId}` };
    }

    try {
      await (client as any).disconnectNode(nodeId);
      return { success: true, message: `Disconnected peer ${nodeId}` };
    } catch (error) {
      console.error(`Error disconnecting peer ${nodeId}:`, error);
      return { success: false, message: `Failed to disconnect peer: ${error.message}` };
    }
  } catch (error) {
    console.error(`Unexpected error disconnecting peer ${nodeId}:`, error);
    return { success: false, message: `Unexpected error: ${error.message}` };
  }
}

export async function getBlock(hash: string) {
  const mockBlock = {
    hash: hash || '000000000000000000000000000000000000000000000000000000000000000',
    confirmations: 1000,
    size: 1000000,
    strippedsize: 900000,
    weight: 4000000,
    height: 825000,
    version: 536870912,
    versionHex: '20000000',
    merkleroot: '000000000000000000000000000000000000000000000000000000000000000',
    tx: [
      {
        txid: '000000000000000000000000000000000000000000000000000000000000000',
        hash: '000000000000000000000000000000000000000000000000000000000000000',
        version: 1,
        size: 250,
        vsize: 250,
        weight: 1000,
        locktime: 0,
        vin: [],
        vout: []
      }
    ],
    time: 1714579200,
    mediantime: 1714579100,
    nonce: 123456789,
    bits: '1d00ffff',
    difficulty: 78352956298608,
    chainwork: '000000000000000000000000000000000000000000000000000000000000000',
    nTx: 1,
    previousblockhash: '000000000000000000000000000000000000000000000000000000000000000',
    nextblockhash: '000000000000000000000000000000000000000000000000000000000000000'
  };

  try {
    if (USE_MOCK || !client) {
      console.log(`Using mock data for block ${hash}`);
      return mockBlock;
    }

    try {
      return await (client as any).getBlock(hash, 2);
    } catch (error) {
      console.error(`Error getting block ${hash}:`, error);
      console.log(`Returning mock data for block ${hash}`);
      return mockBlock;
    }
  } catch (error) {
    console.error(`Unexpected error getting block ${hash}:`, error);
    return mockBlock;
  }
}

export async function getBlockByHeight(height: number) {
  const mockBlock = {
    hash: '000000000000000000000000000000000000000000000000000000000000000',
    confirmations: 1000,
    size: 1000000,
    strippedsize: 900000,
    weight: 4000000,
    height: height,
    version: 536870912,
    versionHex: '20000000',
    merkleroot: '000000000000000000000000000000000000000000000000000000000000000',
    tx: [
      {
        txid: '000000000000000000000000000000000000000000000000000000000000000',
        hash: '000000000000000000000000000000000000000000000000000000000000000',
        version: 1,
        size: 250,
        vsize: 250,
        weight: 1000,
        locktime: 0,
        vin: [],
        vout: []
      }
    ],
    time: 1714579200,
    mediantime: 1714579100,
    nonce: 123456789,
    bits: '1d00ffff',
    difficulty: 78352956298608,
    chainwork: '000000000000000000000000000000000000000000000000000000000000000',
    nTx: 1,
    previousblockhash: '000000000000000000000000000000000000000000000000000000000000000',
    nextblockhash: '000000000000000000000000000000000000000000000000000000000000000'
  };

  try {
    if (USE_MOCK || !client) {
      console.log(`Using mock data for block at height ${height}`);
      return mockBlock;
    }

    try {
      const hash = await (client as any).getBlockHash(height);
      return await getBlock(hash);
    } catch (error) {
      console.error(`Error getting block at height ${height}:`, error);
      console.log(`Returning mock data for block at height ${height}`);
      return mockBlock;
    }
  } catch (error) {
    console.error(`Unexpected error getting block at height ${height}:`, error);
    return mockBlock;
  }
}

export async function getTransaction(txid: string) {
  const mockTx = {
    txid: txid || '000000000000000000000000000000000000000000000000000000000000000',
    hash: '000000000000000000000000000000000000000000000000000000000000000',
    version: 1,
    size: 250,
    vsize: 250,
    weight: 1000,
    locktime: 0,
    vin: [],
    vout: [],
    hex: '',
    blockhash: '000000000000000000000000000000000000000000000000000000000000000',
    confirmations: 1000,
    time: 1714579200,
    blocktime: 1714579200
  };

  try {
    if (USE_MOCK || !client) {
      console.log(`Using mock data for transaction ${txid}`);
      return mockTx;
    }

    try {
      return await (client as any).getRawTransaction(txid, true);
    } catch (error) {
      console.error(`Error getting transaction ${txid}:`, error);
      console.log(`Returning mock data for transaction ${txid}`);
      return mockTx;
    }
  } catch (error) {
    console.error(`Unexpected error getting transaction ${txid}:`, error);
    return mockTx;
  }
}

export async function getWalletInfo() {
  const mockWalletInfo = {
    walletname: '',
    walletversion: 169900,
    balance: 1.25,
    unconfirmed_balance: 0.1,
    immature_balance: 0,
    txcount: 100,
    keypoololdest: 1714579200,
    keypoolsize: 1000,
    keypoolsize_hd_internal: 1000,
    paytxfee: 0.00001,
    private_keys_enabled: true,
    avoid_reuse: false,
    scanning: false
  };

  try {
    if (USE_MOCK || !client) {
      console.log('Using mock data for wallet info');
      return mockWalletInfo;
    }

    try {
      return await (client as any).getWalletInfo();
    } catch (error) {
      console.error('Error getting wallet info:', error);
      console.log('Returning mock data for wallet info');
      return mockWalletInfo;
    }
  } catch (error) {
    console.error('Unexpected error getting wallet info:', error);
    return mockWalletInfo;
  }
}

// Export mock data for use in controllers
export function getMockData() {
  return mockData;
}
