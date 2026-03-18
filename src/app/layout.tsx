import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL =
  process.env.APP_URL?.replace(/\/$/, "") ??
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://gencontent.ai";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "GenContent AI",
    template: "%s | GenContent AI",
  },
  description: "AI-powered newsletter and content automation platform. Create, publish, and distribute content across email, blog, and social channels.",
  keywords: ["AI newsletter", "content automation", "blog generator", "email marketing", "AI writing"],
  openGraph: {
    type: "website",
    siteName: "GenContent AI",
    title: "GenContent AI",
    description: "AI-powered newsletter and content automation platform.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "GenContent AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GenContent AI",
    description: "AI-powered newsletter and content automation platform.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
