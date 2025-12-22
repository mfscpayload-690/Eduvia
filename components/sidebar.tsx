"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Clock,
  BookOpen,
  MapPin,
  Calendar,
  Heart,
  Settings,
  Sparkles,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <Clock size={20} />,
  },
  {
    href: "/eduvia-ai",
    label: "eduvia AI",
    icon: <Sparkles size={20} />,
  },
  {
    href: "/notes",
    label: "Notes",
    icon: <BookOpen size={20} />,
  },
  {
    href: "/timetable",
    label: "Timetable",
    icon: <Clock size={20} />,
  },
  {
    href: "/classfinder",
    label: "Classroom Finder",
    icon: <MapPin size={20} />,
  },
  {
    href: "/events",
    label: "Events",
    icon: <Calendar size={20} />,
  },
  {
    href: "/lostfound",
    label: "Lost & Found",
    icon: <Heart size={20} />,
  },
  {
    href: "/settings",
    label: "Profile",
    icon: <Settings size={20} />,
  },
  {
    href: "/admin",
    label: "Admin",
    icon: <Settings size={20} />,
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role;
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  const filteredNavItems = navItems.filter((item) => {
    // Admin only links (accessible by both admin and super_admin)
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <nav className="grid gap-2">
        {filteredNavItems.map((item) => {
          // For /admin specifically, require exact match to avoid highlighting both Admin and Faculty Requests
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                ? "bg-gradient-brand text-white shadow-lg shadow-brand-500/25"
                : "text-muted-foreground hover:bg-neutral-200/50 dark:hover:bg-white/5 hover:text-foreground hover:scale-105"
                }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
