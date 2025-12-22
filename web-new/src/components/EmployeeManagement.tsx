'use client';

import * as React from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { COMPANY_REGISTRY_ADDRESS, PAYROLL_MANAGER_ADDRESS, USDC_ADDRESS, EURC_ADDRESS } from '@/constants';
import CompanyRegistryABI from '@/abis/CompanyRegistry.json';
import PayrollManagerABI from '@/abis/PayrollManager.json';

const formatAmount = (amount: bigint) => (Number(amount) / 1_000_000).toFixed(2);
const parseAmount = (amount: string) => BigInt(Math.floor(Number(amount) * 1_000_000));

export function EmployeeManagement() {
    const { address, isConnected } = useAccount();
    const [newEmployee, setNewEmployee] = React.useState({
        wallet: '',
        basePay: '',
        token: USDC_ADDRESS,
        cycle: 0
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

    const { data: employees, refetch: refetchEmployees } = useReadContract({
        address: PAYROLL_MANAGER_ADDRESS as `0x${string}`,
        abi: PayrollManagerABI.abi,
        functionName: 'getCompanyEmployees',
        args: [companyId],
        query: { enabled: !!companyId }
    });

    const { data: hash, isPending, writeContract, reset } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    React.useEffect(() => {
        if (isConfirmed) {
            refetchEmployees();
            setNewEmployee(prev => ({ ...prev, wallet: '', basePay: '' }));
            reset();
        }
    }, [isConfirmed, refetchEmployees, reset]);

    const handleAddEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyId || !newEmployee.wallet || !newEmployee.basePay) return;

        writeContract({
            address: PAYROLL_MANAGER_ADDRESS as `0x${string}`,
            abi: PayrollManagerABI.abi,
            functionName: 'addEmployee',
            args: [
                companyId,
                newEmployee.wallet,
                parseAmount(newEmployee.basePay),
                newEmployee.token,
                newEmployee.cycle
            ]
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employeeList = isConnected && companyId ? (employees as any[]) || [] : [];

    const isLocked = !isConnected || !companyId;

    return (
        <div className="glass-card p-6 rounded-xl w-full overflow-hidden relative">
            {isLocked && (
                <div className="absolute inset-0 z-10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700">
                        <p className="text-zinc-900 dark:text-white font-semibold mb-2">
                            {!isConnected ? 'Connect Your Wallet' : 'Register a Company First'}
                        </p>
                        <p className="text-sm text-zinc-500 mb-0">to manage your employees</p>
                    </div>
                </div>
            )}

            <div className={`transition-opacity duration-300 ${isLocked ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">People</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your team and their salaries</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    </div>
                </div>

                {/* Add Employee Form */}
                <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 p-5 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="md:col-span-5">
                        <label className="block text-xs font-medium mb-1.5 text-zinc-500 uppercase tracking-wider">Wallet Address</label>
                        <input
                            type="text"
                            value={newEmployee.wallet}
                            onChange={(e) => setNewEmployee({ ...newEmployee, wallet: e.target.value })}
                            className="input-field text-sm"
                            placeholder="0x..."
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-xs font-medium mb-1.5 text-zinc-500 uppercase tracking-wider">Salary</label>
                        <input
                            type="number"
                            value={newEmployee.basePay}
                            onChange={(e) => setNewEmployee({ ...newEmployee, basePay: e.target.value })}
                            className="input-field text-sm"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium mb-1.5 text-zinc-500 uppercase tracking-wider">Currency</label>
                        <select
                            value={newEmployee.token}
                            onChange={(e) => setNewEmployee({ ...newEmployee, token: e.target.value })}
                            className="input-field text-sm"
                        >
                            <option value={USDC_ADDRESS}>USDC</option>
                            <option value={EURC_ADDRESS}>EURC</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 flex items-end">
                        <button
                            type="submit"
                            disabled={isPending || isConfirming}
                            className="btn-primary w-full text-sm h-[42px]"
                        >
                            {isPending ? 'Adding...' : 'Add Employee'}
                        </button>
                    </div>
                </form>

                {/* Employee List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="py-3 px-4 font-semibold text-zinc-500 dark:text-zinc-400">Employee</th>
                                <th className="py-3 px-4 font-semibold text-zinc-500 dark:text-zinc-400">Salary</th>
                                <th className="py-3 px-4 font-semibold text-zinc-500 dark:text-zinc-400">Status</th>
                                <th className="py-3 px-4 font-semibold text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {employeeList.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-zinc-500">
                                        No employees found. Add one above to get started.
                                    </td>
                                </tr>
                            ) : (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                employeeList.map((emp: any, idx: number) => (
                                    <tr key={idx} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {emp.wallet.slice(2, 4).toUpperCase()}
                                                </div>
                                                <span className="font-mono text-zinc-600 dark:text-zinc-300">
                                                    {emp.wallet.slice(0, 6)}...{emp.wallet.slice(-4)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 font-medium">
                                            {formatAmount(emp.basePay)}{' '}
                                            <span className="text-zinc-500 font-normal text-xs">
                                                {emp.payToken === USDC_ADDRESS ? 'USDC' : 'EURC'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emp.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {emp.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button className="text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium">
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
