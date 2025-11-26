import type { Metadata } from "next";
import "./globals.css";
import Layout from "../components/Layout";
import { AuthProvider } from "./providers/AuthProvider";

export const metadata: Metadata = {
  title: "LUMIVST",
  description: "المنصة الشاملة للتحليل المالي وتقييم الأسهم السعودية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  );
}








// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import Layout from "../components/Layout";
// import { AuthProvider } from "./providers/AuthProvider";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "LUMIVST",
//   description: "المنصة الشاملة للتحليل المالي وتقييم الأسهم السعودية",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="ar" dir="rtl">
//       <body className={inter.className}>
//         <AuthProvider>
//           <Layout>
//             {children}
//           </Layout>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }














// import './globals.css'
// import Layout from '../components/Layout'


// export const metadata = {
//   title: ' LUMIVST ',
//   description: 'المنصة الشاملة للتحليل المالي وتقييم الأسهم السعودية',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en" dir="ltr">
//       <body  style={{ direction: 'ltr' }}>
//         <Layout>
//           {children}
//         </Layout>
//       </body>
//     </html>
//   )
// }





















// import './globals.css'
// // import { AuthProvider } from './context/AuthContext'
// import Layout from '../components/Layout'

// export const metadata = {
//   title: 'سهم Invest - منصة الاستثمار بالقيمة',
//   description: 'المنصة الشاملة للتحليل المالي وتقييم الأسهم السعودية',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="ar" dir="ltr">
//       <body>
//         {/* <AuthProvider> */}
//           <Layout>
//             {children}
//           </Layout>
//         {/* </AuthProvider> */}
//       </body>
//     </html>
//   )
// }