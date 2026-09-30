import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-pixel", display: "swap" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kartik Sharma · Employee Benefits Manager",
  description: "Kartik Sharma’s block-world portfolio: employee benefits, research, and practical digital products.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Kartik Sharma · Employee Benefits Manager",
    description: "People-first benefits work, international research, and practical digital products.",
    url: "/",
    siteName: "Kartik Sharma",
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${pixel.variable}`}>{children}</body>
    </html>
  );
}
