'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { USDC_ADDRESS } from '@/constants';

export function Navbar() {
    const [mounted, setMounted] = useState(false);
    const { address, isConnected } = useAccount();

    const { data: usdcBalance } = useBalance({
        address: address,
        token: USDC_ADDRESS as `0x${string}`,
        query: { enabled: !!address }
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                            Arc Payroll
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Faucet Link */}
                        <a
                            href="https://faucet.circle.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Get Test USDC
                        </a>

                        {/* USDC Balance */}
                        {mounted && isConnected && usdcBalance && (
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">$</span>
                                </div>
                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    {parseFloat(usdcBalance.formatted).toFixed(2)} USDC
                                </span>
                            </div>
                        )}

                        {/* Connect Button */}
                        {mounted ? (
                            <ConnectButton />
                        ) : (
                            <button className="bg-violet-600 text-white font-medium py-2 px-4 rounded-lg opacity-50">
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
