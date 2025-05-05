import { Request, Response } from 'express';
import * as bitcoinService from '../services/bitcoin.service';

export async function getNodeInfo(req: Request, res: Response) {
  try {
    // Check if geolocation data is requested
    const includeGeo = req.query.geo === 'true';

    // Check if we should use cache (default to true unless explicitly set to false)
    const useCache = req.query.useCache !== 'false';

    const nodeInfo = await bitcoinService.getNodeInfo(includeGeo, useCache);

    // Check if we're returning mock data
    const isMockData = process.env.USE_MOCK === 'true' ||
                      (nodeInfo.networkInfo === bitcoinService.getMockData().networkInfo);

    // Add a flag to indicate if this is mock data
    return res.status(200).json({
      ...nodeInfo,
      _isMockData: isMockData
    });
  } catch (error: any) {
    console.error('Error in getNodeInfo controller:', error);

    // Provide more specific error message
    const errorMessage = error.message || 'Internal server error';
    const isTimeout = errorMessage.includes('timeout') ||
                     (error.code && error.code === 'ECONNABORTED');

    return res.status(500).json({
      message: isTimeout
        ? 'Connection to Bitcoin node timed out. The node might be busy or unreachable.'
        : `Error connecting to Bitcoin node: ${errorMessage}`
    });
  }
}

export async function getPeers(req: Request, res: Response) {
  try {
    // Extract query parameters for filtering and sorting
    const filters: any = {};
    const sort: any = {};

    // Connection type filter (inbound/outbound)
    if (req.query.connectionType) {
      filters.connectionType = req.query.connectionType === 'inbound' ? true : false;
    }

    // Version filter
    if (req.query.version) {
      filters.version = req.query.version;
    }

    // Services filter
    if (req.query.services) {
      filters.services = req.query.services;
    }

    // Country filter (requires geolocation)
    if (req.query.country) {
      filters.country = req.query.country;
    }

    // Sorting
    if (req.query.sortBy) {
      const sortField = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
      sort[sortField] = sortOrder;
    }

    // Include geolocation data
    const includeGeo = req.query.geo === 'true';

    // Check if we should use cache (default to true unless explicitly set to false)
    const useCache = req.query.useCache !== 'false';

    const peers = await bitcoinService.getPeers(filters, sort, includeGeo, useCache);

    // Check if we're returning mock data
    const isMockData = process.env.USE_MOCK === 'true' ||
                      (peers.data === bitcoinService.getMockData().peerInfo);

    // Add a flag to indicate if this is mock data
    return res.status(200).json({
      peers: peers.data,
      total: peers.total,
      filtered: peers.filtered,
      _isMockData: isMockData,
      lastUpdated: peers.lastUpdated
    });
  } catch (error: any) {
    console.error('Error in getPeers controller:', error);

    // Provide more specific error message
    const errorMessage = error.message || 'Internal server error';
    const isTimeout = errorMessage.includes('timeout') ||
                     (error.code && error.code === 'ECONNABORTED');

    return res.status(500).json({
      message: isTimeout
        ? 'Connection to Bitcoin node timed out. The node might be busy or unreachable.'
        : `Error connecting to Bitcoin node: ${errorMessage}`
    });
  }
}

export async function getBannedPeers(req: Request, res: Response) {
  try {
    const bannedPeers = await bitcoinService.getBannedPeers();

    // Check if we're returning mock data
    const isMockData = process.env.USE_MOCK === 'true' ||
                      (bannedPeers.length === 2 &&
                       bannedPeers[0].address === '192.168.1.200' &&
                       bannedPeers[1].address === '192.168.1.201');

    // Add a flag to indicate if this is mock data
    return res.status(200).json({
      bannedPeers: bannedPeers,
      _isMockData: isMockData
    });
  } catch (error: any) {
    console.error('Error in getBannedPeers controller:', error);

    // Provide more specific error message
    const errorMessage = error.message || 'Internal server error';
    const isTimeout = errorMessage.includes('timeout') ||
                     (error.code && error.code === 'ECONNABORTED');

    return res.status(500).json({
      message: isTimeout
        ? 'Connection to Bitcoin node timed out. The node might be busy or unreachable.'
        : `Error connecting to Bitcoin node: ${errorMessage}`
    });
  }
}

export async function banPeer(req: Request, res: Response) {
  try {
    const { ip, banTime } = req.body;

    if (!ip) {
      return res.status(400).json({ message: 'IP address is required', success: false });
    }

    const result = await bitcoinService.banPeer(ip, banTime);

    // Return the result from the service
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    console.error('Error in banPeer controller:', error);

    // Provide more specific error message
    const errorMessage = error.message || 'Internal server error';
    const isTimeout = errorMessage.includes('timeout') ||
                     (error.code && error.code === 'ECONNABORTED');

    return res.status(500).json({
      success: false,
      message: isTimeout
        ? 'Connection to Bitcoin node timed out. The node might be busy or unreachable.'
        : `Error connecting to Bitcoin node: ${errorMessage}`
    });
  }
}

export async function unbanPeer(req: Request, res: Response) {
  try {
    const { ip } = req.body;

    if (!ip) {
      return res.status(400).json({ message: 'IP address is required', success: false });
    }

    const result = await bitcoinService.unbanPeer(ip);

    // Return the result from the service
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    console.error('Error in unbanPeer controller:', error);

    // Provide more specific error message
    const errorMessage = error.message || 'Internal server error';
    const isTimeout = errorMessage.includes('timeout') ||
                     (error.code && error.code === 'ECONNABORTED');

    return res.status(500).json({
      success: false,
      message: isTimeout
        ? 'Connection to Bitcoin node timed out. The node might be busy or unreachable.'
        : `Error connecting to Bitcoin node: ${errorMessage}`
    });
  }
}

export async function disconnectPeer(req: Request, res: Response) {
  try {
    const { nodeId } = req.body;

    if (!nodeId) {
      return res.status(400).json({ message: 'Node ID is required', success: false });
    }

    const result = await bitcoinService.disconnectPeer(nodeId);

    // Return the result from the service
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    console.error('Error in disconnectPeer controller:', error);

    // Provide more specific error message
    const errorMessage = error.message || 'Internal server error';
    const isTimeout = errorMessage.includes('timeout') ||
                     (error.code && error.code === 'ECONNABORTED');

    return res.status(500).json({
      success: false,
      message: isTimeout
        ? 'Connection to Bitcoin node timed out. The node might be busy or unreachable.'
        : `Error connecting to Bitcoin node: ${errorMessage}`
    });
  }
}

export async function getBlock(req: Request, res: Response) {
  try {
    const { hash } = req.params;

    if (!hash) {
      return res.status(400).json({ message: 'Block hash is required' });
    }

    const block = await bitcoinService.getBlock(hash);
    return res.status(200).json(block);
  } catch (error) {
    console.error('Error in getBlock controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getBlockByHeight(req: Request, res: Response) {
  try {
    const height = parseInt(req.params.height);

    if (isNaN(height)) {
      return res.status(400).json({ message: 'Valid block height is required' });
    }

    const block = await bitcoinService.getBlockByHeight(height);
    return res.status(200).json(block);
  } catch (error) {
    console.error('Error in getBlockByHeight controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getTransaction(req: Request, res: Response) {
  try {
    const { txid } = req.params;

    if (!txid) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const transaction = await bitcoinService.getTransaction(txid);
    return res.status(200).json(transaction);
  } catch (error) {
    console.error('Error in getTransaction controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getWalletInfo(req: Request, res: Response) {
  try {
    const walletInfo = await bitcoinService.getWalletInfo();
    return res.status(200).json(walletInfo);
  } catch (error) {
    console.error('Error in getWalletInfo controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
