const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'arweave.net' },
      { protocol: 'https', hostname: 'arbiscan.io' },
    ],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    // Fix @motionone/utils resolution for nested @walletconnect/modal
    config.resolve.alias = {
      ...config.resolve.alias,
      '@motionone/utils': path.resolve(__dirname, 'node_modules/@motionone/utils'),
    };
    return config;
  },
};

module.exports = nextConfig;
