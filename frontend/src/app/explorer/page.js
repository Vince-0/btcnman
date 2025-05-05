'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LatestBlocks from '../../components/explorer/LatestBlocks';
import MempoolTransactions from '../../components/explorer/MempoolTransactions';

export default function ExplorerPage() {
  const [blockHeight, setBlockHeight] = useState('');
  const [blockHash, setBlockHash] = useState('');
  const [txid, setTxid] = useState('');
  const [address, setAddress] = useState('');
  const router = useRouter();

  const handleBlockHeightSearch = () => {
    if (blockHeight) {
      router.push(`/explorer/block/${blockHeight}`);
    }
  };

  const handleBlockHashSearch = () => {
    if (blockHash) {
      router.push(`/explorer/block/${blockHash}`);
    }
  };

  const handleTransactionSearch = () => {
    if (txid) {
      router.push(`/explorer/tx/${txid}`);
    }
  };

  const handleAddressSearch = () => {
    if (address) {
      router.push(`/explorer/address/${address}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Block Explorer</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Search by Block Height</h2>
            <div className="flex">
              <input
                type="number"
                value={blockHeight}
                onChange={(e) => setBlockHeight(e.target.value)}
                placeholder="Block height"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleBlockHeightSearch}
                disabled={!blockHeight}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Search by Block Hash</h2>
            <div className="flex">
              <input
                type="text"
                value={blockHash}
                onChange={(e) => setBlockHash(e.target.value)}
                placeholder="Block hash"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleBlockHashSearch}
                disabled={!blockHash}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Search by Transaction ID</h2>
            <div className="flex">
              <input
                type="text"
                value={txid}
                onChange={(e) => setTxid(e.target.value)}
                placeholder="Transaction ID"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleTransactionSearch}
                disabled={!txid}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Search by Address</h2>
            <div className="flex">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Bitcoin address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleAddressSearch}
                disabled={!address}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <LatestBlocks />

      <MempoolTransactions />
    </div>
  );
}
