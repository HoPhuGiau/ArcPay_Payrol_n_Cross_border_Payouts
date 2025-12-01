'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-bold">ArcPay</h1>
          </div>
          <div className="text-center p-12">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold">ArcPay</h1>
          <ConnectButton />
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">
            Payroll & Cross-border Payouts on Arc
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Manage global payroll and payouts using USDC/EURC on Arc blockchain
          </p>
        </div>

        {isConnected ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/company"
              className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold mb-2">Company Dashboard</h3>
              <p className="text-gray-600">
                Register your company, manage employees, and execute payroll
              </p>
            </Link>

            <Link
              href="/me"
              className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold mb-2">My Payments</h3>
              <p className="text-gray-600">
                View your payment history and salary records
              </p>
            </Link>
          </div>
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-lg">
            <p className="text-lg mb-4">Connect your wallet to get started</p>
            <p className="text-gray-600">
              ArcPay uses Arc Testnet. Make sure your wallet is connected to Arc Testnet.
            </p>
          </div>
        )}

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">About ArcPay</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Built on Arc - Economic OS for the internet</li>
            <li>USDC/EURC native payments with sub-second finality</li>
            <li>Predictable fees in USD - no volatile gas tokens</li>
            <li>Perfect for cross-border payroll and freelancer payouts</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

