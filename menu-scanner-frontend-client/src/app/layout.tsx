import type { Metadata } from "next";
import { ClientProviders } from "@/context/client-provider";
import { getMessages } from "next-intl/server";
import localFont from "next/font/local";
import "../styles/globals.css";
import PageProgressBar from "@/components/shared/progress/global-n-progress";
import { LocaleProvider } from "@/context/locale-provider";
import { ScrollToTop } from "@/components/shared/common/scroll-to-top";
import { AuthProvider } from "@/context/auth-provider";
import { ThemeInitializer } from "@/components/shared/theme/theme-initializer";
import { defaultLocale, type Locale } from "@/i18n/request";

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
  title: "Menu Scanner Admin",
  description: "Admin panel for Menu Scanner application",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { locale?: Locale };
}) {
  const locale = params?.locale ?? defaultLocale;
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <ThemeInitializer />
        <LocaleProvider initialLocale={locale} initialMessages={messages}>
          <ClientProviders>
            <AuthProvider>
              <PageProgressBar />
              {children}
              <ScrollToTop />
            </AuthProvider>
          </ClientProviders>
        </LocaleProvider>
      </body>
    </html>
  );
}
