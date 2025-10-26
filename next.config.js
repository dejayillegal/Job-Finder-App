/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/Job-Finder-App',
  assetPrefix: '/Job-Finder-App/',
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({ 'better-sqlite3': 'commonjs better-sqlite3' });
    }
    return config;
  },
};

module.exports = nextConfig;
