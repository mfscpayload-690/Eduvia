"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ResponsiveLogo } from "@/components/logo";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileNavItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/eduvia-ai", label: "eduvia AI" },
    { href: "/notes", label: "Course Notes" },
    { href: "/timetable", label: "Timetable" },
    { href: "/classfinder", label: "Classroom Finder" },
    { href: "/events", label: "Events" },
    { href: "/lostfound", label: "Lost & Found" },
    { href: "/settings", label: "Profile" },
  ];

  if (session?.user?.role === "admin") {
    mobileNavItems.push({ href: "/admin", label: "Admin" });
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3 md:px-6 transition-colors duration-300">
      <div className="flex items-center justify-between">
        {/* Logo / Brand - Responsive: Full text (desktop) + Icon (mobile) */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <ResponsiveLogo />
        </Link>

        {/* Right Section (theme + mobile menu) */}
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-white/5 rounded-md transition-colors hover:text-foreground"
            aria-label="Toggle mobile menu"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <ThemeToggle />
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">{session.user?.name}</span>
                <span className="text-xs text-brand-600 dark:text-brand-400 capitalize">{session.user?.role}</span>
              </div>
              <Button
                onClick={() => signOut()}
                size="sm"
                variant="destructive"
                className="gap-2 shadow-lg hover:shadow-red-500/25 transition-all"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={() => signIn("google")}
              size="sm"
              className="gap-2 bg-gradient-brand hover:opacity-90 text-white border-0"
            >
              <LogIn size={16} />
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mt-4 space-y-2 md:hidden pb-4 border-t border-white/5 pt-4">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full px-4 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}

          {session ? (
            <div className="pt-2 border-t border-white/5 mt-2 space-y-3">
              <div className="px-2">
                <div className="text-sm font-medium text-white">{session.user?.name}</div>
                <div className="text-xs text-brand-400">{session.user?.role}</div>
              </div>
              <Button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                size="sm"
                variant="destructive"
                className="w-full justify-start gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                signIn("google");
                setMobileMenuOpen(false);
              }}
              size="sm"
              className="w-full gap-2 bg-gradient-brand hover:opacity-90 text-white border-0 mt-4"
            >
              <LogIn size={16} />
              Sign In
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
