/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://43.224.183.133:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
