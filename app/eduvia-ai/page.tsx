"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, Loader2, Sparkles, RefreshCw, Send } from "lucide-react";
import { Logo } from "@/components/logo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import type { ChatMessage } from "@/lib/types";

const INITIAL_ASSISTANT = "Hi! I'm eduvia AI. Ask me about schedules, notes, events, or general study help.";

type Role = "assistant" | "user" | "system";

function ChatHeader({ onReset }: { onReset: () => void }): JSX.Element {
  return (
    <div className="mb-6 flex items-start justify-between gap-3">
      <div>
        <Logo variant="full" size="lg" className="mb-3" />
        <h1 className="text-3xl font-semibold leading-tight">Ask anything</h1>
        <p className="text-neutral-400 text-sm">Deep answers on notes, timetable, events, and study help — full screen.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="border-neutral-800 text-neutral-200" onClick={onReset} aria-label="Start a new chat">
          <RefreshCw className="h-4 w-4 mr-2" /> New chat
        </Button>
        <Link href="/notes" aria-label="Open notes">
          <Button variant="outline" className="border-neutral-800 text-neutral-200">
            Notes <ArrowUpRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function MessageBubble({ role, children }: { role: Role; children: React.ReactNode }): JSX.Element {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed border transition-colors duration-200 ${isUser ? "bg-blue-600 text-white border-blue-500/40" : "bg-neutral-800 text-neutral-100 border-neutral-700"
          }`}
      >
        {children}
      </div>
    </div>
  );
}

function ChatMessages({ history, endRef }: { history: ChatMessage[]; endRef: React.RefObject<HTMLDivElement> }): JSX.Element {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" aria-live="polite" aria-relevant="additions">
      {history.map((m, idx) => (
        <MessageBubble key={idx} role={m.role as Role}>
          {m.role === "assistant" ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                code: ({ children }) => (
                  <code className="bg-neutral-900/70 px-1.5 py-0.5 rounded text-xs border border-neutral-700">{children}</code>
                ),
              }}
            >
              {m.content}
            </ReactMarkdown>
          ) : (
            <div className="whitespace-pre-wrap">{m.content}</div>
          )}
        </MessageBubble>
      ))}
      <div ref={endRef} />
    </div>
  );
}

function ChatInput({
  input,
  setInput,
  canSend,
  sending,
  send,
  error,
}: {
  input: string;
  setInput: (v: string) => void;
  canSend: boolean;
  sending: boolean;
  send: () => void;
  error: string | null;
}): JSX.Element {
  return (
    <div className="sticky bottom-0 border-t border-neutral-800 bg-neutral-900/70 p-3 md:p-4 backdrop-blur">
      {error && <p className="text-red-400 text-xs mb-2" role="alert">{error}</p>}
      <div className="flex items-end gap-3">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) send();
            }
          }}
          aria-label="Message eduvia AI"
          placeholder="Ask about notes, timetable, events, or any study question..."
          className="flex-1 resize-none rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={send} disabled={!canSend} aria-label="Send message" className="px-4">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function PromptSuggestions({ setInput, variant = "aside" }: { setInput: (v: string) => void; variant?: "aside" | "below" }): JSX.Element {
  const prompts = [
    "Summarize notes for PBCS304",
    "Create a study plan for next 7 days",
    "List upcoming events this week",
    "Explain binary search with a dry run",
  ];

  const containerBase = variant === "aside" ? "flex-col border-l border-white/5 bg-white/5 p-6 space-y-4" : "space-y-3";

  return variant === "aside" ? (
    <div className={`hidden lg:flex ${containerBase}`}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-600/20 text-blue-200 flex items-center justify-center">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">Pro tips</p>
          <p className="text-sm text-neutral-400">Try these to get better answers</p>
        </div>
      </div>
      <div className="space-y-3">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => setInput(prompt)}
            className="w-full text-left rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:border-blue-500/60 hover:text-white transition"
          >
            {prompt}
          </button>
        ))}
      </div>
      <div className="text-xs text-neutral-500 border border-neutral-800 rounded-lg p-3 bg-neutral-900/60">
        Need the small floating chat? It stays available across the app — use it anytime.
      </div>
    </div>
  ) : (
    <div className="lg:hidden mt-4">
      <details className="group rounded-lg border border-neutral-800 bg-neutral-900/50">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm text-neutral-300 flex items-center justify-between">
          <span className="font-medium">Pro tips</span>
          <Sparkles className="h-4 w-4 text-blue-300" />
        </summary>
        <div className="p-3 space-y-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="w-full text-left rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:border-blue-500/60 hover:text-white transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}

export default function EduviaAIPage(): JSX.Element {
  const { status } = useSession();
  const [history, setHistory] = useState<ChatMessage[]>([{ role: "assistant", content: INITIAL_ASSISTANT }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const send = async (): Promise<void> => {
    const message = input.trim();
    if (!message || sending) return;

    setInput("");
    setSending(true);
    setError(null);
    setHistory((h) => [...h, { role: "user", content: message }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to chat");

      setHistory((h) => [...h, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      setHistory((h) => [
        ...h,
        { role: "assistant", content: `Sorry, I hit an issue: ${e?.message || "Unknown error"}` },
      ]);
      setError(e?.message || "Failed to chat");
    } finally {
      setSending(false);
    }
  };

  const resetChat = (): void => {
    setHistory([{ role: "assistant", content: INITIAL_ASSISTANT }]);
    setError(null);
    setInput("");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-300">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full border-neutral-800 bg-neutral-900/80 backdrop-blur">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600/20 text-blue-200 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">Sign in to chat with AI</p>
                <p className="text-sm text-neutral-400">Access the full-screen assistant experience once authenticated.</p>
              </div>
            </div>
            <Link href="/auth/signin">
              <Button className="w-full">Go to sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:py-12">
        <ChatHeader onReset={resetChat} />

        <Card className="glass-card border-white/5 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Desktop/large screens: chat + aside tips. Tablets/mobile: tips move below and are collapsible. */}
            <div className="grid lg:grid-cols-[2fr_1fr] gap-0">
              {/* Chat column */}
              <div className="flex flex-col min-h-[65vh] relative">
                <ChatMessages history={history} endRef={endRef} />
                <ChatInput input={input} setInput={setInput} canSend={canSend} sending={sending} send={send} error={error} />
                {/* Tips below chat for tablet/mobile */}
                <PromptSuggestions setInput={setInput} variant="below" />
              </div>

              {/* Aside tips for xl+ */}
              <PromptSuggestions setInput={setInput} variant="aside" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
