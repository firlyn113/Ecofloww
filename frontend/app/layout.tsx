import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ClientErrorBoundary from "@/components/ClientErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoFlow - Smart Eco-Enzyme Assistant",
  description: "AI-powered fermentation monitoring and product recommendation platform",
  manifest: "/manifest.json",
  themeColor: "#15803D",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EcoFlow AI",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClientErrorBoundary>
          <Providers>{children}</Providers>
        </ClientErrorBoundary>
      </body>
    </html>
  );
}
