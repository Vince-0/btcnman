'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Pagination from '../common/Pagination';

const MempoolTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const router = useRouter();

  const limit = 10; // Number of transactions per page

  const fetchMempoolTransactions = async (useCache = true) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/explorer/mempool?page=${page}&limit=${limit}&useCache=${useCache}`);

      setTransactions(response.data.transactions);
      setLastUpdated(new Date(response.data.lastUpdated));

      // Calculate total pages
      const total = response.data.total;
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      console.error('Error fetching mempool transactions:', err);
      setError(err.message || 'Failed to fetch mempool transactions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions when page changes
  useEffect(() => {
    fetchMempoolTransactions();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    fetchMempoolTransactions(false); // Skip cache
  };

  const handleTransactionClick = (txid) => {
    router.push(`/explorer/tx/${txid}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Mempool Transactions</h2>
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
                Fee
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
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
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
                      {tx.fee ? `${tx.fee} BTC` : 'N/A'}
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

export default MempoolTransactions;
