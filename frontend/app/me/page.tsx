'use client';

import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { PAYROLL_MANAGER_ADDRESS, PAYROLL_MANAGER_ABI, USDC_ADDRESS, EURC_ADDRESS } from '@/lib/contracts';
import { formatUnits } from 'viem';

type PaymentRecord = {
  batchId: bigint;
  employee: string;
  amount: bigint;
  token: string;
  paid: boolean;
  paidAt: bigint;
};

export default function MePage() {
  const { address, isConnected } = useAccount();

  const { data: payments } = useReadContract({
    address: PAYROLL_MANAGER_ADDRESS as `0x${string}`,
    abi: PAYROLL_MANAGER_ABI,
    functionName: 'getEmployeePayments',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!PAYROLL_MANAGER_ADDRESS },
  });

  if (!isConnected) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Payments</h1>
            <ConnectButton />
          </div>
          <div className="text-center p-12 bg-gray-50 rounded-lg">
            <p className="text-lg">Please connect your wallet to view your payments</p>
          </div>
        </div>
      </main>
    );
  }

  const paymentRecords = payments as PaymentRecord[] | undefined;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Payments</h1>
          <ConnectButton />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
          
          {paymentRecords && paymentRecords.length > 0 ? (
            <div className="space-y-4">
              {paymentRecords.map((payment, idx) => {
                const tokenSymbol = payment.token.toLowerCase() === USDC_ADDRESS.toLowerCase() 
                  ? 'USDC' 
                  : payment.token.toLowerCase() === EURC_ADDRESS.toLowerCase() 
                  ? 'EURC' 
                  : 'TOKEN';
                
                const amount = formatUnits(payment.amount, 6);
                const paidDate = payment.paidAt > 0n 
                  ? new Date(Number(payment.paidAt) * 1000).toLocaleDateString()
                  : 'Pending';

                return (
                  <div key={idx} className="p-4 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">
                          {amount} {tokenSymbol}
                        </div>
                        <div className="text-sm text-gray-600">
                          Batch #{payment.batchId.toString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {payment.paid ? `Paid on ${paidDate}` : 'Pending payment'}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded text-sm ${
                        payment.paid 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payment.paid ? 'Paid' : 'Pending'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-12 text-gray-600">
              <p className="text-lg mb-2">No payment records found</p>
              <p className="text-sm">
                Payments will appear here once your company executes payroll for you.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">About Your Payments</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>All payments are made onchain using USDC or EURC</li>
            <li>Payments finalize in less than 1 second on Arc</li>
            <li>Transaction fees are predictable and paid in USDC</li>
            <li>You can view all transactions on ArcScan</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

