import type { Metadata, Viewport } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SplashScreen } from "@/components/providers/SplashScreen";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["italic"],
  weight: ["400", "700"],
  display: "swap",
});

const APP_NAME = "me&who";
const APP_DESCRIPTION =
  "La piattaforma che connette startupper, ricercatori e persone con idee. Scopri chi c'è vicino a te e costruisci qualcosa insieme.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://mewho.it"),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: ["startup", "ricerca", "innovazione", "comunità", "idee", "collaborazione", "social network", "mewho", "me&who"],
  authors: [{ name: "me&who", url: "https://mewho.it" }],
  creator: "me&who",
  publisher: "me&who",
  openGraph: {
    type: "website",
    locale: "it_IT",
    alternateLocale: ["en_US"],
    url: "https://mewho.it",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    site: "@meandwho",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF4A24",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${outfit.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased" style={{ fontFamily: "var(--fh)" }}>
        <ThemeProvider>
          <SplashScreen />
          {children}
          <Toaster position="bottom-center" richColors />
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-T2RZCRXN6K" />
    </html>
  );
}
