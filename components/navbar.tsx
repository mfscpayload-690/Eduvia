"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, LogOut, LogIn, X, Home, Sparkles, BookOpen, Clock, MapPin, Calendar, Heart, Settings, Shield, User, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ResponsiveLogo } from "@/components/logo";
import { NotificationCenter } from "@/components/notifications/notification-center";

const mobileNavItemsBase = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/eduvia-ai", label: "eduvia AI", icon: Sparkles },
  { href: "/notes", label: "Course Notes", icon: BookOpen },
  { href: "/timetable", label: "Timetable", icon: Clock },
  { href: "/classfinder", label: "Classroom Finder", icon: MapPin },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/lostfound", label: "Lost & Found", icon: Heart },
  { href: "/settings", label: "Profile", icon: Settings },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const mobileNavItems = [...mobileNavItemsBase];

  // Add Overview for Super Admin only
  if (session?.user?.role === "super_admin") {
    mobileNavItems.splice(1, 0, { href: "/admin/overview", label: "Overview", icon: BarChart3 });
  }

  if (session?.user?.role === "admin" || session?.user?.role === "super_admin") {
    mobileNavItems.push({ href: "/admin", label: "Admin", icon: Shield });
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3 md:px-6 transition-colors duration-300">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <ResponsiveLogo />
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            <div className="md:hidden">
              {session && <NotificationCenter />}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg transition-colors hover:text-foreground"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <NotificationCenter />
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
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Slide-out */}
      <div className={`fixed top-0 right-0 z-50 h-full w-[280px] bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold text-foreground">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Section */}
        {session && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{session.user?.name}</p>
                <p className="text-xs text-brand-500 capitalize">{session.user?.role?.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-2 space-y-1">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                    : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-foreground"
                    }`}
                >
                  <Icon size={18} className={isActive ? "text-brand-500" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Action */}
        <div className="p-4 border-t border-border">
          {session ? (
            <Button
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
              variant="destructive"
              className="w-full justify-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          ) : (
            <Button
              onClick={() => {
                signIn("google");
                setMobileMenuOpen(false);
              }}
              className="w-full gap-2 bg-gradient-brand hover:opacity-90 text-white border-0"
            >
              <LogIn size={16} />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
