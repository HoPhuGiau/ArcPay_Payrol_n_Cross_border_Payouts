import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding",
      "utf-8-validate",
      "bufferutil",
      "@keystonehq/hw-app-eth", // Proactive ignore
      "ws", // Required for WalletConnect
      "@react-native-async-storage/async-storage" // Required for MetaMask SDK check (react-native check)
    );
    config.optimization.minimize = false; // Workaround for Next.js 16 WebpackError crash
    config.resolve.alias = {
      ...config.resolve.alias,
      "wagmi/chains": "viem/chains",
    };
    return config;
  },
  transpilePackages: ["wagmi", "viem"],
};

export default nextConfig;
