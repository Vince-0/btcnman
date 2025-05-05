'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExplorerPage() {
  const [blockHeight, setBlockHeight] = useState('');
  const [blockHash, setBlockHash] = useState('');
  const [txid, setTxid] = useState('');
  const [blockInfo, setBlockInfo] = useState(null);
  const [txInfo, setTxInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchBlockByHeight = async () => {
    if (!blockHeight) return;
    
    setLoading(true);
    setError(null);
    setBlockInfo(null);
    setTxInfo(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/bitcoin/block/height/${blockHeight}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch block');
      }

      const data = await response.json();
      setBlockInfo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockByHash = async () => {
    if (!blockHash) return;
    
    setLoading(true);
    setError(null);
    setBlockInfo(null);
    setTxInfo(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/bitcoin/block/${blockHash}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch block');
      }

      const data = await response.json();
      setBlockInfo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransaction = async () => {
    if (!txid) return;
    
    setLoading(true);
    setError(null);
    setBlockInfo(null);
    setTxInfo(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/bitcoin/tx/${txid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction');
      }

      const data = await response.json();
      setTxInfo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Block Explorer</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                onClick={fetchBlockByHeight}
                disabled={loading || !blockHeight}
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
                onClick={fetchBlockByHash}
                disabled={loading || !blockHash}
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
                onClick={fetchTransaction}
                disabled={loading || !txid}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}
      
      {blockInfo && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Block Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Hash</p>
              <p className="text-sm text-gray-900 break-all">{blockInfo.hash}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Height</p>
              <p className="text-sm text-gray-900">{blockInfo.height}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Timestamp</p>
              <p className="text-sm text-gray-900">{new Date(blockInfo.time * 1000).toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Difficulty</p>
              <p className="text-sm text-gray-900">{blockInfo.difficulty}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Size</p>
              <p className="text-sm text-gray-900">{blockInfo.size} bytes</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Weight</p>
              <p className="text-sm text-gray-900">{blockInfo.weight}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Version</p>
              <p className="text-sm text-gray-900">{blockInfo.version}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Merkle Root</p>
              <p className="text-sm text-gray-900 break-all">{blockInfo.merkleroot}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Number of Transactions</p>
              <p className="text-sm text-gray-900">{blockInfo.tx.length}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Nonce</p>
              <p className="text-sm text-gray-900">{blockInfo.nonce}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Transactions</h3>
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
                      Virtual Size
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blockInfo.tx.slice(0, 10).map((tx, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 break-all">
                        {typeof tx === 'string' ? tx : tx.txid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof tx === 'object' ? `${tx.size} bytes` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof tx === 'object' ? `${tx.vsize} vbytes` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {blockInfo.tx.length > 10 && (
                <div className="px-6 py-3 text-sm text-gray-500">
                  Showing 10 of {blockInfo.tx.length} transactions
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {txInfo && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Transaction Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Transaction ID</p>
              <p className="text-sm text-gray-900 break-all">{txInfo.txid}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Size</p>
              <p className="text-sm text-gray-900">{txInfo.size} bytes</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Virtual Size</p>
              <p className="text-sm text-gray-900">{txInfo.vsize} vbytes</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Weight</p>
              <p className="text-sm text-gray-900">{txInfo.weight}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Locktime</p>
              <p className="text-sm text-gray-900">{txInfo.locktime}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Version</p>
              <p className="text-sm text-gray-900">{txInfo.version}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Inputs</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous Output
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Index
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sequence
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {txInfo.vin.map((input, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 break-all">
                        {input.txid || 'Coinbase'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {input.vout !== undefined ? input.vout : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {input.sequence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Outputs</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Index
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Script Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {txInfo.vout.map((output, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {output.n}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {output.value} BTC
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {output.scriptPubKey.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 break-all">
                        {output.scriptPubKey.address || output.scriptPubKey.addresses?.join(', ') || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
