import { Request, Response } from 'express';
import * as blockExplorerService from '../services/blockExplorer.service';

/**
 * Get latest blocks with pagination
 */
export async function getLatestBlocks(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const useCache = req.query.useCache !== 'false'; // Default to using cache unless explicitly set to false

    const result = await blockExplorerService.getLatestBlocks(page, limit, useCache);
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in getLatestBlocks controller:', error);
    
    return res.status(500).json({
      message: `Error fetching latest blocks: ${error.message}`
    });
  }
}

/**
 * Get block details by hash or height
 */
export async function getBlockDetails(req: Request, res: Response) {
  try {
    const { hashOrHeight } = req.params;
    const useCache = req.query.useCache !== 'false'; // Default to using cache unless explicitly set to false
    
    if (!hashOrHeight) {
      return res.status(400).json({ message: 'Block hash or height is required' });
    }
    
    const result = await blockExplorerService.getBlockDetails(hashOrHeight, useCache);
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in getBlockDetails controller:', error);
    
    return res.status(500).json({
      message: `Error fetching block details: ${error.message}`
    });
  }
}

/**
 * Get transaction details
 */
export async function getTransactionDetails(req: Request, res: Response) {
  try {
    const { txid } = req.params;
    const useCache = req.query.useCache !== 'false'; // Default to using cache unless explicitly set to false
    
    if (!txid) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }
    
    const result = await blockExplorerService.getTransactionDetails(txid, useCache);
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in getTransactionDetails controller:', error);
    
    return res.status(500).json({
      message: `Error fetching transaction details: ${error.message}`
    });
  }
}

/**
 * Get address details
 */
export async function getAddressDetails(req: Request, res: Response) {
  try {
    const { address } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const useCache = req.query.useCache !== 'false'; // Default to using cache unless explicitly set to false
    
    if (!address) {
      return res.status(400).json({ message: 'Bitcoin address is required' });
    }
    
    const result = await blockExplorerService.getAddressDetails(address, page, limit, useCache);
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in getAddressDetails controller:', error);
    
    return res.status(500).json({
      message: `Error fetching address details: ${error.message}`
    });
  }
}

/**
 * Get mempool transactions
 */
export async function getMempoolTransactions(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const useCache = req.query.useCache !== 'false'; // Default to using cache unless explicitly set to false
    
    const result = await blockExplorerService.getMempoolTransactions(page, limit, useCache);
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in getMempoolTransactions controller:', error);
    
    return res.status(500).json({
      message: `Error fetching mempool transactions: ${error.message}`
    });
  }
}

/**
 * Clear cache
 */
export async function clearCache(req: Request, res: Response) {
  try {
    const { type, id } = req.body;
    
    const result = blockExplorerService.clearCache(type, id);
    
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in clearCache controller:', error);
    
    return res.status(500).json({
      message: `Error clearing cache: ${error.message}`
    });
  }
}
