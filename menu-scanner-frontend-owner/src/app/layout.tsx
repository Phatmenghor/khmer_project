// src/app/layout.tsx
import type { Viewport } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import { ReactNode } from "react";
import Script from "next/script";
import PageProgressBar from "@/components/shared/progressbar/global-n-progress";
import { ClientProviders } from "@/context/client-provider";
import { appImages } from "@/constants/app-resource/icons/app-images";

const geistSans = localFont({
  src: "../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const geistMono = localFont({
  src: "../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular"],
});

interface RootLayoutProps {
  children: ReactNode;
}

// Enhanced metadata (removed viewport - now separate export)
export const metadata = {
  ...(process.env.NEXT_PUBLIC_APP_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL) }
    : {}),
  title: {
    template: "%s | ScanMeKH",
    default: "ScanMeKH - Professional Restaurant Management",
  },
  description:
    "Professional dashboard for menu scanning and restaurant management",
  keywords: ["dashboard", "menu", "scanner", "management", "restaurant"],
  authors: [{ name: "ScanMeKH" }],
  creator: "ScanMeKH",
  publisher: "ScanMeKH",
  icons: {
    icon: appImages.myLogo,
    shortcut: appImages.myLogo,
    apple: appImages.myLogo,
  },
  openGraph: {
    title: "ScanMeKH",
    description:
      "Professional dashboard for menu scanning and restaurant management",
    images: [{ url: appImages.myLogo }],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: false, // Since this is a private dashboard
    follow: false,
  },
};

// Mobile-first viewport: respect iPhone safe area + let layout resize
// when the soft keyboard opens.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
  interactiveWidget: "resizes-content",
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href={appImages.myLogo} />
        <link rel="preconnect" href="http://165.22.247.142:8080" />
        <link rel="dns-prefetch" href="http://165.22.247.142:8080" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`
          min-h-screen
          bg-background
          font-sans
          antialiased
          text-foreground
          selection:bg-primary/20
          selection:text-primary-foreground
          overflow-x-hidden
        `}
      >
        {/* Google Analytics — only loads when NEXT_PUBLIC_GA_MEASUREMENT_ID is set */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <ClientProviders>
          <PageProgressBar />
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
