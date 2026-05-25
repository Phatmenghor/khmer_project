import type { Metadata } from "next";
import Script from "next/script";
import { ClientProviders } from "@/providers/client-provider";
import { getMessages } from "next-intl/server";
import localFont from "next/font/local";
import "../styles/globals.css";
import PageProgressBar from "@/components/shared/progress/global-n-progress";
import { LocaleProvider } from "@/providers/locale-provider";
import { ScrollToTop } from "@/components/shared/common/scroll-to-top";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeInitializer } from "@/components/shared/theme/theme-initializer";
import { defaultLocale, type Locale } from "@/i18n/request";
import { buildMetadata } from "@/utils/metadata/metadata-builder";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;


declare global {
  interface Window {
    __cachedBusinessData?: {
      businessName?: string;
      logoBusinessUrl?: string;
      primaryColor?: string;
      taxPercentage?: number;
    };
  }
}

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

export const metadata: Metadata = buildMetadata(
  BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
);

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
        <link rel="icon" href="/favicon.ico" />
        {/* Synchronously apply cached theme before React mounts — eliminates flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
var bid=localStorage.getItem('businessId')||'550cad56-cafd-4aba-baef-c4dcd53940d0';
var cached=null;
try{var v=localStorage.getItem('theme_colors_'+bid);if(v)cached=JSON.parse(v);}catch(e){}
if(!cached){try{var cs=document.cookie.split(';');for(var i=0;i<cs.length;i++){var c=cs[i].trim();var k='theme_colors_'+bid+'=';if(c.indexOf(k)===0){cached=JSON.parse(decodeURIComponent(c.substring(k.length)));break;}}}catch(e){}}
if(!cached)return;
window.__cachedBusinessData={businessName:cached.businessName,logoBusinessUrl:cached.logoBusinessUrl,primaryColor:cached.primaryColor,taxPercentage:cached.taxPercentage};
if(cached.primaryColor){var hex=cached.primaryColor.replace('#','');var r=parseInt(hex.substring(0,2),16)/255,g=parseInt(hex.substring(2,4),16)/255,b=parseInt(hex.substring(4,6),16)/255;var max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2,s=0,h=0;if(max!==min){s=l>0.5?(max-min)/(2-max-min):(max-min)/(max+min);if(max===r)h=((g-b)/(max-min)+(g<b?6:0))/6;else if(max===g)h=((b-r)/(max-min)+2)/6;else h=((r-g)/(max-min)+4)/6;}document.documentElement.style.setProperty('--primary',Math.round(h*360)+' '+Math.round(s*100)+'% '+Math.round(l*100)+'%');}
}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
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
