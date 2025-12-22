"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, MapPin, Calendar, Heart, Settings, Sparkles } from "lucide-react";

const quickLinks = [
  {
    href: "/eduvia-ai",
    label: "eduvia AI",
    description: "Ask AI anything about your studies",
    icon: <Sparkles className="w-8 h-8" />,
  },
  {
    href: "/notes",
    label: "Course Notes",
    description: "Access shared PDFs from your courses",
    icon: <BookOpen className="w-8 h-8" />,
  },
  {
    href: "/timetable",
    label: "Timetable",
    description: "View your class schedule",
    icon: <Clock className="w-8 h-8" />,
  },
  {
    href: "/classfinder",
    label: "Classroom Finder",
    description: "Find classroom locations",
    icon: <MapPin className="w-8 h-8" />,
  },
  {
    href: "/events",
    label: "Events",
    description: "Upcoming campus events",
    icon: <Calendar className="w-8 h-8" />,
  },
  {
    href: "/lostfound",
    label: "Lost & Found",
    description: "Report or find lost items",
    icon: <Heart className="w-8 h-8" />,
  },
  {
    href: "/settings",
    label: "Profile",
    description: "View and update your profile",
    icon: <Settings className="w-8 h-8" />,
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-neutral-950">
        <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6 p-4 md:p-8 bg-white dark:bg-neutral-950">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Welcome, {session.user?.name}!</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">Get started</p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full hover:border-blue-600 hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <div className="text-blue-500 mb-2">{link.icon}</div>
                <CardTitle className="text-lg">{link.label}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Admin Section */}
      {session.user?.role === "admin" && (
        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold mb-4">Admin Tools</h2>
          <Link href="/admin">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              Go to Admin Dashboard
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
