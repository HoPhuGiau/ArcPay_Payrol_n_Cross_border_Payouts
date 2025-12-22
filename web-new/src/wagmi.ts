import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

export const arcTestnet = defineChain({
    id: 5042002,
    name: 'Arc Testnet',
    nativeCurrency: { name: 'Arc', symbol: 'ARC', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.testnet.arc.network'] },
    },
    blockExplorers: {
        default: { name: 'ArcScan', url: 'https://testnet.arcscan.io' },
    },
});

export const config = getDefaultConfig({
    appName: 'Arc Payroll',
    projectId: '3a8170812b534d0ff9d794f19a901d64', // WalletConnect Project ID
    chains: [arcTestnet],
    ssr: true,
});
