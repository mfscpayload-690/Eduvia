"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function SignInPage() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      window.location.href = "/dashboard";
    }
  }, [session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 to-neutral-900 px-4">
      <Card className="w-full max-w-md border-neutral-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-500">Smart Campus</CardTitle>
          <CardDescription>Your all-in-one campus companion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-neutral-400 text-center space-y-2">
            <p>Sign in to access:</p>
            <ul className="text-left space-y-1">
              <li>✓ Course timetables</li>
              <li>✓ Shared course notes</li>
              <li>✓ Campus events</li>
              <li>✓ Lost & Found</li>
              <li>✓ AI study assistant</li>
            </ul>
          </div>

          <Button
            onClick={() => signIn("google")}
            size="lg"
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <LogIn size={18} />
            Sign in with Google
          </Button>

          <p className="text-xs text-neutral-500 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
