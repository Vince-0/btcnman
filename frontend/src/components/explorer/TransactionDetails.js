'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

const TransactionDetails = ({ txid }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const router = useRouter();

  const fetchTransactionDetails = async (useCache = true) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/explorer/tx/${txid}?useCache=${useCache}`);

      setTransaction(response.data.transaction);
      setLastUpdated(new Date(response.data.lastUpdated));
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      setError(err.message || 'Failed to fetch transaction details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction details on initial load
  useEffect(() => {
    if (txid) {
      fetchTransactionDetails();
    }
  }, [txid]);

  const handleRefresh = () => {
    fetchTransactionDetails(false); // Skip cache
  };

  const handleBlockClick = (blockhash) => {
    router.push(`/explorer/block/${blockhash}`);
  };

  const handleAddressClick = (address) => {
    router.push(`/explorer/address/${address}`);
  };

  // Format BTC amount
  const formatBTC = (amount) => {
    return amount ? amount.toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 }) : '0.00000000';
  };

  if (loading && !transaction) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-40">
          <div className="text-lg">Loading transaction details...</div>
        </div>
      </div>
    );
  }

  if (error && !transaction) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Transaction not found
        </div>
      </div>
    );
  }

  // Calculate total input and output values
  const totalInput = transaction.vin.reduce((sum, input) => {
    return sum + (input.value || 0);
  }, 0);

  const totalOutput = transaction.vout.reduce((sum, output) => {
    return sum + (output.value || 0);
  }, 0);

  // Calculate fee
  const fee = totalInput - totalOutput;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transaction Details</h2>
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
          <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
          <p className="text-sm text-gray-900 break-all">{transaction.txid}</p>
        </div>

        {transaction.hash !== transaction.txid && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Hash</h3>
            <p className="text-sm text-gray-900 break-all">{transaction.hash}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500">Size</h3>
          <p className="text-sm text-gray-900">{transaction.size} bytes</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Virtual Size</h3>
          <p className="text-sm text-gray-900">{transaction.vsize} vB</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Weight</h3>
          <p className="text-sm text-gray-900">{transaction.weight} WU</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Version</h3>
          <p className="text-sm text-gray-900">{transaction.version}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Lock Time</h3>
          <p className="text-sm text-gray-900">{transaction.locktime}</p>
        </div>

        {transaction.blockhash && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Block</h3>
            <p className="text-sm text-gray-900 break-all">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); handleBlockClick(transaction.blockhash); }}
                className="text-indigo-600 hover:text-indigo-800"
              >
                {transaction.blockhash}
              </a>
            </p>
          </div>
        )}

        {transaction.confirmations !== undefined && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Confirmations</h3>
            <p className="text-sm text-gray-900">{transaction.confirmations}</p>
          </div>
        )}

        {transaction.time && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Timestamp</h3>
            <p className="text-sm text-gray-900">{new Date(transaction.time * 1000).toLocaleString()}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500">Fee</h3>
          <p className="text-sm text-gray-900">{formatBTC(fee)} BTC</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Inputs ({transaction.vin.length})</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Index
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previous Output
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transaction.vin.map((input, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{index}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {input.txid ? (
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); router.push(`/explorer/tx/${input.txid}`); }}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {`${input.txid.substring(0, 10)}...${input.txid.substring(input.txid.length - 10)}`}:{input.vout}
                        </a>
                      ) : (
                        'Coinbase'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {input.address ? (
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); handleAddressClick(input.address); }}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {input.address}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {input.value ? `${formatBTC(input.value)} BTC` : 'N/A'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Outputs ({transaction.vout.length})</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Index
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transaction.vout.map((output) => (
                <tr key={output.n}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{output.n}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {output.scriptPubKey && output.scriptPubKey.addresses ? (
                        output.scriptPubKey.addresses.map((address, i) => (
                          <div key={i}>
                            <a
                              href="#"
                              onClick={(e) => { e.preventDefault(); handleAddressClick(address); }}
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              {address}
                            </a>
                          </div>
                        ))
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {output.scriptPubKey ? output.scriptPubKey.type : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatBTC(output.value)} BTC
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
