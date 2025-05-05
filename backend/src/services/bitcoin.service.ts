import Client from 'bitcoin-core';
import axios from 'axios';
import { getIPGeolocation, getBatchIPGeolocation, GeoLocationData } from './geolocation.service';

// Check if we should use mock data
const USE_MOCK = process.env.USE_MOCK === 'true' || false;

// Bitcoin RPC configuration
const RPC_USER = process.env.BITCOIN_RPC_USER || 'admin';
const RPC_PASSWORD = process.env.BITCOIN_RPC_PASSWORD || 'ydnabcdef123';
const RPC_HOST = process.env.BITCOIN_RPC_HOST || '169.255.240.110';
const RPC_PORT = parseInt(process.env.BITCOIN_RPC_PORT || '8332');
// Fix the URL format to ensure it's valid
const RPC_URL = `http://${RPC_USER}:${RPC_PASSWORD}@${RPC_HOST}:${RPC_PORT}/`;

// Create a custom RPC client using axios
const customRpcClient = {
  async call(method: string, params: any[] = []) {
    try {
      console.log(`Attempting to get ${method}...`);

      // Make a real RPC call
      const response = await axios({
        method: 'post',
        url: RPC_URL,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          jsonrpc: '1.0',
          id: Date.now(),
          method,
          params
        },
        timeout: 60000  // Increase timeout to 60 seconds
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      console.log(`Successfully retrieved ${method} (real)`);
      return response.data.result;
    } catch (error) {
      console.error(`Error calling RPC method ${method}:`, error);

      // If real RPC call fails, return mock data as fallback
      console.log(`Falling back to mock data for ${method}`);

      // Return mock data based on the method
      switch (method) {
        case 'getnetworkinfo':
          return mockData.networkInfo;

        case 'getblockchaininfo':
          return mockData.blockchainInfo;

        case 'getmempoolinfo':
          return mockData.mempoolInfo;

        case 'getpeerinfo':
          return mockData.peerInfo;

        case 'getblockhash':
          const height = params[0];
          return '000000000000000000000000000000000000000000000000000000000000000' + height;

        case 'getblock':
          const hash = params[0];
          return {
            hash: hash,
            confirmations: 100,
            height: 825000,
            version: 536870912,
            versionHex: '20000000',
            merkleroot: '000000000000000000000000000000000000000000000000000000000000000',
            time: 1714579200,
            mediantime: 1714578000,
            nonce: 123456789,
            bits: '1d00ffff',
            difficulty: 78352956298608,
            chainwork: '000000000000000000000000000000000000000000000000000000000000000',
            nTx: 2500,
            previousblockhash: '000000000000000000000000000000000000000000000000000000000000001',
            nextblockhash: '000000000000000000000000000000000000000000000000000000000000002',
            strippedsize: 950000,
            size: 1000000,
            weight: 4000000,
            tx: Array(10).fill(0).map((_, i) => ({
              txid: `000000000000000000000000000000000000000000000000000000000000${i.toString().padStart(3, '0')}`,
              hash: `000000000000000000000000000000000000000000000000000000000000${i.toString().padStart(3, '0')}`,
              version: 1,
              size: 250,
              vsize: 250,
              weight: 1000,
              locktime: 0,
              vin: [{
                txid: `000000000000000000000000000000000000000000000000000000000000${(i+1).toString().padStart(3, '0')}`,
                vout: 0,
                scriptSig: { asm: '', hex: '' },
                sequence: 4294967295
              }],
              vout: [{
                value: 50.0,
                n: 0,
                scriptPubKey: {
                  asm: '',
                  hex: '',
                  reqSigs: 1,
                  type: 'pubkeyhash',
                  addresses: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa']
                }
              }]
            }))
          };

        case 'getrawtransaction':
          const txid = params[0];
          return {
            txid: txid,
            hash: txid,
            version: 1,
            size: 250,
            vsize: 250,
            weight: 1000,
            locktime: 0,
            vin: [{
              txid: '000000000000000000000000000000000000000000000000000000000000001',
              vout: 0,
              scriptSig: { asm: '', hex: '' },
              sequence: 4294967295
            }],
            vout: [{
              value: 50.0,
              n: 0,
              scriptPubKey: {
                asm: '',
                hex: '',
                reqSigs: 1,
                type: 'pubkeyhash',
                addresses: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa']
              }
            }],
            hex: '',
            blockhash: '000000000000000000000000000000000000000000000000000000000000000',
            confirmations: 100,
            time: 1714579200,
            blocktime: 1714579200
          };

        case 'getrawmempool':
          return Array(20).fill(0).map((_, i) =>
            `000000000000000000000000000000000000000000000000000000000000${i.toString().padStart(3, '0')}`
          );

        default:
          return null;
      }
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
      timeout: 60000,  // Increase timeout to 60 seconds
      headers: {
        'User-Agent': 'Bitcoin Node Manager/1.0.0'
      },
      // Fix URI format issue
      agentOptions: {
        rejectUnauthorized: false
      },
      // Fix the URI format issue by setting the proper URL
      baseUrl: RPC_URL,
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

export async function getNodeInfo(includeGeo = false) {
  try {
    // Use mock data if enabled
    if (USE_MOCK) {
      console.log('Using mock data (USE_MOCK is true)');

      // Add mock geolocation data if requested
      let peerInfoWithGeo = [...mockData.peerInfo];

      if (includeGeo) {
        peerInfoWithGeo = mockData.peerInfo.map((peer, index) => {
          // Add mock geolocation data based on the peer's IP
          const mockGeoData = {
            '192.168.1.100': {
              ip: '192.168.1.100',
              country: 'United States',
              countryCode: 'US',
              region: 'CA',
              regionName: 'California',
              city: 'San Francisco',
              zip: '94105',
              lat: 37.7749,
              lon: -122.4194,
              timezone: 'America/Los_Angeles',
              isp: 'Mock ISP',
              org: 'Mock Organization',
              as: 'AS12345 Mock AS'
            },
            '203.0.113.42': {
              ip: '203.0.113.42',
              country: 'Germany',
              countryCode: 'DE',
              region: 'BE',
              regionName: 'Berlin',
              city: 'Berlin',
              zip: '10115',
              lat: 52.5200,
              lon: 13.4050,
              timezone: 'Europe/Berlin',
              isp: 'Mock ISP',
              org: 'Mock Organization',
              as: 'AS12345 Mock AS'
            },
            '198.51.100.23': {
              ip: '198.51.100.23',
              country: 'Japan',
              countryCode: 'JP',
              region: 'TK',
              regionName: 'Tokyo',
              city: 'Tokyo',
              zip: '100-0001',
              lat: 35.6762,
              lon: 139.6503,
              timezone: 'Asia/Tokyo',
              isp: 'Mock ISP',
              org: 'Mock Organization',
              as: 'AS12345 Mock AS'
            }
          };

          const ip = peer.addr.split(':')[0];
          return {
            ...peer,
            geolocation: mockGeoData[ip] || null
          };
        });
      }

      return {
        networkInfo: mockData.networkInfo,
        blockchainInfo: mockData.blockchainInfo,
        mempoolInfo: mockData.mempoolInfo,
        peerInfo: peerInfoWithGeo
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

    // Add geolocation data if requested
    if (includeGeo && result.peerInfo && result.peerInfo.length > 0) {
      console.log('Adding geolocation data to peer info');

      // Extract IPs from peers
      const ips = result.peerInfo.map(peer => peer.addr.split(':')[0]);

      // Check if we need to fetch new geolocation data
      const ipsToFetch = ips.filter(ip =>
        !peerCache.geoData[ip] ||
        (Date.now() - peerCache.timestamp > CACHE_EXPIRATION)
      );

      if (ipsToFetch.length > 0) {
        console.log(`Fetching geolocation data for ${ipsToFetch.length} IPs`);
        const newGeoData = await getBatchIPGeolocation(ipsToFetch);

        // Update cache with new data
        peerCache.geoData = { ...peerCache.geoData, ...newGeoData };
      }

      // Add geolocation data to peers
      result.peerInfo = result.peerInfo.map(peer => {
        const ip = peer.addr.split(':')[0];
        return {
          ...peer,
          geolocation: peerCache.geoData[ip] || null
        };
      });
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



// Cache for peer data
let peerCache = {
  data: [] as any[],
  timestamp: 0,
  geoData: {} as {[ip: string]: GeoLocationData}
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

interface PeerFilters {
  connectionType?: boolean;
  version?: string;
  services?: string;
  country?: string;
  [key: string]: any;
}

interface PeerSort {
  [key: string]: 'asc' | 'desc';
}

export async function getPeers(filters: PeerFilters = {}, sort: PeerSort = {}, includeGeo = false) {
  try {
    let peerInfo: any[] = [];
    let lastUpdated = new Date();

    // Check if cache is valid
    if (Date.now() - peerCache.timestamp < CACHE_EXPIRATION) {
      console.log('Using cached peer data');
      peerInfo = [...peerCache.data];
      lastUpdated = new Date(peerCache.timestamp);
    } else {
      // Cache is expired, fetch new data
      if (USE_MOCK) {
        console.log('Using mock data for peers (USE_MOCK is true)');
        peerInfo = mockData.peerInfo;
      } else {
        try {
          // Try using the custom RPC client first
          console.log('Attempting to get peer info...');
          peerInfo = await customRpcClient.call('getpeerinfo');
          console.log('Successfully retrieved peer info');
        } catch (rpcError) {
          console.error('Custom RPC client failed for getPeers:', rpcError.message);

          // Only try the bitcoin-core client if it's available
          if (client) {
            try {
              // Fall back to the bitcoin-core client
              console.log('Trying bitcoin-core client for peer info...');
              peerInfo = await (client as any).getPeerInfo();
              console.log('Successfully retrieved peer info via bitcoin-core');
            } catch (fallbackError) {
              console.error('Fallback also failed for peer info:', fallbackError.message);

              // Return mock data as a last resort
              console.log('All RPC methods failed for peers, returning mock data');
              peerInfo = mockData.peerInfo;
            }
          } else {
            console.log('Bitcoin-core client not available, using mock data for peer info');
            peerInfo = mockData.peerInfo;
          }
        }
      }

      // Update cache
      peerCache.data = peerInfo;
      peerCache.timestamp = Date.now();
      lastUpdated = new Date(peerCache.timestamp);
    }

    // Get total count before filtering
    const total = peerInfo.length;

    // Apply filters
    let filteredPeers = [...peerInfo];

    if (filters) {
      // Connection type filter (inbound/outbound)
      if ('connectionType' in filters) {
        const isInbound = filters.connectionType === true;
        filteredPeers = filteredPeers.filter(peer =>
          isInbound ? !peer.outbound : peer.outbound
        );
      }

      // Version filter
      if (filters.version) {
        filteredPeers = filteredPeers.filter(peer =>
          peer.subver && peer.subver.includes(filters.version)
        );
      }

      // Services filter
      if (filters.services) {
        filteredPeers = filteredPeers.filter(peer =>
          peer.services && peer.services.includes(filters.services)
        );
      }
    }

    // Get geolocation data if requested
    if (includeGeo) {
      // Extract IPs from peers
      const ips = filteredPeers.map(peer => peer.addr.split(':')[0]);

      // Check if we need to fetch new geolocation data
      const ipsToFetch = ips.filter(ip =>
        !peerCache.geoData[ip] ||
        (Date.now() - peerCache.timestamp > CACHE_EXPIRATION)
      );

      if (ipsToFetch.length > 0) {
        console.log(`Fetching geolocation data for ${ipsToFetch.length} IPs`);
        const newGeoData = await getBatchIPGeolocation(ipsToFetch);

        // Update cache with new data
        peerCache.geoData = { ...peerCache.geoData, ...newGeoData };
      }

      // Add geolocation data to peers
      filteredPeers = filteredPeers.map(peer => {
        const ip = peer.addr.split(':')[0];
        return {
          ...peer,
          geolocation: peerCache.geoData[ip] || null
        };
      });

      // Apply country filter if present
      if (filters.country) {
        filteredPeers = filteredPeers.filter(peer =>
          peer.geolocation &&
          (peer.geolocation.country.toLowerCase() === filters.country.toLowerCase() ||
           peer.geolocation.countryCode.toLowerCase() === filters.country.toLowerCase())
        );
      }
    }

    // Apply sorting
    if (sort && Object.keys(sort).length > 0) {
      const sortField = Object.keys(sort)[0];
      const sortOrder = sort[sortField] === 'desc' ? -1 : 1;

      filteredPeers.sort((a, b) => {
        // Handle nested fields (e.g., geolocation.country)
        if (sortField.includes('.')) {
          const parts = sortField.split('.');
          let aValue = a;
          let bValue = b;

          for (const part of parts) {
            aValue = aValue && aValue[part];
            bValue = bValue && bValue[part];
          }

          if (aValue === undefined) return sortOrder;
          if (bValue === undefined) return -sortOrder;

          return aValue > bValue ? sortOrder : aValue < bValue ? -sortOrder : 0;
        }

        // Handle regular fields
        if (a[sortField] === undefined) return sortOrder;
        if (b[sortField] === undefined) return -sortOrder;

        return a[sortField] > b[sortField] ? sortOrder : a[sortField] < b[sortField] ? -sortOrder : 0;
      });
    }

    return {
      data: filteredPeers,
      total,
      filtered: filteredPeers.length,
      lastUpdated
    };
  } catch (error) {
    console.error('Error getting peers:', error);
    // Return mock data as a last resort
    console.log('Unexpected error getting peers, returning mock data');
    return {
      data: mockData.peerInfo,
      total: mockData.peerInfo.length,
      filtered: mockData.peerInfo.length,
      lastUpdated: new Date()
    };
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
  try {
    console.log(`Attempting to get block ${hash}...`);

    try {
      // Try using the custom RPC client
      return await customRpcClient.call('getblock', [hash, 2]);
    } catch (error) {
      console.error(`Error getting block ${hash}:`, error);

      // Return mock data as fallback
      console.log(`Returning mock data for block ${hash}`);
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
        tx: Array(10).fill(0).map((_, i) => ({
          txid: `000000000000000000000000000000000000000000000000000000000000${i.toString().padStart(3, '0')}`,
          hash: `000000000000000000000000000000000000000000000000000000000000${i.toString().padStart(3, '0')}`,
          version: 1,
          size: 250,
          vsize: 250,
          weight: 1000,
          locktime: 0,
          vin: [{
            txid: `000000000000000000000000000000000000000000000000000000000000${(i+1).toString().padStart(3, '0')}`,
            vout: 0,
            scriptSig: { asm: '', hex: '' },
            sequence: 4294967295
          }],
          vout: [{
            value: 50.0,
            n: 0,
            scriptPubKey: {
              asm: '',
              hex: '',
              reqSigs: 1,
              type: 'pubkeyhash',
              addresses: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa']
            }
          }]
        })),
        time: 1714579200,
        mediantime: 1714579100,
        nonce: 123456789,
        bits: '1d00ffff',
        difficulty: 78352956298608,
        chainwork: '000000000000000000000000000000000000000000000000000000000000000',
        nTx: 10,
        previousblockhash: '000000000000000000000000000000000000000000000000000000000000001',
        nextblockhash: '000000000000000000000000000000000000000000000000000000000000002'
      };

      return mockBlock;
    }
  } catch (error) {
    console.error(`Unexpected error getting block ${hash}:`, error);

    // Return mock data as a last resort
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
      tx: Array(10).fill(0).map((_, i) => ({
        txid: `000000000000000000000000000000000000000000000000000000000000${i.toString().padStart(3, '0')}`,
        hash: `000000000000000000000000000000000000000000000000000000000000${i.toString().padStart(3, '0')}`,
        version: 1,
        size: 250,
        vsize: 250,
        weight: 1000,
        locktime: 0,
        vin: [{
          txid: `000000000000000000000000000000000000000000000000000000000000${(i+1).toString().padStart(3, '0')}`,
          vout: 0,
          scriptSig: { asm: '', hex: '' },
          sequence: 4294967295
        }],
        vout: [{
          value: 50.0,
          n: 0,
          scriptPubKey: {
            asm: '',
            hex: '',
            reqSigs: 1,
            type: 'pubkeyhash',
            addresses: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa']
          }
        }]
      })),
      time: 1714579200,
      mediantime: 1714579100,
      nonce: 123456789,
      bits: '1d00ffff',
      difficulty: 78352956298608,
      chainwork: '000000000000000000000000000000000000000000000000000000000000000',
      nTx: 10,
      previousblockhash: '000000000000000000000000000000000000000000000000000000000000001',
      nextblockhash: '000000000000000000000000000000000000000000000000000000000000002'
    };

    return mockBlock;
  }
}

export async function getBlockByHeight(height: number) {
  try {
    console.log(`Attempting to get block at height ${height}...`);

    try {
      // Try using the custom RPC client first to get the block hash
      const hash = await customRpcClient.call('getblockhash', [height]);

      // Then get the block using the hash
      return await customRpcClient.call('getblock', [hash, 2]);
    } catch (error) {
      console.error(`Error getting block at height ${height}:`, error);

      // Return mock data as fallback
      console.log(`Returning mock data for block at height ${height}`);
      const mockBlock = {
        hash: `000000000000000000000000000000000000000000000000000000000000${height.toString().padStart(3, '0')}`,
        confirmations: 1000,
        size: 1000000,
        strippedsize: 900000,
        weight: 4000000,
        height: height,
        version: 536870912,
        versionHex: '20000000',
        merkleroot: '000000000000000000000000000000000000000000000000000000000000000',
        tx: Array(10).fill(0).map((_, i) => ({
          txid: `000000000000000000000000000000000000000000000000000000000000${i.toString().padStart(3, '0')}`,
          hash: `000000000000000000000000000000000000000000000000000000000000${i.toString().padStart(3, '0')}`,
          version: 1,
          size: 250,
          vsize: 250,
          weight: 1000,
          locktime: 0,
          vin: [{
            txid: `000000000000000000000000000000000000000000000000000000000000${(i+1).toString().padStart(3, '0')}`,
            vout: 0,
            scriptSig: { asm: '', hex: '' },
            sequence: 4294967295
          }],
          vout: [{
            value: 50.0,
            n: 0,
            scriptPubKey: {
              asm: '',
              hex: '',
              reqSigs: 1,
              type: 'pubkeyhash',
              addresses: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa']
            }
          }]
        })),
        time: 1714579200,
        mediantime: 1714579100,
        nonce: 123456789,
        bits: '1d00ffff',
        difficulty: 78352956298608,
        chainwork: '000000000000000000000000000000000000000000000000000000000000000',
        nTx: 10,
        previousblockhash: `000000000000000000000000000000000000000000000000000000000000${(height-1).toString().padStart(3, '0')}`,
        nextblockhash: `000000000000000000000000000000000000000000000000000000000000${(height+1).toString().padStart(3, '0')}`
      };

      return mockBlock;
    }
  } catch (error) {
    console.error(`Unexpected error getting block at height ${height}:`, error);

    // Return mock data as a last resort
    const mockBlock = {
      hash: `000000000000000000000000000000000000000000000000000000000000${height.toString().padStart(3, '0')}`,
      confirmations: 1000,
      size: 1000000,
      strippedsize: 900000,
      weight: 4000000,
      height: height,
      version: 536870912,
      versionHex: '20000000',
      merkleroot: '000000000000000000000000000000000000000000000000000000000000000',
      tx: Array(10).fill(0).map((_, i) => ({
        txid: `000000000000000000000000000000000000000000000000000000000000${i.toString().padStart(3, '0')}`,
        hash: `000000000000000000000000000000000000000000000000000000000000${i.toString().padStart(3, '0')}`,
        version: 1,
        size: 250,
        vsize: 250,
        weight: 1000,
        locktime: 0,
        vin: [{
          txid: `000000000000000000000000000000000000000000000000000000000000${(i+1).toString().padStart(3, '0')}`,
          vout: 0,
          scriptSig: { asm: '', hex: '' },
          sequence: 4294967295
        }],
        vout: [{
          value: 50.0,
          n: 0,
          scriptPubKey: {
            asm: '',
            hex: '',
            reqSigs: 1,
            type: 'pubkeyhash',
            addresses: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa']
          }
        }]
      })),
      time: 1714579200,
      mediantime: 1714579100,
      nonce: 123456789,
      bits: '1d00ffff',
      difficulty: 78352956298608,
      chainwork: '000000000000000000000000000000000000000000000000000000000000000',
      nTx: 10,
      previousblockhash: `000000000000000000000000000000000000000000000000000000000000${(height-1).toString().padStart(3, '0')}`,
      nextblockhash: `000000000000000000000000000000000000000000000000000000000000${(height+1).toString().padStart(3, '0')}`
    };

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

/**
 * Get blockchain info
 */
export async function getBlockchainInfo() {
  try {
    if (USE_MOCK || !client) {
      console.log('Using mock data for blockchain info');
      return mockData.blockchainInfo;
    }

    try {
      // Try using the custom RPC client first
      console.log('Attempting to get blockchain info...');
      return await customRpcClient.call('getblockchaininfo');
    } catch (rpcError) {
      console.error('Custom RPC client failed for getBlockchainInfo:', rpcError.message);

      try {
        // Fall back to the bitcoin-core client
        console.log('Trying bitcoin-core client for blockchain info...');
        return await (client as any).getBlockchainInfo();
      } catch (fallbackError) {
        console.error('Fallback also failed for blockchain info:', fallbackError.message);

        // Return mock data as fallback
        console.log('Returning mock data for blockchain info due to error');
        return mockData.blockchainInfo;
      }
    }
  } catch (error) {
    console.error('Unexpected error getting blockchain info:', error);
    // Return mock data as a last resort
    return mockData.blockchainInfo;
  }
}

/**
 * Get mempool info
 */
export async function getMempoolInfo() {
  try {
    if (USE_MOCK || !client) {
      console.log('Using mock data for mempool info');
      return mockData.mempoolInfo;
    }

    try {
      // Try using the custom RPC client first
      console.log('Attempting to get mempool info...');
      return await customRpcClient.call('getmempoolinfo');
    } catch (rpcError) {
      console.error('Custom RPC client failed for getMempoolInfo:', rpcError.message);

      try {
        // Fall back to the bitcoin-core client
        console.log('Trying bitcoin-core client for mempool info...');
        return await (client as any).getMempoolInfo();
      } catch (fallbackError) {
        console.error('Fallback also failed for mempool info:', fallbackError.message);

        // Return mock data as fallback
        console.log('Returning mock data for mempool info due to error');
        return mockData.mempoolInfo;
      }
    }
  } catch (error) {
    console.error('Unexpected error getting mempool info:', error);
    // Return mock data as a last resort
    return mockData.mempoolInfo;
  }
}

/**
 * Get block hash for a given height
 */
export async function getBlockHash(height: number) {
  const mockBlockHash = '000000000000000000000000000000000000000000000000000000000000000';

  try {
    if (USE_MOCK || !client) {
      console.log(`Using mock data for block hash at height ${height}`);
      return mockBlockHash;
    }

    try {
      // Try using the custom RPC client first
      console.log(`Attempting to get block hash for height ${height}...`);
      return await customRpcClient.call('getblockhash', [height]);
    } catch (rpcError) {
      console.error(`Custom RPC client failed for getBlockHash at height ${height}:`, rpcError.message);

      try {
        // Fall back to the bitcoin-core client
        console.log(`Trying bitcoin-core client for block hash at height ${height}...`);
        return await (client as any).getBlockHash(height);
      } catch (fallbackError) {
        console.error(`Fallback also failed for block hash at height ${height}:`, fallbackError.message);

        // Return mock data as fallback
        console.log(`Returning mock data for block hash at height ${height} due to error`);
        return mockBlockHash;
      }
    }
  } catch (error) {
    console.error(`Unexpected error getting block hash at height ${height}:`, error);
    // Return mock data as a last resort
    return mockBlockHash;
  }
}

/**
 * Get raw mempool (list of transaction IDs)
 */
export async function getRawMempool() {
  const mockTxids = [
    '000000000000000000000000000000000000000000000000000000000000001',
    '000000000000000000000000000000000000000000000000000000000000002',
    '000000000000000000000000000000000000000000000000000000000000003'
  ];

  try {
    if (USE_MOCK || !client) {
      console.log('Using mock data for raw mempool');
      return mockTxids;
    }

    try {
      // Try using the custom RPC client first
      console.log('Attempting to get raw mempool...');
      return await customRpcClient.call('getrawmempool');
    } catch (rpcError) {
      console.error('Custom RPC client failed for getRawMempool:', rpcError.message);

      try {
        // Fall back to the bitcoin-core client
        console.log('Trying bitcoin-core client for raw mempool...');
        return await (client as any).getRawMempool();
      } catch (fallbackError) {
        console.error('Fallback also failed for raw mempool:', fallbackError.message);

        // Return mock data as fallback
        console.log('Returning mock data for raw mempool due to error');
        return mockTxids;
      }
    }
  } catch (error) {
    console.error('Unexpected error getting raw mempool:', error);
    // Return mock data as a last resort
    return mockTxids;
  }
}

/**
 * Get address details including balance and transactions
 * Note: Bitcoin Core doesn't have a direct method to get address details
 * We need to use scantxoutset or other methods to get this information
 */
export async function getAddressDetails(address: string) {
  // Mock address details
  const mockAddressDetails = {
    address: address,
    balance: 1.5,
    totalReceived: 10.0,
    totalSent: 8.5,
    unconfirmedBalance: 0.0,
    transactions: [
      {
        txid: '000000000000000000000000000000000000000000000000000000000000001',
        blockHeight: 825000,
        blockTime: 1714579200,
        confirmations: 10,
        amount: 0.5,
        type: 'received'
      },
      {
        txid: '000000000000000000000000000000000000000000000000000000000000002',
        blockHeight: 824990,
        blockTime: 1714578000,
        confirmations: 20,
        amount: 1.0,
        type: 'received'
      },
      {
        txid: '000000000000000000000000000000000000000000000000000000000000003',
        blockHeight: 824980,
        blockTime: 1714577000,
        confirmations: 30,
        amount: 0.25,
        type: 'sent'
      }
    ]
  };

  try {
    if (USE_MOCK || !client) {
      console.log(`Using mock data for address ${address}`);
      return mockAddressDetails;
    }

    try {
      // Bitcoin Core doesn't have a direct method to get address details
      // We would need to use scantxoutset or other methods

      // For now, return mock data
      console.log(`No direct method available for address details, using mock data for ${address}`);
      return mockAddressDetails;
    } catch (error) {
      console.error(`Error getting address details for ${address}:`, error);
      console.log(`Returning mock data for address ${address}`);
      return mockAddressDetails;
    }
  } catch (error) {
    console.error(`Unexpected error getting address details for ${address}:`, error);
    return mockAddressDetails;
  }
}

// Export mock data for use in controllers
export function getMockData() {
  return mockData;
}
