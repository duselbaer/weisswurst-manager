import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AdBanner from "@/components/AdBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weißwurst-Manager 🥨",
  description: "Die beste App zum Verwalten von bayerischen Frühstücken",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-black">
        <Navbar />
        <div className="max-w-6xl mx-auto w-full px-4 pt-4">
          <AdBanner type="small" />
        </div>
        {children}
      </body>
    </html>
  );
}
