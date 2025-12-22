'use client';

import { useState, useEffect } from 'react';
import { useConnect, useAccount } from 'wagmi';

export function DebugOverlay() {
    const [mounted, setMounted] = useState(false);
    const { connect, connectors } = useConnect();
    const { isConnected, address } = useAccount();

    useEffect(() => {
        setMounted(true);
        console.log("DebugOverlay Mounted");
    }, []);

    if (!mounted) return <div className="fixed bottom-4 right-4 bg-yellow-500 p-2 z-[9999]">Loading Debug...</div>;

    return (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-xl z-[9999] max-w-sm border-2 border-green-500 shadow-2xl">
            <h3 className="font-bold text-green-400 mb-2">CRITICAL SYSTEM CHECK</h3>

            <div className="space-y-2 text-xs font-mono mb-4">
                <p>JS Running: <span className="text-green-500">YES</span></p>
                <p>Wagmi Connected: <span className={isConnected ? "text-green-500" : "text-red-500"}>{isConnected ? 'YES' : 'NO'}</span></p>
                <p>Address: {address || 'None'}</p>
            </div>

            <div className="flex flex-col gap-2">
                <button
                    onClick={() => alert('SIMPLE CLICK WORKING')}
                    className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded text-center w-full"
                >
                    1. Test Simple Click (Alert)
                </button>

                {connectors.map(c => (
                    <button
                        key={c.uid}
                        onClick={() => {
                            console.log("Overlay Connect:", c.name);
                            connect({ connector: c });
                        }}
                        className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-center w-full"
                    >
                        Connect {c.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
