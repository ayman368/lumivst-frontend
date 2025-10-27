import './globals.css'
import Layout from '../components/Layout'

export const metadata = {
  title: ' LUMIVST ',
  description: 'المنصة الشاملة للتحليل المالي وتقييم الأسهم السعودية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  )
}




























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
//     <html lang="ar" dir="rtl">
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