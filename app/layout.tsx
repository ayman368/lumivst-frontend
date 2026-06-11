import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/Layout";
import { AuthProvider } from "./providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "./providers/ThemeProvider";

import QueryProvider from "./providers/QueryProvider";

export const metadata: Metadata = {
  title: "REBH",
  description: "المنصة الشاملة للتحليل المالي وتقييم الأسهم السعودية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AuthProvider>
              <ToastProvider>
                <Layout>
                  {children}
                </Layout>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
