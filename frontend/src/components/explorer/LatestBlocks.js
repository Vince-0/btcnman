'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Pagination from '../common/Pagination';

const LatestBlocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const router = useRouter();

  const limit = 10; // Number of blocks per page

  const fetchLatestBlocks = async (useCache = true) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/explorer/blocks?page=${page}&limit=${limit}&useCache=${useCache}`);

      setBlocks(response.data.blocks);
      setLastUpdated(new Date(response.data.lastUpdated));

      // Calculate total pages
      const total = response.data.total;
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      console.error('Error fetching latest blocks:', err);
      setError(err.message || 'Failed to fetch latest blocks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch blocks when page changes
  useEffect(() => {
    fetchLatestBlocks();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    fetchLatestBlocks(false); // Skip cache
  };

  const handleBlockClick = (hash) => {
    router.push(`/explorer/block/${hash}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Latest Blocks</h2>
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
                Height
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hash
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transactions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : blocks.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  No blocks found
                </td>
              </tr>
            ) : (
              blocks.map((block) => (
                <tr
                  key={block.hash}
                  onClick={() => handleBlockClick(block.hash)}
                  className="hover:bg-gray-100 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {block.height}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {block.hash}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(block.time * 1000).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {block.nTx || (block.tx && block.tx.length) || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(block.size / 1024).toFixed(2)} KB
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

export default LatestBlocks;
