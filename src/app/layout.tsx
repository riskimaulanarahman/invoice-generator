import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteUrl = rawSiteUrl
  ? rawSiteUrl.startsWith("http://") || rawSiteUrl.startsWith("https://")
    ? rawSiteUrl
    : `https://${rawSiteUrl}`
  : "http://localhost:3000";
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Invoice Generator Gratis - Buat Invoice Online",
    template: "%s | Invoice Generator Gratis",
  },
  description:
    "Invoice Generator adalah aplikasi invoice online gratis untuk membuat, mengelola, dan export invoice PDF format A4 dengan cepat.",
  keywords: [
    "invoice generator gratis",
    "aplikasi invoice online gratis",
    "buat invoice gratis",
    "invoice PDF A4",
    "sistem invoice gratis Indonesia",
  ],
  applicationName: "Invoice Generator Gratis",
  authors: [{ name: "Invoice Generator" }],
  creator: "Invoice Generator",
  publisher: "Invoice Generator",
  category: "business",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: googleVerification
    ? {
        google: googleVerification,
      }
    : undefined,
  icons: {
    icon: [{ url: "/toga-icon.png", type: "image/png" }],
    shortcut: "/toga-icon.png",
    apple: "/toga-icon.png",
  },
  openGraph: {
    title: "Invoice Generator Gratis - Buat Invoice Online",
    description:
      "Sistem invoice gratis untuk UMKM dan freelancer. Buat, simpan, dan export invoice PDF dengan mudah.",
    url: "/",
    siteName: "Invoice Generator Gratis",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoice Generator Gratis - Buat Invoice Online",
    description:
      "Sistem invoice gratis untuk membuat invoice profesional dan export ke PDF.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const webAppStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Invoice Generator Gratis",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Aplikasi invoice online gratis untuk membuat dan mengelola invoice profesional.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
      description: "Gratis digunakan",
    },
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webAppStructuredData),
          }}
        />
        {children}
        <footer className="border-t border-border bg-background/95 px-4 py-3 text-center text-sm text-muted-foreground">
          <p>
            Instagram:{" "}
            <a
              href="https://instagram.com/togoldarea"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              @togoldarea
            </a>{" "}
            | Website:{" "}
            <a
              href="https://www.togoldarea.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              www.togoldarea.com
            </a>
          </p>
        </footer>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
