'use client';

import * as React from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from 'viem';
import { COMPANY_REGISTRY_ADDRESS, PAYROLL_MANAGER_ADDRESS, USDC_ADDRESS, EURC_ADDRESS } from '@/constants';
import CompanyRegistryABI from '@/abis/CompanyRegistry.json';
import PayrollManagerABI from '@/abis/PayrollManager.json';

const ERC20_ABI = parseAbi([
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
]);

// BatchRow Component
const BatchRow = ({
    id,
    companyId,
    onExecute,
    onApprove,
    isExecuting,
    isApproving,
    triggerRefresh
}: {
    id: bigint;
    companyId: bigint;
    onExecute: (id: bigint) => void;
    onApprove: (token: string, amount: bigint) => void;
    isExecuting: boolean;
    isApproving: boolean;
    triggerRefresh: boolean;
}) => {
    const { data: batch, refetch } = useReadContract({
        address: PAYROLL_MANAGER_ADDRESS as `0x${string}`,
        abi: PayrollManagerABI.abi,
        functionName: 'payrollBatches',
        args: [id]
    });

    React.useEffect(() => {
        if (triggerRefresh) refetch();
    }, [triggerRefresh, refetch]);

    if (!batch) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [cId, period, token, totalAmount, executed, executedAt, empCount] = batch as any;

    if (cId !== companyId) return null;

    const isUSDC = token === USDC_ADDRESS;

    return (
        <tr className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
            <td className="py-4 px-4 font-mono text-zinc-500">#{id.toString()}</td>
            <td className="py-4 px-4 font-medium">{period.toString()}</td>
            <td className="py-4 px-4">
                <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {(Number(totalAmount) / 1000000).toLocaleString()}{' '}
                        <span className="text-xs text-zinc-500">{isUSDC ? 'USDC' : 'EURC'}</span>
                    </span>
                </div>
            </td>
            <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">{empCount.toString()} Staff</td>
            <td className="py-4 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${executed
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                    }`}>
                    {executed ? 'Paid' : 'Pending'}
                </span>
            </td>
            <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                    {!executed ? (
                        <>
                            <button
                                onClick={() => onApprove(token, totalAmount)}
                                disabled={isApproving}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-colors"
                            >
                                {isApproving ? '...' : 'Approve'}
                            </button>
                            <button
                                onClick={() => onExecute(id)}
                                disabled={isExecuting}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/20 transition-all"
                            >
                                {isExecuting ? 'Paying...' : 'Pay Now'}
                            </button>
                        </>
                    ) : (
                        <span className="text-xs text-zinc-400">
                            {new Date(Number(executedAt) * 1000).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </td>
        </tr>
    );
};

export function PayrollBatches() {
    const { address, isConnected } = useAccount();
    const [newBatch, setNewBatch] = React.useState({
        period: new Date().getFullYear() * 100 + (new Date().getMonth() + 1),
        token: USDC_ADDRESS
    });

    const { data: companyIds } = useReadContract({
        address: COMPANY_REGISTRY_ADDRESS as `0x${string}`,
        abi: CompanyRegistryABI.abi,
        functionName: 'getOwnerCompanies',
        args: [address],
        query: { enabled: !!address }
    });

    const companyId = React.useMemo(() => {
        const result = companyIds as readonly bigint[] | undefined;
        return result && result.length > 0 ? result[0] : null;
    }, [companyIds]);

    const { data: batchCount, refetch: refetchCount } = useReadContract({
        address: PAYROLL_MANAGER_ADDRESS as `0x${string}`,
        abi: PayrollManagerABI.abi,
        functionName: 'payrollBatchCount',
        query: { enabled: true }
    });

    const { data: createHash, isPending: isCreating, writeContract: createBatch, reset: resetCreate } = useWriteContract();
    const { isSuccess: isCreated } = useWaitForTransactionReceipt({ hash: createHash });

    const { data: execHash, isPending: isExecuting, writeContract: executeBatch, reset: resetExec } = useWriteContract();
    const { isSuccess: isExecuted } = useWaitForTransactionReceipt({ hash: execHash });

    const { data: approveHash, isPending: isApproving, writeContract: approveToken, reset: resetApprove } = useWriteContract();
    const { isSuccess: isApproved } = useWaitForTransactionReceipt({ hash: approveHash });

    React.useEffect(() => {
        if (isCreated) { refetchCount(); resetCreate(); }
        if (isExecuted) { refetchCount(); resetExec(); }
        if (isApproved) { refetchCount(); resetApprove(); }
    }, [isCreated, isExecuted, isApproved, refetchCount, resetCreate, resetExec, resetApprove]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyId) return;
        createBatch({
            address: PAYROLL_MANAGER_ADDRESS as `0x${string}`,
            abi: PayrollManagerABI.abi,
            functionName: 'createPayrollBatch',
            args: [companyId, BigInt(newBatch.period), newBatch.token]
        });
    };

    const handleExecute = (batchId: bigint) => {
        executeBatch({
            address: PAYROLL_MANAGER_ADDRESS as `0x${string}`,
            abi: PayrollManagerABI.abi,
            functionName: 'executePayroll',
            args: [batchId]
        });
    };

    const handleApprove = (token: string, amount: bigint) => {
        approveToken({
            address: token as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [PAYROLL_MANAGER_ADDRESS as `0x${string}`, amount]
        });
    };

    const isLocked = !isConnected || !companyId;

    return (
        <div className="glass-card p-6 rounded-xl w-full overflow-hidden mt-8 relative">
            {isLocked && (
                <div className="absolute inset-0 z-10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                        <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                </div>
            )}

            <div className={`transition-opacity duration-300 ${isLocked ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">Payroll History</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Execute and track salary payments</p>
                    </div>
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>

                {/* Create Batch Form */}
                <div className="mb-8 p-5 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold mb-4 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        New Payment Run
                    </h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-5">
                            <label className="block text-xs font-medium mb-1.5 text-zinc-500 uppercase tracking-wider">Period</label>
                            <input
                                type="number"
                                value={newBatch.period}
                                onChange={(e) => setNewBatch({ ...newBatch, period: parseInt(e.target.value) })}
                                className="input-field text-sm"
                                placeholder="YYYYMM"
                            />
                        </div>
                        <div className="md:col-span-5">
                            <label className="block text-xs font-medium mb-1.5 text-zinc-500 uppercase tracking-wider">Currency</label>
                            <select
                                value={newBatch.token}
                                onChange={(e) => setNewBatch({ ...newBatch, token: e.target.value })}
                                className="input-field text-sm"
                            >
                                <option value={USDC_ADDRESS}>USDC</option>
                                <option value={EURC_ADDRESS}>EURC</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="btn-primary w-full text-sm h-[42px]"
                            >
                                {isCreating ? 'Creating...' : 'Create Run'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Batches List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="py-3 px-4 font-semibold text-zinc-500 dark:text-zinc-400">ID</th>
                                <th className="py-3 px-4 font-semibold text-zinc-500 dark:text-zinc-400">Period</th>
                                <th className="py-3 px-4 font-semibold text-zinc-500 dark:text-zinc-400">Amount</th>
                                <th className="py-3 px-4 font-semibold text-zinc-500 dark:text-zinc-400">Staff</th>
                                <th className="py-3 px-4 font-semibold text-zinc-500 dark:text-zinc-400">Status</th>
                                <th className="py-3 px-4 font-semibold text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {isLocked || !batchCount || Number(batchCount) === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                                        No payroll runs found
                                    </td>
                                </tr>
                            ) : (
                                Array.from({ length: Number(batchCount) }, (_, i) => BigInt(i + 1)).reverse().map(id => (
                                    <BatchRow
                                        key={id.toString()}
                                        id={id}
                                        companyId={companyId!}
                                        onExecute={handleExecute}
                                        onApprove={handleApprove}
                                        isExecuting={isExecuting}
                                        isApproving={isApproving}
                                        triggerRefresh={isExecuted}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
