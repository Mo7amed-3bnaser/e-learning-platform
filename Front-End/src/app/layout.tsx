import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import AuthInitializer from "@/components/AuthInitializer";
import ThemeProvider from "@/components/ThemeProvider";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SkipToMainContent } from "@/lib/accessibility";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "منصة مسار التعليمية",
    template: "%s | مسار التعليمية",
  },
  description: "منصة تعليمية عربية متكاملة تقدم كورسات احترافية في البرمجة والتصميم والأعمال. ابدأ رحلتك التعليمية مع أفضل المدربين.",
  keywords: ["تعليم", "كورسات", "برمجة", "تصميم", "مسار", "تعلم عربي", "دورات تدريبية"],
  authors: [{ name: "فريق مسار" }],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "منصة مسار التعليمية",
    title: "منصة مسار التعليمية",
    description: "منصة تعليمية عربية متكاملة تقدم كورسات احترافية في البرمجة والتصميم والأعمال.",
  },
  twitter: {
    card: "summary_large_image",
    title: "منصة مسار التعليمية",
    description: "منصة تعليمية عربية متكاملة تقدم كورسات احترافية في البرمجة والتصميم والأعمال.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD Structured Data for the platform
const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "منصة مسار التعليمية",
  description: "منصة تعليمية عربية متكاملة تقدم كورسات احترافية",
  url: typeof window !== "undefined" ? window.location.origin : "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('masar-theme');if(s){var p=JSON.parse(s);if(p&&p.state&&p.state.theme==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}else document.documentElement.classList.remove('dark');}catch(e){document.documentElement.classList.remove('dark');}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <ThemeProvider>
            <SkipToMainContent />
            <AuthInitializer>
              {children}
            </AuthInitializer>
            <ScrollToTop />
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  border: '1px solid var(--foreground)',
                },
              }}
            />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
