'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { COMPANY_REGISTRY_ADDRESS, COMPANY_REGISTRY_ABI } from '@/lib/contracts';

export default function CompanyPage() {
  const { address, isConnected } = useAccount();
  const [companyName, setCompanyName] = useState('');
  const [metadataHash, setMetadataHash] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Get user's companies
  const { data: companyIds } = useReadContract({
    address: COMPANY_REGISTRY_ADDRESS as `0x${string}`,
    abi: COMPANY_REGISTRY_ABI,
    functionName: 'getOwnerCompanies',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!COMPANY_REGISTRY_ADDRESS },
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !COMPANY_REGISTRY_ADDRESS) return;

    // Use metadataHash if provided, otherwise create JSON from company name
    let metadata = metadataHash.trim();
    if (!metadata) {
      metadata = JSON.stringify({ 
        name: companyName, 
        createdAt: Date.now(),
        description: `Company registered on ArcPay`
      });
    }
    
    writeContract({
      address: COMPANY_REGISTRY_ADDRESS as `0x${string}`,
      abi: COMPANY_REGISTRY_ABI,
      functionName: 'registerCompany',
      args: [metadata],
    });
  };

  if (!mounted) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center p-12">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Company Dashboard</h1>
            <ConnectButton />
          </div>
          <div className="text-center p-12 bg-gray-50 rounded-lg">
            <p className="text-lg">Please connect your wallet to continue</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Company Dashboard</h1>
          <ConnectButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Register Company Form */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Register New Company</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Metadata Hash (optional)
                  <span className="text-xs text-gray-500 ml-2">Leave empty to auto-generate</span>
                </label>
                <input
                  type="text"
                  value={metadataHash}
                  onChange={(e) => setMetadataHash(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="IPFS hash (Qm...) or JSON string"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If empty, will auto-generate JSON from company name
                </p>
              </div>
              <button
                type="submit"
                disabled={isPending || isConfirming}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Registering...' : isConfirming ? 'Confirming...' : 'Register Company'}
              </button>
            </form>
            {isSuccess && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded">
                Company registered successfully!
              </div>
            )}
          </div>

          {/* My Companies */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">My Companies</h2>
            {companyIds && companyIds.length > 0 ? (
              <div className="space-y-3">
                {companyIds.map((id: bigint) => (
                  <Link
                    key={id.toString()}
                    href={`/company/${id.toString()}`}
                    className="block p-4 border rounded hover:bg-gray-50"
                  >
                    <div className="font-semibold">Company #{id.toString()}</div>
                    <div className="text-sm text-gray-600">Click to manage</div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No companies registered yet</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

