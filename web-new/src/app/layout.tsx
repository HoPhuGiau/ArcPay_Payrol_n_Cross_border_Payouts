import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Arc Payroll",
    description: "Payroll & Cross-border Payouts on Arc Network",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <Navbar />
                    {children}
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            duration: 5000,
                            style: {
                                background: '#18181b',
                                color: '#fafafa',
                                border: '1px solid #27272a',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#22c55e',
                                    secondary: '#fafafa',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fafafa',
                                },
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}

