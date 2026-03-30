import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Job Application Hub | TheJobHelpers",
  description: "Find your dream job with TheJobHelpers — powered by LinkedIn, Indeed, and Google job search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-linear-to-br from-[#020617] via-[#020617] to-[#0f172a] text-zinc-50 min-h-[100dvh]`}
      >
        <div className="relative overflow-hidden min-h-[100dvh]">
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-40 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
          </div>

          {children}
        </div>
      </body>
    </html>
  );
}
