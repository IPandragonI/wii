import type { Metadata, Viewport } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import localFont from "next/font/local";

import { Providers } from "@/components/Providers";
import { displayName, profile } from "@/config/profile";
import { siteUrl } from "@/config/site";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/config";

import "./globals.css";

const rounded = M_PLUS_Rounded_1c({
  variable: "--font-rounded",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

/** Seven-segment LCD digits for the clock. DSEG by keshikan, SIL Open Font License 1.1 (see fonts/DSEG-LICENSE.txt). */
const segments = localFont({
  src: "./fonts/DSEG7Classic-Bold.woff2",
  variable: "--font-dseg",
  display: "block",
  preload: true,
});

const description = `${profile.role} portfolio, presented as an interactive console-style channel menu.`;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: `${displayName()} – Channel Menu`, template: `%s · ${displayName()}` },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: displayName(),
    title: displayName(),
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f4f5f7",
  colorScheme: "light",
};

const LANG_SCRIPT = `(function(){var p=location.pathname,l=${JSON.stringify(LOCALES.filter((l) => l !== DEFAULT_LOCALE))};for(var i=0;i<l.length;i++){if(p==="/"+l[i]||p.indexOf("/"+l[i]+"/")===0){document.documentElement.lang=l[i];}}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning className={`${rounded.variable} ${segments.variable} antialiased`} data-cursor="hand" data-motion="system">
      <body className="min-h-dvh overflow-x-hidden">
        {/* Pages are prerendered once, so the document language is set from the URL before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: LANG_SCRIPT }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
