"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function SignInPage() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      window.location.href = "/dashboard";
    }
  }, [session]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(37,99,235,0.25)_0,transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          {/* Left: Branding */}
          <div className="hidden md:flex flex-col justify-center">
            <div className="mb-6 h-12 w-12 rounded-xl border border-neutral-800 bg-neutral-900/60" />
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-100">eduvia</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-neutral-400">
              Your all-in-one campus companion. Access timetables, notes, events, lost & found, and a helpful study assistant — all in one place.
            </p>
          </div>

          {/* Right: Sign-in Card */}
          <Card className="w-full border-neutral-800/70 bg-neutral-925/40 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/50">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                {/* Logo placeholder */}
                <div className="mb-4 h-12 w-12 rounded-full border border-neutral-800 bg-neutral-900/60" aria-label="Logo placeholder" />
                <h2 className="text-2xl font-medium text-neutral-100">Welcome to eduvia</h2>
                <p className="mt-1 text-sm text-neutral-400">Sign in to continue</p>
              </div>

              <div className="mt-6 space-y-2 text-sm text-neutral-400">
                <p className="text-center">What you get</p>
                <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  <li>• Timetables</li>
                  <li>• Course notes</li>
                  <li>• Events</li>
                  <li>• Lost & Found</li>
                </ul>
              </div>

              <Button
                onClick={() => signIn("google")}
                size="lg"
                className="mt-6 w-full gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <LogIn size={18} />
                Sign in with Google
              </Button>

              <p className="mt-4 text-center text-xs text-neutral-500">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
