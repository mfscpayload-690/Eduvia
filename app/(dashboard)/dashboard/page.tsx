"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, MapPin, Calendar, Heart, Settings, Sparkles, Shield } from "lucide-react";

const quickLinks = [
  {
    href: "/eduvia-ai",
    label: "eduvia AI",
    description: "Ask AI anything about your studies",
    icon: <Sparkles className="w-6 h-6" />,
    color: "text-purple-400",
  },
  {
    href: "/notes",
    label: "Course Notes",
    description: "Access shared PDFs from your courses",
    icon: <BookOpen className="w-6 h-6" />,
    color: "text-brand-400",
  },
  {
    href: "/timetable",
    label: "Timetable",
    description: "View your class schedule",
    icon: <Clock className="w-6 h-6" />,
    color: "text-emerald-400",
  },
  {
    href: "/classfinder",
    label: "Classroom Finder",
    description: "Find classroom locations",
    icon: <MapPin className="w-6 h-6" />,
    color: "text-amber-400",
  },
  {
    href: "/events",
    label: "Events",
    description: "Upcoming campus events",
    icon: <Calendar className="w-6 h-6" />,
    color: "text-rose-400",
  },
  {
    href: "/lostfound",
    label: "Lost & Found",
    description: "Report or find lost items",
    icon: <Heart className="w-6 h-6" />,
    color: "text-pink-400",
  },
  {
    href: "/settings",
    label: "Profile",
    description: "View and update your profile",
    icon: <Settings className="w-6 h-6" />,
    color: "text-neutral-400",
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="relative space-y-8 p-4 md:p-8">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 -z-10 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl filter" />
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl filter" />

      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-heading">
          Welcome back, <span className="text-gradient">{session.user?.name}</span>
        </h1>
        <p className="text-neutral-400 max-w-lg">
          Here's what's happening on campus today.
        </p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="glass-card h-full border-white/5 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:border-brand-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group">
              <CardHeader className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`inline-flex p-3 rounded-xl bg-white/5 ring-1 ring-white/10 transition-colors group-hover:bg-brand-500/10 ${link.color}`}>
                    {link.icon}
                  </div>
                  <CardTitle className="text-xl font-heading mb-0">{link.label}</CardTitle>
                </div>
                <CardDescription className="text-neutral-400 transition-colors group-hover:text-neutral-300">
                  {link.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Admin Section */}
      {(session.user as any).role === "admin" && (
        <div className="mt-8 pt-8 border-t border-neutral-800">
          <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-500" />
            Admin Tools
          </h2>
          <Link href="/admin">
            <Button size="lg" className="gap-2 bg-gradient-brand hover:opacity-90 transition-opacity text-white border-0 font-medium">
              Go to Admin Dashboard
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
