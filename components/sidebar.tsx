"use client";

import Link from "next/link";
import { usePathname, useSession } from "next-auth/react";
import {
  Clock,
  BookOpen,
  MapPin,
  Calendar,
  Heart,
  MessageSquare,
  Settings,
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
    href: "/admin",
    label: "Admin",
    icon: <Settings size={20} />,
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && session?.user?.role !== "admin") {
      return false;
    }
    return true;
  });

  return (
    <div className="p-4 space-y-2">
      <nav className="space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
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
