import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as bitcoinController from '../controllers/bitcoin.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate as any);

// Node info
router.get('/info', bitcoinController.getNodeInfo as any);

// Peer management
router.get('/peers', bitcoinController.getPeers as any);
router.get('/peers/banned', bitcoinController.getBannedPeers as any);
router.post('/peers/ban', bitcoinController.banPeer as any);
router.post('/peers/unban', bitcoinController.unbanPeer as any);
router.post('/peers/disconnect', bitcoinController.disconnectPeer as any);

// Block explorer
router.get('/block/:hash', bitcoinController.getBlock as any);
router.get('/block/height/:height', bitcoinController.getBlockByHeight as any);
router.get('/tx/:txid', bitcoinController.getTransaction as any);

// Wallet
router.get('/wallet', bitcoinController.getWalletInfo as any);

export default router;
