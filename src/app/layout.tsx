import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WC3 Helper",
  description: "Warcraft III 1v1 Replay & Strategy Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100`}
      >
        <nav className="border-b border-zinc-800 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-6">
            <a href="/" className="text-lg font-bold text-white">
              WC3 Helper
            </a>
            <a
              href="/replays"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Replay Vault
            </a>
            <Link
              href="/maps"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Maps
            </Link>
            <a
              href="/players"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Players
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
