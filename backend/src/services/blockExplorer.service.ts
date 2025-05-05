import * as bitcoinService from './bitcoin.service';

// Cache structure
interface BlockExplorerCache {
  latestBlocks: {
    data: any[];
    timestamp: number;
  };
  blockDetails: {
    [hash: string]: {
      data: any;
      timestamp: number;
    };
  };
  transactions: {
    [txid: string]: {
      data: any;
      timestamp: number;
    };
  };
  addresses: {
    [address: string]: {
      data: any;
      timestamp: number;
    };
  };
  mempool: {
    data: any[];
    timestamp: number;
  };
}

// Initialize cache
const cache: BlockExplorerCache = {
  latestBlocks: {
    data: [],
    timestamp: 0
  },
  blockDetails: {},
  transactions: {},
  addresses: {},
  mempool: {
    data: [],
    timestamp: 0
  }
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Check if cache is valid
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_EXPIRATION;
}

/**
 * Get latest blocks with pagination
 */
export async function getLatestBlocks(page: number = 1, limit: number = 10, useCache: boolean = true) {
  try {
    // Check if cache is valid and we want to use it
    if (useCache && isCacheValid(cache.latestBlocks.timestamp) && cache.latestBlocks.data.length > 0) {
      console.log('Using cached latest blocks data');
      
      // Apply pagination to cached data
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = cache.latestBlocks.data.slice(start, end);
      
      return {
        blocks: paginatedData,
        total: cache.latestBlocks.data.length,
        page,
        limit,
        lastUpdated: new Date(cache.latestBlocks.timestamp)
      };
    }

    // Get current blockchain info to determine the latest block height
    const blockchainInfo = await bitcoinService.getBlockchainInfo();
    const currentHeight = blockchainInfo.blocks;
    
    // Calculate how many blocks to fetch based on page and limit
    const blocksToFetch = [];
    const startHeight = currentHeight - ((page - 1) * limit);
    const endHeight = Math.max(startHeight - limit + 1, 0);
    
    for (let height = startHeight; height >= endHeight; height--) {
      blocksToFetch.push(height);
    }
    
    // Fetch block details for each height
    const blockPromises = blocksToFetch.map(height => 
      bitcoinService.getBlockByHeight(height)
    );
    
    const blocks = await Promise.all(blockPromises);
    
    // Update cache with all known blocks (not just the current page)
    if (page === 1) {
      cache.latestBlocks.data = blocks;
      cache.latestBlocks.timestamp = Date.now();
    } else if (cache.latestBlocks.data.length === 0) {
      // If this is not the first page but cache is empty, 
      // we need to fetch the first page to populate the cache properly
      const firstPageBlocks = await getLatestBlocks(1, (page * limit), false);
      cache.latestBlocks.data = firstPageBlocks.blocks;
      cache.latestBlocks.timestamp = Date.now();
    }
    
    return {
      blocks,
      total: currentHeight + 1, // +1 because block heights start at 0
      page,
      limit,
      lastUpdated: new Date(cache.latestBlocks.timestamp)
    };
  } catch (error) {
    console.error('Error getting latest blocks:', error);
    throw error;
  }
}

/**
 * Get block details by hash or height
 */
export async function getBlockDetails(hashOrHeight: string | number, useCache: boolean = true) {
  try {
    let blockHash: string;
    
    // Convert height to hash if needed
    if (typeof hashOrHeight === 'number' || !isNaN(Number(hashOrHeight))) {
      const height = typeof hashOrHeight === 'number' ? hashOrHeight : parseInt(hashOrHeight as string);
      const blockHashResult = await bitcoinService.getBlockHash(height);
      blockHash = blockHashResult;
    } else {
      blockHash = hashOrHeight as string;
    }
    
    // Check if cache is valid and we want to use it
    if (useCache && 
        cache.blockDetails[blockHash] && 
        isCacheValid(cache.blockDetails[blockHash].timestamp)) {
      console.log(`Using cached block data for ${blockHash}`);
      return {
        block: cache.blockDetails[blockHash].data,
        lastUpdated: new Date(cache.blockDetails[blockHash].timestamp)
      };
    }
    
    // Fetch block details
    const block = await bitcoinService.getBlock(blockHash);
    
    // Update cache
    cache.blockDetails[blockHash] = {
      data: block,
      timestamp: Date.now()
    };
    
    return {
      block,
      lastUpdated: new Date(cache.blockDetails[blockHash].timestamp)
    };
  } catch (error) {
    console.error('Error getting block details:', error);
    throw error;
  }
}

/**
 * Get transaction details
 */
export async function getTransactionDetails(txid: string, useCache: boolean = true) {
  try {
    // Check if cache is valid and we want to use it
    if (useCache && 
        cache.transactions[txid] && 
        isCacheValid(cache.transactions[txid].timestamp)) {
      console.log(`Using cached transaction data for ${txid}`);
      return {
        transaction: cache.transactions[txid].data,
        lastUpdated: new Date(cache.transactions[txid].timestamp)
      };
    }
    
    // Fetch transaction details
    const transaction = await bitcoinService.getTransaction(txid);
    
    // Update cache
    cache.transactions[txid] = {
      data: transaction,
      timestamp: Date.now()
    };
    
    return {
      transaction,
      lastUpdated: new Date(cache.transactions[txid].timestamp)
    };
  } catch (error) {
    console.error('Error getting transaction details:', error);
    throw error;
  }
}

/**
 * Get address details including balance and transactions
 */
export async function getAddressDetails(address: string, page: number = 1, limit: number = 10, useCache: boolean = true) {
  try {
    // Check if cache is valid and we want to use it
    if (useCache && 
        cache.addresses[address] && 
        isCacheValid(cache.addresses[address].timestamp)) {
      console.log(`Using cached address data for ${address}`);
      
      const addressData = cache.addresses[address].data;
      
      // Apply pagination to transactions
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedTxs = addressData.transactions.slice(start, end);
      
      return {
        address: {
          ...addressData,
          transactions: paginatedTxs
        },
        total: addressData.transactions.length,
        page,
        limit,
        lastUpdated: new Date(cache.addresses[address].timestamp)
      };
    }
    
    // Fetch address details
    // Note: Bitcoin Core doesn't have a direct method to get address details
    // We need to use scantxoutset or other methods to get this information
    const addressDetails = await bitcoinService.getAddressDetails(address);
    
    // Update cache
    cache.addresses[address] = {
      data: addressDetails,
      timestamp: Date.now()
    };
    
    // Apply pagination to transactions
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTxs = addressDetails.transactions.slice(start, end);
    
    return {
      address: {
        ...addressDetails,
        transactions: paginatedTxs
      },
      total: addressDetails.transactions.length,
      page,
      limit,
      lastUpdated: new Date(cache.addresses[address].timestamp)
    };
  } catch (error) {
    console.error('Error getting address details:', error);
    throw error;
  }
}

/**
 * Get mempool transactions with pagination
 */
export async function getMempoolTransactions(page: number = 1, limit: number = 10, useCache: boolean = true) {
  try {
    // Check if cache is valid and we want to use it
    if (useCache && 
        isCacheValid(cache.mempool.timestamp) && 
        cache.mempool.data.length > 0) {
      console.log('Using cached mempool data');
      
      // Apply pagination to cached data
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = cache.mempool.data.slice(start, end);
      
      return {
        transactions: paginatedData,
        total: cache.mempool.data.length,
        page,
        limit,
        lastUpdated: new Date(cache.mempool.timestamp)
      };
    }
    
    // Fetch mempool transactions
    const mempoolInfo = await bitcoinService.getMempoolInfo();
    const txids = await bitcoinService.getRawMempool();
    
    // Limit the number of transactions we fetch details for to avoid overloading the node
    const txidsToFetch = txids.slice(0, Math.min(100, txids.length));
    
    // Fetch transaction details for each txid
    const txPromises = txidsToFetch.map(txid => 
      bitcoinService.getTransaction(txid)
    );
    
    const transactions = await Promise.all(txPromises);
    
    // Update cache
    cache.mempool.data = transactions;
    cache.mempool.timestamp = Date.now();
    
    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = transactions.slice(start, end);
    
    return {
      transactions: paginatedData,
      total: txids.length, // Total count of all mempool txs
      fetchedCount: transactions.length, // Count of txs we actually fetched details for
      page,
      limit,
      lastUpdated: new Date(cache.mempool.timestamp)
    };
  } catch (error) {
    console.error('Error getting mempool transactions:', error);
    throw error;
  }
}

/**
 * Clear all cache or specific cache entries
 */
export function clearCache(type?: 'latestBlocks' | 'blockDetails' | 'transactions' | 'addresses' | 'mempool', id?: string) {
  if (!type) {
    // Clear all cache
    cache.latestBlocks = { data: [], timestamp: 0 };
    cache.blockDetails = {};
    cache.transactions = {};
    cache.addresses = {};
    cache.mempool = { data: [], timestamp: 0 };
    return { message: 'All cache cleared' };
  }
  
  switch (type) {
    case 'latestBlocks':
      cache.latestBlocks = { data: [], timestamp: 0 };
      return { message: 'Latest blocks cache cleared' };
    
    case 'blockDetails':
      if (id) {
        delete cache.blockDetails[id];
        return { message: `Block cache cleared for ${id}` };
      }
      cache.blockDetails = {};
      return { message: 'All block details cache cleared' };
    
    case 'transactions':
      if (id) {
        delete cache.transactions[id];
        return { message: `Transaction cache cleared for ${id}` };
      }
      cache.transactions = {};
      return { message: 'All transactions cache cleared' };
    
    case 'addresses':
      if (id) {
        delete cache.addresses[id];
        return { message: `Address cache cleared for ${id}` };
      }
      cache.addresses = {};
      return { message: 'All addresses cache cleared' };
    
    case 'mempool':
      cache.mempool = { data: [], timestamp: 0 };
      return { message: 'Mempool cache cleared' };
    
    default:
      return { message: 'No cache cleared' };
  }
}
