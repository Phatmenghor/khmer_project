import type { Metadata } from "next";
import Script from "next/script";
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
        {/* Apply theme colors synchronously BEFORE React renders to prevent color flash */}
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Get business ID from localStorage, or use default
                  const businessId = localStorage.getItem('businessId') || '550cad56-cafd-4aba-baef-c4dcd53940d0';
                  console.log('[THEME SYNC] Checking cache for business ID:', businessId);

                  // Try localStorage FIRST (fast, synchronous) for instant color application
                  const localStorageKey = 'theme_colors_' + businessId;
                  let cachedColors = null;

                  try {
                    const localStorageValue = localStorage.getItem(localStorageKey);
                    if (localStorageValue) {
                      cachedColors = JSON.parse(localStorageValue);
                      console.log('[THEME SYNC] Found colors in localStorage');
                    }
                  } catch (e) {
                    console.warn('[THEME SYNC] Error reading localStorage:', e);
                  }

                  // Fall back to cookie if localStorage doesn't have it
                  if (!cachedColors) {
                    const cookieName = 'theme_colors_' + businessId;
                    const cookies = document.cookie.split(';');
                    for (let cookie of cookies) {
                      cookie = cookie.trim();
                      if (cookie.startsWith(cookieName + '=')) {
                        const value = decodeURIComponent(cookie.substring((cookieName + '=').length));
                        cachedColors = JSON.parse(value);
                        console.log('[THEME SYNC] Found colors in cookie');
                        break;
                      }
                    }
                  }

                  if (!cachedColors) {
                    console.log('[THEME SYNC] No cached business data found, showing blank');
                    return;
                  }

                  // Store business data globally for React to access before Redux loads
                  window.__cachedBusinessData = {
                    businessName: cachedColors.businessName,
                    logoBusinessUrl: cachedColors.logoBusinessUrl,
                    primaryColor: cachedColors.primaryColor,
                  };
                  console.log('[THEME SYNC] Cached business data available globally:', window.__cachedBusinessData);

                  // Convert hex to HSL
                  function hexToHsl(hex) {
                    if (!hex) return '';
                    hex = hex.replace('#', '');
                    const r = parseInt(hex.substring(0, 2), 16) / 255;
                    const g = parseInt(hex.substring(2, 4), 16) / 255;
                    const b = parseInt(hex.substring(4, 6), 16) / 255;

                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    let h = 0, s = 0;
                    const l = (max + min) / 2;

                    if (max !== min) {
                      const d = max - min;
                      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                      switch (max) {
                        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                        case g: h = ((b - r) / d + 2) / 6; break;
                        case b: h = ((r - g) / d + 4) / 6; break;
                      }
                    }

                    const hue = Math.round(h * 360);
                    const saturation = Math.round(s * 100);
                    const lightness = Math.round(l * 100);
                    return hue + ' ' + saturation + '% ' + lightness + '%';
                  }

                  // Apply colors AND business data BEFORE React renders
                  const style = document.createElement('style');
                  style.id = 'theme-colors-sync';
                  let styleText = '';

                  // Apply primary color if available
                  if (cachedColors.primaryColor) {
                    styleText += ':root{--primary:' + hexToHsl(cachedColors.primaryColor) + ';}';
                  }

                  style.textContent = styleText;
                  if (styleText) {
                    document.head.insertBefore(style, document.head.firstChild);
                  }

                  console.log('[THEME SYNC] All cached data applied synchronously BEFORE React renders');
                  console.log('[THEME SYNC] Business name:', cachedColors.businessName);
                  console.log('[THEME SYNC] Logo URL:', cachedColors.logoBusinessUrl);
                } catch (e) {
                  console.error('[THEME SYNC] Error:', e);
                }
              })();
            `,
          }}
        />
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
