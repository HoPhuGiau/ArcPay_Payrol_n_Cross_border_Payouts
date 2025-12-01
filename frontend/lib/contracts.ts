// Contract ABIs and addresses
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x3600000000000000000000000000000000000000';
export const EURC_ADDRESS = process.env.NEXT_PUBLIC_EURC_ADDRESS || '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';

export const COMPANY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_COMPANY_REGISTRY_ADDRESS || '';
export const PAYROLL_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS || '';

// ERC20 ABI (minimal for transfer, approve, balanceOf)
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
] as const;

// CompanyRegistry ABI
export const COMPANY_REGISTRY_ABI = [
  {
    inputs: [{ internalType: 'string', name: 'metadataHash', type: 'string' }],
    name: 'registerCompany',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'companyId', type: 'uint256' },
      { internalType: 'string', name: 'metadataHash', type: 'string' },
    ],
    name: 'setCompanyMeta',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'companyId', type: 'uint256' }],
    name: 'getCompany',
    outputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'string', name: 'metadataHash', type: 'string' },
      { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'getOwnerCompanies',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// PayrollManager ABI
export const PAYROLL_MANAGER_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'companyId', type: 'uint256' },
      { internalType: 'address', name: 'wallet', type: 'address' },
      { internalType: 'uint256', name: 'basePay', type: 'uint256' },
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint8', name: 'cycle', type: 'uint8' },
    ],
    name: 'addEmployee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'companyId', type: 'uint256' },
      { internalType: 'uint256', name: 'period', type: 'uint256' },
      { internalType: 'address', name: 'token', type: 'address' },
    ],
    name: 'createPayrollBatch',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'batchId', type: 'uint256' }],
    name: 'executePayroll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'companyId', type: 'uint256' }],
    name: 'getCompanyEmployees',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'wallet', type: 'address' },
          { internalType: 'uint256', name: 'basePay', type: 'uint256' },
          { internalType: 'address', name: 'payToken', type: 'address' },
          { internalType: 'uint8', name: 'payCycle', type: 'uint8' },
          { internalType: 'bool', name: 'active', type: 'bool' },
          { internalType: 'uint256', name: 'addedAt', type: 'uint256' },
        ],
        internalType: 'struct PayrollManager.Employee[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'employeeAddress', type: 'address' }],
    name: 'getEmployeePayments',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'batchId', type: 'uint256' },
          { internalType: 'address', name: 'employee', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'bool', name: 'paid', type: 'bool' },
          { internalType: 'uint256', name: 'paidAt', type: 'uint256' },
        ],
        internalType: 'struct PayrollManager.PaymentRecord[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'batchId', type: 'uint256' }],
    name: 'payrollBatches',
    outputs: [
      { internalType: 'uint256', name: 'companyId', type: 'uint256' },
      { internalType: 'uint256', name: 'period', type: 'uint256' },
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'totalAmount', type: 'uint256' },
      { internalType: 'bool', name: 'executed', type: 'bool' },
      { internalType: 'uint256', name: 'executedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'employeeCount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

