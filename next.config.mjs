/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['your-domain.com'],
  },
}

export default nextConfig







// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   output: 'standalone',
//   trailingSlash: true,
//   poweredByHeader: false,
//   compress: true,
//   images: {
//     domains: ['your-domain.com'],
//   },
// };

// export default nextConfig;