import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Providers } from "./providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Smart Campus Assistant",
  description: "Your all-in-one campus companion",
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
      <body className="bg-neutral-950 text-neutral-100">
        <Providers>
          <div className="flex min-h-screen flex-col md:flex-row">
            {/* Sidebar - Hidden on mobile */}
            <aside className="hidden w-64 border-r border-neutral-800 md:block">
              <Sidebar />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Top Navbar */}
              <Navbar />

              {/* Page Content */}
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
