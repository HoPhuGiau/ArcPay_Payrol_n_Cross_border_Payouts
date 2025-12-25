'use client';

import * as React from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { config } from '../wagmi';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);

        // Suppress ethereum-related errors from wallet extensions
        const originalError = console.error;
        console.error = (...args) => {
            const errorMessage = args[0]?.toString() || '';
            // Filter out wallet extension conflicts
            if (
                errorMessage.includes('Cannot redefine property: ethereum') ||
                errorMessage.includes('evmAsk.js') ||
                errorMessage.includes('chrome-extension://') && errorMessage.includes('ethereum')
            ) {
                return; // Suppress this error
            }
            originalError.apply(console, args);
        };

        // Also handle uncaught errors
        const handleError = (event: ErrorEvent) => {
            if (
                event.message?.includes('Cannot redefine property: ethereum') ||
                event.filename?.includes('chrome-extension://')
            ) {
                event.preventDefault();
                return true;
            }
        };

        window.addEventListener('error', handleError);

        return () => {
            console.error = originalError;
            window.removeEventListener('error', handleError);
        };
    }, []);

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider modalSize="compact">
                    {mounted ? children : null}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

