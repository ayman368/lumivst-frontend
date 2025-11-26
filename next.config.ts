// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   // إعدادات فارغة مؤقتاً
// };

// export default nextConfig;


// ✅ الإصدار المصحح
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  // ⭐ لا تضع NEXT_PUBLIC_API_URL هنا
  env: {
    // اتركه فارغاً أو احذف السطر تماماً
  },
  // إعدادات أداء
  poweredByHeader: false,
  compress: true,
  // إعدادات الصور إذا كنت تستخدمها
  images: {
    domains: ['your-domain.com'],
  },
}

module.exports = nextConfig