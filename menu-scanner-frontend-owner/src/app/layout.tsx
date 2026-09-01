import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ClientProviders } from "@/providers/client-provider";
import { getMessages } from "next-intl/server";
import localFont from "next/font/local";
import "../styles/globals.css";
import PageProgressBar from "@/components/shared/progress/global-n-progress";
import { LocaleProvider } from "@/providers/locale-provider";
import { ScrollToTop } from "@/components/shared/common/scroll-to-top";
import { AuthProvider } from "@/providers/auth-provider";
import { SubdomainProvider } from "@/providers/subdomain-provider";
import { ThemeInitializer } from "@/components/shared/theme/theme-initializer";
import { defaultLocale, type Locale } from "@/i18n/request";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const geistSans = localFont({
  src: "../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    template: "%s | ScanMeKH Owner",
    default: "ScanMeKH - Owner Platform",
  },
  description: "Platform management for ScanMeKH system owners",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: Promise<{ locale?: Locale }>;
}) {
  const resolvedParams = params ? await params : {};
  const locale = resolvedParams.locale ?? defaultLocale;
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/assets/image/scanmekhlogo.png" />
      </head>
      <body className="antialiased">
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
        <ThemeInitializer />
        <LocaleProvider initialLocale={locale} initialMessages={messages}>
          <ClientProviders>
            <SubdomainProvider>
              <AuthProvider>
                <PageProgressBar />
                {children}
                <ScrollToTop />
              </AuthProvider>
            </SubdomainProvider>
          </ClientProviders>
        </LocaleProvider>
      </body>
    </html>
  );
}
