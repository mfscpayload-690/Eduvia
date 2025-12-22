"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, RefreshCw, Send, Bot, User, Lightbulb, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import type { ChatMessage } from "@/lib/types";

const INITIAL_ASSISTANT = "Hi! I'm eduvia AI, your personal study assistant. Ask me anything about your courses, schedules, or get help with any academic topic.";

type Role = "assistant" | "user" | "system";

const SUGGESTION_PROMPTS = [
  { text: "Summarize my notes", icon: "📝" },
  { text: "Create a study plan", icon: "📅" },
  { text: "Explain a concept", icon: "💡" },
  { text: "List upcoming events", icon: "📆" },
];

function MessageBubble({ role, children }: { role: Role; children: React.ReactNode }): JSX.Element {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
        ? "bg-brand-500 text-white"
        : "bg-gradient-to-br from-purple-500 to-brand-500 text-white"
        }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message */}
      <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${isUser
        ? "bg-brand-500 text-white rounded-br-md"
        : "bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-bl-md"
        }`}>
        <div className="text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator(): JSX.Element {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-brand-500 text-white flex items-center justify-center">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
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
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, sending]);

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

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-brand-500 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-neutral-400 text-sm">Loading eduvia AI...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full glass-card border-white/10">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-brand-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Sign in to continue</h2>
              <p className="text-neutral-400">Access eduvia AI for personalized study assistance.</p>
            </div>
            <Link href="/auth/signin">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-brand-500 hover:opacity-90 border-0">
                Sign In <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasConversation = history.length > 1;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-neutral-200 dark:border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-brand-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">eduvia AI</h1>
              <p className="text-xs text-neutral-500">Your study assistant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetChat}
            className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>
      </div>

      {/* Messages Area - Takes all available space */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
                      <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-black/30 rounded-lg p-3 overflow-x-auto my-2 text-xs">{children}</pre>
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

          {sending && <TypingIndicator />}

          <div ref={endRef} />
        </div>
      </div>

      {/* Bottom Fixed Section */}
      <div className="flex-shrink-0 border-t border-neutral-200 dark:border-white/5 bg-background/95 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Suggestions */}
          {!hasConversation && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-neutral-500">Try asking</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTION_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => handleSuggestionClick(prompt.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:bg-neutral-200 dark:hover:bg-white/10 hover:border-brand-500/50 transition-all text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <span>{prompt.icon}</span>
                    <span>{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400 text-xs mb-2 flex items-center gap-2" role="alert">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {error}
            </p>
          )}

          {/* Input */}
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) send();
                }
              }}
              aria-label="Message eduvia AI"
              placeholder="Ask me anything..."
              className="flex-1 resize-none rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
              style={{ minHeight: "44px", maxHeight: "100px" }}
            />
            <Button
              onClick={send}
              disabled={!canSend}
              className="h-11 w-11 rounded-xl bg-gradient-to-r from-purple-500 to-brand-500 hover:opacity-90 disabled:opacity-40 transition-all flex-shrink-0"
              aria-label="Send message"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="text-[10px] text-neutral-600 mt-1.5 text-center">
            AI can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </div>
  );
}
