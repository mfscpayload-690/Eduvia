"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { BackHomeButton } from "@/components/back-home";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith("/auth");

  if (isAuthRoute) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background transition-colors duration-300">
      <aside className="hidden w-72 border-r border-border md:block sticky top-0 h-screen overflow-y-auto bg-background/50 backdrop-blur-xl z-30">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">{children}</main>
        <BackHomeButton />
      </div>
    </div>
  );
}
