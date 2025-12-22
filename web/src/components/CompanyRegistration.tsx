'use client';

import * as React from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import CompanyRegistryABI from '../abis/CompanyRegistry.json';
import { COMPANY_REGISTRY_ADDRESS } from '../constants';

const CONTRACT_ADDRESS = COMPANY_REGISTRY_ADDRESS;

export function CompanyRegistration() {
    const { isConnected } = useAccount();
    const [companyName, setCompanyName] = React.useState('');

    const {
        data: hash,
        isPending,
        writeContract
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName) return;

        const metadata = JSON.stringify({ name: companyName });

        writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CompanyRegistryABI.abi,
            functionName: 'registerCompany',
            args: [metadata],
        });
    };

    return (
        <div className="glass-card p-6 rounded-xl w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold dark:text-white">Register Company</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Initialize your company on-chain</p>
                </div>
                <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
            </div>

            {!isConnected ? (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                    Please connect your wallet to start.
                </div>
            ) : (
                <form onSubmit={handleRegister} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Company Name</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="input-field"
                            placeholder="e.g. Acme Corp"
                            disabled={isPending || isConfirming}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending || isConfirming || !companyName}
                        className="btn-primary w-full flex justify-center items-center"
                    >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Check Wallet...
                            </span>
                        ) : isConfirming ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-pulse">Confirming Transaction...</span>
                            </span>
                        ) : (
                            'Register Company'
                        )}
                    </button>

                    {hash && (
                        <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded text-xs break-all border border-zinc-100 dark:border-zinc-800">
                            <span className="font-semibold text-zinc-500">Tx Hash:</span> <span className="text-zinc-400 font-mono">{hash}</span>
                        </div>
                    )}

                    {isConfirmed && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-600 dark:text-green-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Registration Successful!
                        </div>
                    )}
                </form>
            )}
        </div>
    );
}
