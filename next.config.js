/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  transpilePackages: ['lucide-react']
};
module.exports = nextConfig;
