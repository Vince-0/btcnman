'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TransactionDetails from '../../../../components/explorer/TransactionDetails';

export default function TransactionPage({ params }) {
  const router = useRouter();
  const { txid } = params;

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => router.push('/explorer')}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          &larr; Back to Explorer
        </button>
        <h1 className="text-2xl font-bold">Transaction Details</h1>
      </div>

      <TransactionDetails txid={txid} />
    </div>
  );
}
