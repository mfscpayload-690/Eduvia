"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, Sparkles, Github } from "lucide-react";
import { Logo } from "@/components/logo";

export default function SignInPage() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      window.location.href = "/dashboard";
    }
  }, [session]);

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-neutral-950 selection:bg-brand-500/30">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-brand-500/20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-accent-500/20 blur-[100px] animate-pulse delay-1000" />
      <div className="absolute inset-0 bg-[url('/assets/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative z-10 w-full max-w-5xl px-6">
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: Branding */}
          <div className="hidden lg:flex flex-col space-y-6">
            <div className="mb-4">
              <Logo variant="full" size="2xl" />
            </div>
            <h1 className="text-5xl font-bold font-heading leading-tight text-white">
              Campus life, <br />
              <span className="text-gradient">Simplified.</span>
            </h1>
            <p className="max-w-md text-lg text-neutral-400 font-light leading-relaxed">
              Your all-in-one platform for timetables, notes, events, and a smarter academic journey.
            </p>
            <div className="flex items-center gap-6 pt-4 text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-brand-500/10 text-brand-400">
                  <ShieldCheck size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Secure</span>
                  <span className="text-[10px]">Encrypted</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-accent-500/10 text-accent-400">
                  <Zap size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Fast</span>
                  <span className="text-[10px]">Real-time</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-purple-500/10 text-purple-400">
                  <Sparkles size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Smart</span>
                  <span className="text-[10px]">AI Powered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sign-in Card */}
          <div className="w-full max-w-md mx-auto relative group">
            {/* Manual dark glass card implementation to override theme */}
            <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl" />

            <div className="relative p-8 z-10">
              <div className="flex flex-col items-center text-center space-y-2 mb-8">
                <div className="lg:hidden mb-4">
                  <Logo variant="icon" size="lg" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-white">Welcome Back</h2>
                <p className="text-sm text-neutral-400">Sign in with your institutional account</p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => signIn("google")}
                  size="lg"
                  className="w-full gap-3 py-6 bg-white text-neutral-950 hover:bg-neutral-200 border-0 font-medium transition-transform hover:scale-[1.02]"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Sign in with Google
                </Button>

                <Button
                  onClick={() => signIn("github")}
                  size="lg"
                  className="w-full gap-3 py-6 bg-[#24292e] text-white hover:bg-[#2f363d] border border-white/10 font-medium transition-transform hover:scale-[1.02] mt-3"
                >
                  <Github className="w-5 h-5" />
                  Sign in with GitHub
                </Button>

                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-neutral-500 font-medium">Includes access to</span>
                  </div>
                </div>

                <ul className="grid grid-cols-2 gap-3 text-xs text-neutral-400 mt-4">
                  <li className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5"><ArrowRight size={12} className="text-brand-500" /> Timetables</li>
                  <li className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5"><ArrowRight size={12} className="text-brand-500" /> Course Notes</li>
                  <li className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5"><ArrowRight size={12} className="text-brand-500" /> Events</li>
                  <li className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5"><ArrowRight size={12} className="text-brand-500" /> Study Bot</li>
                </ul>
              </div>

              <p className="mt-8 text-center text-[10px] text-neutral-500">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
