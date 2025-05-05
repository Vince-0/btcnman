'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Pagination from '../common/Pagination';

const AddressDetails = ({ address }) => {
  const [addressData, setAddressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const router = useRouter();

  const limit = 10; // Number of transactions per page

  const fetchAddressDetails = async (useCache = true) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/explorer/address/${address}?page=${page}&limit=${limit}&useCache=${useCache}`);

      setAddressData(response.data.address);
      setLastUpdated(new Date(response.data.lastUpdated));

      // Calculate total pages
      const total = response.data.total;
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      console.error('Error fetching address details:', err);
      setError(err.message || 'Failed to fetch address details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch address details when address or page changes
  useEffect(() => {
    if (address) {
      fetchAddressDetails();
    }
  }, [address, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    fetchAddressDetails(false); // Skip cache
  };

  const handleTransactionClick = (txid) => {
    router.push(`/explorer/tx/${txid}`);
  };

  // Format BTC amount
  const formatBTC = (amount) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 });
  };

  if (loading && !addressData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading address details...</div>
        </div>
      </div>
    );
  }

  if (error && !addressData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!addressData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Address not found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Address Details</h2>
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
          <h3 className="text-sm font-medium text-gray-500">Address</h3>
          <p className="text-sm text-gray-900 break-all">{addressData.address}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Balance</h3>
          <p className="text-sm text-gray-900">{formatBTC(addressData.balance)} BTC</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Total Received</h3>
          <p className="text-sm text-gray-900">{formatBTC(addressData.totalReceived)} BTC</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Total Sent</h3>
          <p className="text-sm text-gray-900">{formatBTC(addressData.totalSent)} BTC</p>
        </div>

        {addressData.unconfirmedBalance > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Unconfirmed Balance</h3>
            <p className="text-sm text-gray-900">{formatBTC(addressData.unconfirmedBalance)} BTC</p>
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
                Block Height
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
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
            ) : addressData.transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  No transactions found
                </td>
              </tr>
            ) : (
              addressData.transactions.map((tx) => (
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
                      {tx.blockHeight}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(tx.blockTime * 1000).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${tx.type === 'received' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'received' ? '+' : '-'}{formatBTC(tx.amount)} BTC
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {tx.type}
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

export default AddressDetails;
