/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for GitHub Pages
  images: {
    unoptimized: true, // Disable Next.js image optimization for static export
  },
  basePath: '/Job-Finder-App', // 👈 your repo name here
  assetPrefix: '/Job-Finder-App/',
};

module.exports = nextConfig;
