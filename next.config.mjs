/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  images: {
    domains: ['your-domain.com', 'images-na.ssl-images-amazon.com', 'images.amazon.com'],
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