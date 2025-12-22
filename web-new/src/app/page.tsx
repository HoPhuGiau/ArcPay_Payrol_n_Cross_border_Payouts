'use client';

import { CompanyRegistration } from '@/components/CompanyRegistration';
import { EmployeeManagement } from '@/components/EmployeeManagement';
import { PayrollBatches } from '@/components/PayrollBatches';

export default function Home() {
    return (
        <div className="min-h-screen pb-12">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                {/* Hero Section */}
                <div className="mb-12 text-center sm:text-left">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-500">
                            Streamline
                        </span>{' '}
                        Your Payroll
                    </h1>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">
                        Manage your company payroll efficiently on the{' '}
                        <span className="text-zinc-900 dark:text-white font-semibold">Arc Network</span>.
                        Calculated and disbursed in USDC/EURC with a single transaction.
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Company & Quick Actions */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <CompanyRegistration />
                        {/* Market Rates Widget */}
                        <div className="glass-card p-6 rounded-xl hidden lg:block">
                            <h3 className="text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">
                                Market Rates
                            </h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-zinc-600 dark:text-zinc-300">USDC / USD</span>
                                <span className="text-sm font-mono text-green-500">$1.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-zinc-600 dark:text-zinc-300">EURC / USD</span>
                                <span className="text-sm font-mono text-green-500">$1.05</span>
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
                    Powered by{' '}
                    <span className="font-semibold text-zinc-600 dark:text-zinc-300">Arc Network</span> © 2025
                </p>
            </footer>
        </div>
    );
}
