import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { Providers } from "./providers";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "eduvia",
  description: "Your all-in-one campus companion",
  icons: {
    icon: "/assets/eduvia_favicon.png",
    shortcut: "/assets/eduvia_favicon.png",
    apple: "/assets/eduvia_favicon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
