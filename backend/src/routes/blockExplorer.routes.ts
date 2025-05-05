import express from 'express';
import * as blockExplorerController from '../controllers/blockExplorer.controller';

const router = express.Router();

// Block explorer routes
router.get('/blocks', blockExplorerController.getLatestBlocks as any);
router.get('/block/:hashOrHeight', blockExplorerController.getBlockDetails as any);
router.get('/tx/:txid', blockExplorerController.getTransactionDetails as any);
router.get('/address/:address', blockExplorerController.getAddressDetails as any);
router.get('/mempool', blockExplorerController.getMempoolTransactions as any);
router.post('/cache/clear', blockExplorerController.clearCache as any);

export default router;
