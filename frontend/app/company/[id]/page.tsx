'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { 
  PAYROLL_MANAGER_ADDRESS, 
  PAYROLL_MANAGER_ABI,
  USDC_ADDRESS,
  EURC_ADDRESS,
  ERC20_ABI
} from '@/lib/contracts';
import { formatUnits, parseUnits } from 'viem';

type Employee = {
  wallet: string;
  basePay: bigint;
  payToken: string;
  payCycle: number;
  active: boolean;
};

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;
  const { address, isConnected } = useAccount();
  
  const [employeeWallet, setEmployeeWallet] = useState('');
  const [basePay, setBasePay] = useState('');
  const [selectedToken, setSelectedToken] = useState(USDC_ADDRESS);
  const [payCycle, setPayCycle] = useState(0);
  const [period, setPeriod] = useState('');

  // Get employees
  const { data: employees, refetch: refetchEmployees } = useReadContract({
    address: PAYROLL_MANAGER_ADDRESS as `0x${string}`,
    abi: PAYROLL_MANAGER_ABI,
    functionName: 'getCompanyEmployees',
    args: [BigInt(companyId)],
    query: { enabled: !!PAYROLL_MANAGER_ADDRESS && !!companyId },
  });

  const { writeContract: addEmployee, isPending: isAdding } = useWriteContract();
  const { writeContract: createBatch, isPending: isCreatingBatch } = useWriteContract();
  const { writeContract: approveToken, isPending: isApproving } = useWriteContract();
  const { writeContract: executePayroll, isPending: isExecuting } = useWriteContract();

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PAYROLL_MANAGER_ADDRESS) return;

    const payAmount = parseUnits(basePay, 6); // USDC/EURC use 6 decimals

    addEmployee({
      address: PAYROLL_MANAGER_ADDRESS as `0x${string}`,
      abi: PAYROLL_MANAGER_ABI,
      functionName: 'addEmployee',
      args: [
        BigInt(companyId),
        employeeWallet as `0x${string}`,
        payAmount,
        selectedToken as `0x${string}`,
        payCycle,
      ],
    }, {
      onSuccess: () => {
        setEmployeeWallet('');
        setBasePay('');
        refetchEmployees();
      },
    });
  };

  const handleCreateBatch = async () => {
    if (!PAYROLL_MANAGER_ADDRESS || !period) return;

    const periodNum = parseInt(period.replace(/-/g, '')); // Convert YYYY-MM to YYYYMM

    createBatch({
      address: PAYROLL_MANAGER_ADDRESS as `0x${string}`,
      abi: PAYROLL_MANAGER_ABI,
      functionName: 'createPayrollBatch',
      args: [
        BigInt(companyId),
        BigInt(periodNum),
        selectedToken as `0x${string}`,
      ],
    });
  };

  const handleApprove = async () => {
    if (!PAYROLL_MANAGER_ADDRESS) return;

    // Get batch total amount (simplified - in production, fetch from contract)
    const totalAmount = employees
      ?.filter((emp: Employee) => emp.active && emp.payToken.toLowerCase() === selectedToken.toLowerCase())
      .reduce((sum: bigint, emp: Employee) => sum + emp.basePay, 0n) || 0n;

    approveToken({
      address: selectedToken as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [PAYROLL_MANAGER_ADDRESS as `0x${string}`, totalAmount],
    });
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <ConnectButton />
          <p className="mt-4">Please connect your wallet</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/company" className="text-blue-600 hover:underline mb-2 block">
              ← Back to Companies
            </Link>
            <h1 className="text-3xl font-bold">Company #{companyId}</h1>
          </div>
          <ConnectButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Employee */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Add Employee</h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Employee Wallet</label>
                <input
                  type="text"
                  value={employeeWallet}
                  onChange={(e) => setEmployeeWallet(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0x..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Base Pay</label>
                <input
                  type="number"
                  step="0.01"
                  value={basePay}
                  onChange={(e) => setBasePay(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="1000.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Token</label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value={USDC_ADDRESS}>USDC</option>
                  <option value={EURC_ADDRESS}>EURC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pay Cycle</label>
                <select
                  value={payCycle}
                  onChange={(e) => setPayCycle(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                >
                  <option value={0}>Monthly</option>
                  <option value={1}>Weekly</option>
                  <option value={2}>Bi-Weekly</option>
                  <option value={3}>Quarterly</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isAdding ? 'Adding...' : 'Add Employee'}
              </button>
            </form>
          </div>

          {/* Employees List */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Employees</h2>
            {employees && (employees as Employee[]).length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(employees as Employee[]).map((emp: Employee, idx: number) => (
                  <div key={idx} className="p-3 border rounded">
                    <div className="font-semibold">{emp.wallet.slice(0, 6)}...{emp.wallet.slice(-4)}</div>
                    <div className="text-sm text-gray-600">
                      {formatUnits(emp.basePay, 6)} {emp.payToken === USDC_ADDRESS ? 'USDC' : 'EURC'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {emp.active ? 'Active' : 'Inactive'} • Cycle: {['Monthly', 'Weekly', 'Bi-Weekly', 'Quarterly'][emp.payCycle]}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No employees added yet</p>
            )}
          </div>
        </div>

        {/* Payroll Execution */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Execute Payroll</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Period (YYYY-MM)</label>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Token</label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="p-2 border rounded"
              >
                <option value={USDC_ADDRESS}>USDC</option>
                <option value={EURC_ADDRESS}>EURC</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleCreateBatch}
                disabled={isCreatingBatch || !period}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isCreatingBatch ? 'Creating...' : 'Create Batch'}
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                {isApproving ? 'Approving...' : 'Approve Token'}
              </button>
              <button
                onClick={() => executePayroll({
                  address: PAYROLL_MANAGER_ADDRESS as `0x${string}`,
                  abi: PAYROLL_MANAGER_ABI,
                  functionName: 'executePayroll',
                  args: [1n], // Batch ID - in production, fetch from contract
                })}
                disabled={isExecuting}
                className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {isExecuting ? 'Executing...' : 'Execute Payroll'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

