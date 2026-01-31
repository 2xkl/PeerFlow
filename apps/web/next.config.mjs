/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://${process.env.API_HOST || 'dev'}:${process.env.API_PORT || '4000'}/api/:path*`,
      },
      {
        source: '/ws/:path*',
        destination: `http://${process.env.API_HOST || 'dev'}:${process.env.API_PORT || '4000'}/ws/:path*`,
      },
    ];
  },
  transpilePackages: ['@peerflow/shared'],
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: ['**/node_modules/**', '**/.next/**'],
    };
    return config;
  },
};

export default nextConfig;
