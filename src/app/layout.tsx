import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invoice Builder - Buat & Kelola Invoice",
  description: "Aplikasi Invoice Builder untuk membuat dan mengelola invoice profesional. Export ke PDF dengan format A4.",
  keywords: ["Invoice", "Invoice Builder", "PDF", "Next.js", "TypeScript", "Indonesia"],
  authors: [{ name: "Invoice Builder" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Invoice Builder",
    description: "Buat dan kelola invoice profesional dengan mudah",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
