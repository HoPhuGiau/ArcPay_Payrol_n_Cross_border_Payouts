'use client';

import { useAccount, useReadContract, useBalance } from 'wagmi';
import { CompanyRegistration } from '@/components/CompanyRegistration';
import { EmployeeManagement } from '@/components/EmployeeManagement';
import { PayrollBatches } from '@/components/PayrollBatches';
import { COMPANY_REGISTRY_ADDRESS, USDC_ADDRESS, EURC_ADDRESS } from '@/constants';
import CompanyRegistryABI from '@/abis/CompanyRegistry.json';

export default function Home() {
    const { address, isConnected } = useAccount();

    const { data: companyIds } = useReadContract({
        address: COMPANY_REGISTRY_ADDRESS as `0x${string}`,
        abi: CompanyRegistryABI.abi,
        functionName: 'getOwnerCompanies',
        args: [address],
        query: { enabled: !!address }
    });

    const hasCompany = companyIds && (companyIds as readonly bigint[]).length > 0;

    const { data: usdcBalance } = useBalance({
        address: address,
        token: USDC_ADDRESS as `0x${string}`,
        query: { enabled: !!address }
    });

    const { data: eurcBalance } = useBalance({
        address: address,
        token: EURC_ADDRESS as `0x${string}`,
        query: { enabled: !!address }
    });

    return (
        <div className="min-h-screen pb-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                {/* Hero Section */}
                <div className="mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-500">
                                    Streamline
                                </span>{' '}
                                Your Payroll
                            </h1>
                            <p className="text-lg text-zinc-500 dark:text-zinc-400">
                                Manage payroll on{' '}
                                <span className="text-zinc-900 dark:text-white font-semibold">Arc Network</span> with stablecoins
                            </p>
                        </div>

                        {/* Quick Stats for connected users */}
                        {isConnected && (
                            <div className="flex gap-3">
                                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                    <p className="text-xs text-zinc-500 uppercase">USDC</p>
                                    <p className="font-bold text-blue-600 dark:text-blue-400">
                                        ${usdcBalance ? parseFloat(usdcBalance.formatted).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                                <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/50">
                                    <p className="text-xs text-zinc-500 uppercase">EURC</p>
                                    <p className="font-bold text-purple-600 dark:text-purple-400">
                                        €{eurcBalance ? parseFloat(eurcBalance.formatted).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Arc Network Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl border border-green-100 dark:border-green-800/30">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-zinc-900 dark:text-white">Sub-second Finality</p>
                                <p className="text-sm text-zinc-500">Instant confirmations</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-zinc-900 dark:text-white">USD-based Fees</p>
                                <p className="text-sm text-zinc-500">Predictable costs</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 rounded-xl border border-violet-100 dark:border-violet-800/30">
                            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-zinc-900 dark:text-white">Native Stablecoins</p>
                                <p className="text-sm text-zinc-500">USDC & EURC support</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Company & Info */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <CompanyRegistration />

                        {/* Status Card */}
                        {isConnected && (
                            <div className="glass-card p-6 rounded-xl">
                                <h3 className="text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">Status</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Wallet</span>
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Connected</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Company</span>
                                        <span className={`text-sm font-medium ${hasCompany ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            {hasCompany ? '✓ Registered' : 'Not registered'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Network</span>
                                        <span className="text-sm font-medium text-violet-600 dark:text-violet-400">Arc Testnet</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resources */}
                        <div className="glass-card p-6 rounded-xl">
                            <h3 className="text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">Resources</h3>
                            <div className="space-y-2">
                                <a
                                    href="https://faucet.circle.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors group"
                                >
                                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Get Test USDC</span>
                                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                                <a
                                    href="https://testnet.arcscan.io/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                                >
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Block Explorer</span>
                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                                <a
                                    href="https://docs.arc.network/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors group"
                                >
                                    <span className="text-sm font-medium text-violet-700 dark:text-violet-400">Arc Docs</span>
                                    <svg className="w-4 h-4 text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Main Management Area */}
                    <div className="lg:col-span-2 flex flex-col">
                        <EmployeeManagement />
                        <PayrollBatches />
                    </div>
                </div>
            </main>

            <footer className="mt-20 py-8 text-center text-sm text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <p>
                    Built for{' '}
                    <span className="font-semibold text-violet-600 dark:text-violet-400">Circle Developer Grants</span>
                    {' '}• Powered by{' '}
                    <span className="font-semibold text-zinc-600 dark:text-zinc-300">Arc Network</span> © 2025
                </p>
            </footer>
        </div>
    );
}
