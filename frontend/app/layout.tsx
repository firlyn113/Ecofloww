import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ClientErrorBoundary from "@/src/components/features/ClientErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoFlow - Asisten Cerdas Fermentasi Eco-Enzyme",
  description: "Platform pemantauan fermentasi dan rekomendasi produk turunan eco-enzyme berbasis AI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EcoFlow AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#15803D",
  width: "device-width",
  initialScale: 1,
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
