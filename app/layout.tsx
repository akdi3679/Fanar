import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VisitorTracker } from "@/components/VisitorTracker";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Fanar — Web Studio",
  description: "Fast, secure websites built with psychology to turn visitors into clients.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}