"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2, Sparkles, RefreshCw, Send, Bot, User, Lightbulb, ArrowRight,
  MessageSquare, Trash2, Menu, Plus, Edit2, Check, X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import type { ChatMessage } from "@/lib/types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const INITIAL_ASSISTANT = "Hi! I'm eduvia AI, your personal study assistant. Ask me anything about your courses, schedules, or get help with any academic topic.";

type Role = "assistant" | "user" | "system";

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
}

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
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
        ? "bg-brand-500 text-white"
        : "bg-gradient-to-br from-purple-500 to-brand-500 text-white"
        }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

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

function TypingIndicator({ message }: { message?: string }): JSX.Element {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-brand-500 text-white flex items-center justify-center">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-bl-md px-4 py-3 flex flex-col gap-2">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-brand-500/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-brand-500/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-brand-500/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        {message && <p className="text-[10px] text-neutral-500 animate-pulse font-medium">{message}</p>}
      </div>
    </div>
  );
}

export default function EduviaAIPage(): JSX.Element {
  const { status } = useSession();

  // Chat State
  const [history, setHistory] = useState<ChatMessage[]>([{ role: "assistant", content: INITIAL_ASSISTANT }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");

  // History State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Rename State
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  // Load Sessions
  useEffect(() => {
    async function loadSessions() {
      if (status !== "authenticated") return;
      try {
        const res = await fetch("/api/chat/history");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadSessions();
  }, [status]);

  // Scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, sending]);

  // Load Session Messages
  const loadSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) {
      setMobileMenuOpen(false);
      return;
    }

    setLoadingStep("Loading conversation...");
    setSending(true); // Block input while loading
    setCurrentSessionId(sessionId);
    setError(null);
    setMobileMenuOpen(false);

    try {
      const res = await fetch(`/api/chat/history/${sessionId}`);
      if (!res.ok) throw new Error("Failed to load conversation");
      const data = await res.json();

      const newHistory = data.messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }));
      setHistory(newHistory.length > 0 ? newHistory : [{ role: "assistant", content: INITIAL_ASSISTANT }]);
    } catch (err) {
      console.error(err);
      setError("Could not load conversation");
      setHistory([{ role: "assistant", content: INITIAL_ASSISTANT }]);
    } finally {
      setSending(false);
      setLoadingStep("");
    }
  };

  const startEditing = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const saveRename = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;

    // Optimistic update
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: editTitle } : s));
    setEditingSessionId(null);

    try {
      await fetch(`/api/chat/history/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle })
      });
    } catch (err) {
      console.error("Failed to rename", err);
    }
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;

    // Optimistic update
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      resetChat();
    }

    try {
      await fetch(`/api/chat/history/${sessionId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const send = async (): Promise<void> => {
    const message = input.trim();
    if (!message || sending) return;

    setInput("");
    setSending(true);
    setError(null);
    const newHistory = [...history, { role: "user" as Role, content: message }];
    setHistory(newHistory);

    // Dynamic loading messages
    const steps = ["Processing query...", "Analyzing context...", "Thinking...", "Generating response..."];
    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setLoadingStep(steps[stepIdx]);
    }, 1500);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: history.slice(-5),
          sessionId: currentSessionId
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to chat");
      }

      // Check for new session ID
      const newSessionId = res.headers.get("X-Session-Id");
      if (newSessionId && newSessionId !== currentSessionId) {
        setCurrentSessionId(newSessionId);
        // Refresh sessions list to show new title
        // Small delay to allow DB trigger/insert to settle? Usually instant based.
        // We'll optimistically add it or fetch. Fetching is safer for title.
        fetch("/api/chat/history").then(r => r.json()).then(d => setSessions(d.sessions || []));
      }

      clearInterval(stepInterval);
      setLoadingStep("");

      // Initialize assistant message bubble
      setHistory((h) => [...h, { role: "assistant", content: "" }]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;

          setHistory((h) => {
            const last = h[h.length - 1];
            if (last.role === "assistant") {
              return [...h.slice(0, -1), { ...last, content: assistantText }];
            }
            return h;
          });
        }
      }
    } catch (e: any) {
      clearInterval(stepInterval);
      setLoadingStep("");
      setHistory((h) => [
        ...h,
        { role: "assistant", content: `Sorry, I hit an issue: ${e?.message || "Unknown error"}` },
      ]);
      setError(e?.message || "Failed to chat");
    } finally {
      setSending(false);
      setLoadingStep("");
    }
  };

  const resetChat = (): void => {
    setHistory([{ role: "assistant", content: INITIAL_ASSISTANT }]);
    setError(null);
    setInput("");
    setCurrentSessionId(null);
    setMobileMenuOpen(false);
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button onClick={resetChat} className="w-full justify-start gap-2 bg-brand-500 hover:bg-brand-600 text-white">
          <Plus size={18} /> New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loadingHistory ? (
          <div className="flex justify-center p-4"><Loader2 className="animate-spin text-neutral-400" /></div>
        ) : sessions.length === 0 ? (
          <p className="text-xs text-center text-neutral-500 py-4">No past conversations</p>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              onClick={() => loadSession(session.id)}
              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer text-sm transition-colors ${currentSessionId === session.id
                ? "bg-neutral-200 dark:bg-neutral-800 font-medium"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400"
                }`}
            >
              <MessageSquare size={16} className="text-neutral-400 flex-shrink-0" />

              {editingSessionId === session.id ? (
                <div className="flex-1 flex items-center gap-1 min-w-0" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="flex-1 bg-white dark:bg-black/20 border border-brand-500 rounded px-1.5 py-0.5 text-xs focus:outline-none min-w-0"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === "Enter") saveRename(e as any, session.id);
                      if (e.key === "Escape") cancelRename(e as any);
                    }}
                  />
                  <button onClick={(e) => saveRename(e, session.id)} className="text-green-500 hover:bg-green-500/10 p-0.5 rounded"><Check size={12} /></button>
                  <button onClick={cancelRename} className="text-red-500 hover:bg-red-500/10 p-0.5 rounded"><X size={12} /></button>
                </div>
              ) : (
                <>
                  <div className="flex-1 truncate">{session.title}</div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => startEditing(e, session)}
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 rounded mr-1"
                      title="Rename"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => deleteSession(e, session.id)}
                      className="p-1 hover:bg-red-100 hover:text-red-500 rounded"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 border-r border-border bg-neutral-50/50 dark:bg-black/20 flex-col">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-neutral-200 dark:border-white/5 bg-background/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px]">
                  <SidebarContent />
                </SheetContent>
              </Sheet>

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
              className="hidden md:flex text-neutral-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Messages Area - Takes all available space */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {history.map((m, idx) => {
              if (m.role === "assistant" && !m.content) return null;
              return (
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
              );
            })}

            {/* Loading Indicator */}
            {sending && (
              (history[history.length - 1]?.role !== "assistant" || history[history.length - 1]?.content === "") &&
              <TypingIndicator message={loadingStep} />
            )}

            <div ref={endRef} />
          </div>
        </div>

        {/* Bottom Fixed Section */}
        <div className="flex-shrink-0 border-t border-neutral-200 dark:border-white/5 bg-background/95 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto px-4 py-3">
            {/* Suggestions */}
            {!hasConversation && !currentSessionId && (
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
    </div>
  );
}
