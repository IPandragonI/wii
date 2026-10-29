import type { Metadata, Viewport } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import localFont from "next/font/local";

import { Providers } from "@/components/Providers";
import { displayName, profile } from "@/config/profile";
import { siteUrl } from "@/config/site";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${rounded.variable} ${segments.variable} antialiased`} data-cursor="hand" data-motion="system">
      <body className="min-h-dvh overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
