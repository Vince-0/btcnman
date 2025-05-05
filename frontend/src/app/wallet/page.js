'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
  const [walletInfo, setWalletInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:3001/api/bitcoin/wallet', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch wallet information');
        }

        const data = await response.json();
        setWalletInfo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletInfo();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  if (!walletInfo) {
    return (
      <div className="text-center">
        <p>No wallet information available. Please check your Bitcoin Core configuration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wallet Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Balance</h2>
          <p className="text-2xl font-bold">{walletInfo.balance} BTC</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Unconfirmed</h2>
          <p className="text-2xl font-bold">{walletInfo.unconfirmed_balance} BTC</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Immature</h2>
          <p className="text-2xl font-bold">{walletInfo.immature_balance} BTC</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Total</h2>
          <p className="text-2xl font-bold">
            {(
              parseFloat(walletInfo.balance) +
              parseFloat(walletInfo.unconfirmed_balance) +
              parseFloat(walletInfo.immature_balance)
            ).toFixed(8)} BTC
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Wallet Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Wallet Name</p>
            <p className="text-sm text-gray-900">{walletInfo.walletname}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Wallet Version</p>
            <p className="text-sm text-gray-900">{walletInfo.walletversion}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Transaction Count</p>
            <p className="text-sm text-gray-900">{walletInfo.txcount}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Key Pool Size</p>
            <p className="text-sm text-gray-900">{walletInfo.keypoolsize}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Key Pool Oldest</p>
            <p className="text-sm text-gray-900">
              {walletInfo.keypoololdest
                ? new Date(walletInfo.keypoololdest * 1000).toLocaleString()
                : 'N/A'}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Unlocked Until</p>
            <p className="text-sm text-gray-900">
              {walletInfo.unlocked_until
                ? new Date(walletInfo.unlocked_until * 1000).toLocaleString()
                : 'Not unlocked'}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Pay TX Fee</p>
            <p className="text-sm text-gray-900">{walletInfo.paytxfee} BTC</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">HD Master Key ID</p>
            <p className="text-sm text-gray-900 break-all">{walletInfo.hdseedid || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Wallet Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Private Keys Enabled</p>
            <p className="text-sm text-gray-900">{walletInfo.private_keys_enabled ? 'Yes' : 'No'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Avoid Reuse</p>
            <p className="text-sm text-gray-900">{walletInfo.avoid_reuse ? 'Yes' : 'No'}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Scanning Progress</p>
            <p className="text-sm text-gray-900">
              {walletInfo.scanning ? 
                `${(walletInfo.scanning.progress * 100).toFixed(2)}%` : 
                'Not scanning'}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Encrypted</p>
            <p className="text-sm text-gray-900">{walletInfo.unlocked_until !== undefined ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
      
      <div className="text-center text-gray-500 text-sm mt-4">
        <p>This is a read-only view of your wallet information. No transactions can be initiated from this interface.</p>
      </div>
    </div>
  );
}
