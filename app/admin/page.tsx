"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, BookOpen, CalendarClock, CalendarDays, Package, Shield, LucideIcon } from "lucide-react";

interface AdminTile {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isSuperAdmin?: boolean;
}

const baseTiles: AdminTile[] = [
  { href: "/admin/notes", title: "Notes", description: "Upload and manage study notes", icon: BookOpen },
  { href: "/admin/timetable", title: "Timetable", description: "Manage class schedules", icon: CalendarClock },
  { href: "/admin/events", title: "Events", description: "Create and edit events", icon: CalendarDays },
  { href: "/admin/lostfound", title: "Lost & Found", description: "Review and update items", icon: Package },
];

const superAdminTiles: AdminTile[] = [
  { href: "/admin/faculty-requests", title: "Faculty Requests", description: "Approve faculty access requests", icon: Shield, isSuperAdmin: true },
];

export default function AdminPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "super_admin";

  // Combine tiles based on role
  const tiles = isSuperAdmin ? [...baseTiles, ...superAdminTiles] : baseTiles;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8 text-brand-500" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Manage campus data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiles.map(({ href, title, description, icon: Icon, isSuperAdmin: isSuperAdminTile }) => (
          <Link key={href} href={href} className="group">
            <Card className={`h-full border-neutral-200 transition hover:shadow-lg dark:border-neutral-800 ${isSuperAdminTile
              ? "hover:border-brand-500 dark:hover:border-brand-400 bg-gradient-to-br from-brand-500/5 to-accent-500/5"
              : "hover:border-blue-500 dark:hover:border-blue-400"
              }`}>
              <CardContent className="pt-6 pb-8 px-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`rounded-md p-2 ${isSuperAdminTile
                    ? "bg-brand-500/10 text-brand-500"
                    : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
                    }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{title}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
                  </div>
                </div>
                <p className={`text-sm group-hover:underline ${isSuperAdminTile ? "text-brand-500" : "text-blue-600 dark:text-blue-300"
                  }`}>
                  Open
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
