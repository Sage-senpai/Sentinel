/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  images: {
    domains: ['arweave.net', 'arbiscan.io'],
  },
  webpack: (config) => {
    // Required for Three.js
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};

module.exports = nextConfig;
