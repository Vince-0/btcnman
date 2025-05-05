'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        // If logged in, redirect to dashboard
        router.push('/dashboard');
      } else {
        // If not logged in, redirect to login page
        router.push('/login');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      setLoading(false);
    }
  }, [router]);

  // If there's an error with the redirection, show manual navigation links
  if (!loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between text-center">
          <h1 className="text-4xl font-bold mb-8">Bitcoin Node Manager</h1>
          <p className="text-xl mb-8">Modern implementation of Bitcoin Node Manager</p>

          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded mb-8">
            <p>There was an issue with automatic redirection. Please use the links below:</p>
          </div>

          <div className="flex flex-col space-y-4 items-center">
            <Link href="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
              Login
            </Link>
            <Link href="/dashboard" className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-center">
        <h1 className="text-4xl font-bold mb-8">Bitcoin Node Manager</h1>
        <p className="text-xl mb-4">Modern implementation of Bitcoin Node Manager</p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-500">Redirecting...</p>
      </div>
    </main>
  );
}
