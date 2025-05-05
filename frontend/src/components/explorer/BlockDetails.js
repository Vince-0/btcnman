'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Pagination from '../common/Pagination';

const BlockDetails = ({ blockHash }) => {
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [displayedTransactions, setDisplayedTransactions] = useState([]);
  const router = useRouter();

  const limit = 10; // Number of transactions per page

  const fetchBlockDetails = async (useCache = true) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/explorer/block/${blockHash}?useCache=${useCache}`);

      setBlock(response.data.block);
      setLastUpdated(new Date(response.data.lastUpdated));

      // Calculate total pages for transactions
      const txCount = response.data.block.tx.length;
      setTotalPages(Math.ceil(txCount / limit));

      // Set displayed transactions based on current page
      updateDisplayedTransactions(response.data.block.tx);
    } catch (err) {
      console.error('Error fetching block details:', err);
      setError(err.message || 'Failed to fetch block details');
    } finally {
      setLoading(false);
    }
  };

  // Update displayed transactions when page or block changes
  const updateDisplayedTransactions = (transactions) => {
    if (!transactions) return;

    const start = (page - 1) * limit;
    const end = start + limit;
    setDisplayedTransactions(transactions.slice(start, end));
  };

  // Fetch block details on initial load
  useEffect(() => {
    if (blockHash) {
      fetchBlockDetails();
    }
  }, [blockHash]);

  // Update displayed transactions when page changes
  useEffect(() => {
    if (block && block.tx) {
      updateDisplayedTransactions(block.tx);
    }
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    fetchBlockDetails(false); // Skip cache
  };

  const handleTransactionClick = (txid) => {
    router.push(`/explorer/tx/${txid}`);
  };

  if (loading && !block) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading block details...</div>
        </div>
      </div>
    );
  }

  if (error && !block) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!block) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Block not found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Block Details</h2>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Hash</h3>
          <p className="text-sm text-gray-900 break-all">{block.hash}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Height</h3>
          <p className="text-sm text-gray-900">{block.height}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Confirmations</h3>
          <p className="text-sm text-gray-900">{block.confirmations}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Timestamp</h3>
          <p className="text-sm text-gray-900">{new Date(block.time * 1000).toLocaleString()}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Size</h3>
          <p className="text-sm text-gray-900">{block.size.toLocaleString()} bytes ({(block.size / 1024).toFixed(2)} KB)</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Weight</h3>
          <p className="text-sm text-gray-900">{block.weight.toLocaleString()} WU</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Version</h3>
          <p className="text-sm text-gray-900">{block.version} (0x{block.versionHex})</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Merkle Root</h3>
          <p className="text-sm text-gray-900 break-all">{block.merkleroot}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Difficulty</h3>
          <p className="text-sm text-gray-900">{block.difficulty.toLocaleString()}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Bits</h3>
          <p className="text-sm text-gray-900">{block.bits}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Nonce</h3>
          <p className="text-sm text-gray-900">{block.nonce}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Transaction Count</h3>
          <p className="text-sm text-gray-900">{block.nTx || block.tx.length}</p>
        </div>

        {block.previousblockhash && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Previous Block</h3>
            <p className="text-sm text-gray-900 break-all">
              <a
                href={`/explorer/block/${block.previousblockhash}`}
                className="text-indigo-600 hover:text-indigo-800"
              >
                {block.previousblockhash}
              </a>
            </p>
          </div>
        )}

        {block.nextblockhash && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Next Block</h3>
            <p className="text-sm text-gray-900 break-all">
              <a
                href={`/explorer/block/${block.nextblockhash}`}
                className="text-indigo-600 hover:text-indigo-800"
              >
                {block.nextblockhash}
              </a>
            </p>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-3">Transactions</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Virtual Size
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : displayedTransactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  No transactions found
                </td>
              </tr>
            ) : (
              displayedTransactions.map((tx) => (
                <tr
                  key={tx.txid}
                  onClick={() => handleTransactionClick(tx.txid)}
                  className="hover:bg-gray-100 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {tx.txid}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {tx.size} bytes
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {tx.weight}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {tx.vsize}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default BlockDetails;
