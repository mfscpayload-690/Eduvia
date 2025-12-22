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
    <nav className="border-b border-neutral-200 bg-white px-4 py-2 md:px-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        {/* Logo / Brand - Responsive: Full text (desktop) + Icon (mobile) */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <ResponsiveLogo size="lg" />
        </Link>

        {/* Right Section (theme + mobile menu) */}
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors dark:text-neutral-300 dark:hover:bg-neutral-800"
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
              <span className="text-sm text-neutral-400">{session.user?.name}</span>
              <Button
                onClick={() => signOut()}
                size="sm"
                className="gap-2 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30 hover:shadow-[0_0_0_8px_rgba(248,113,113,0.35)] focus:ring-2 focus:ring-red-300"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={() => signIn("google")}
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <LogIn size={16} />
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mt-4 space-y-2 md:hidden pb-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full px-3 py-2 rounded-md text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              {item.label}
            </Link>
          ))}

          {session ? (
            <>
              <div className="text-sm text-neutral-400 px-2">{session.user?.name}</div>
              <Button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                size="sm"
                className="w-full justify-start gap-2 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30 hover:shadow-[0_0_0_8px_rgba(248,113,113,0.35)] focus:ring-2 focus:ring-red-300"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                signIn("google");
                setMobileMenuOpen(false);
              }}
              size="sm"
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
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
