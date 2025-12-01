/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Disable SWC if having issues
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      // Fix for MetaMask SDK trying to use React Native modules
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
}

module.exports = nextConfig

