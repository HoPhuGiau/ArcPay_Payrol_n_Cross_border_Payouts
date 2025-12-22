'use client';

import * as React from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import toast from 'react-hot-toast';
import CompanyRegistryABI from '@/abis/CompanyRegistry.json';
import { COMPANY_REGISTRY_ADDRESS } from '@/constants';

const ARCSCAN_URL = 'https://testnet.arcscan.io';

export function CompanyRegistration() {
    const { isConnected } = useAccount();
    const [companyName, setCompanyName] = React.useState('');

    const {
        data: hash,
        isPending,
        writeContract,
        error
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

    // Toast notifications
    React.useEffect(() => {
        if (hash) {
            toast.loading('Transaction submitted...', { id: 'tx-pending' });
        }
    }, [hash]);

    React.useEffect(() => {
        if (isConfirmed) {
            toast.dismiss('tx-pending');
            toast.success(
                <div>
                    <p className="font-medium">Company Registered! 🎉</p>
                    <a
                        href={`${ARCSCAN_URL}/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:underline text-sm"
                    >
                        View on ArcScan →
                    </a>
                </div>,
                { duration: 8000 }
            );
            setCompanyName('');
        }
    }, [isConfirmed, hash]);

    React.useEffect(() => {
        if (error) {
            toast.dismiss('tx-pending');
            toast.error(`Transaction failed: ${error.message.slice(0, 50)}...`);
        }
    }, [error]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName) return;

        const metadata = JSON.stringify({ name: companyName });

        writeContract({
            address: COMPANY_REGISTRY_ADDRESS as `0x${string}`,
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
                    <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                </div>
            </div>

            {!isConnected ? (
                <div className="p-4 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-200 dark:border-violet-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-zinc-900 dark:text-white">Connect Your Wallet</p>
                            <p className="text-sm text-zinc-500">to start managing payroll on Arc Network</p>
                        </div>
                    </div>
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
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Confirming...
                            </span>
                        ) : (
                            'Register Company'
                        )}
                    </button>

                    {hash && (
                        <a
                            href={`${ARCSCAN_URL}/tx/${hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-sm text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors border border-zinc-100 dark:border-zinc-800"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View Transaction on ArcScan
                        </a>
                    )}
                </form>
            )}
        </div>
    );
}
