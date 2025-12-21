"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface ChatItem {
  role: "user" | "assistant";
  content: string;
}

function suggestFollowUps(lastUserMsg: string): string[] {
  const base = [
    "Explain with a simple example",
    "Summarize the key points",
    "Suggest related topics to explore",
  ];
  if (!lastUserMsg) return base;
  const topic = lastUserMsg.split(" ").slice(0, 6).join(" ");
  return [
    `Give another example about ${topic}`,
    `What should I learn next after ${topic}?`,
    "Create 3 practice questions",
  ];
}

export function Chatbot() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<ChatItem[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  const username = useMemo(() => session?.user?.name?.split(" ")[0] || "there", [session]);

  useEffect(() => {
    if (status === "authenticated" && history.length === 0) {
      setHistory([
        {
          role: "assistant",
          content: `Welcome ${username}, I'm eduvia — ask me anything. I can help with using the app and study questions.`,
        },
      ]);
    }
  }, [status, username, history.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, open]);

  if (status !== "authenticated") return null;

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message) return;
    setInput("");
    setSending(true);
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
        {
          role: "assistant",
          content: `Sorry, I ran into a problem: ${e?.message || "Unknown error"}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content || "";
  const followups = suggestFollowUps(lastUser);

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg ring-2 ring-blue-500/40 hover:scale-105 active:scale-95"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ y: -2 }}
        aria-label="Open eduvia chat"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
        >
          <MessageSquare className="text-white" size={22} />
        </motion.div>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed left-4 right-4 bottom-20 sm:left-auto sm:right-4 sm:w-96 z-50 sm:bottom-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <div className="rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900 flex flex-col h-[70vh] sm:h-96">
              <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 select-none shrink-0">
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">eduvia Assistant</div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Close chat"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {history.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-2xl px-3 py-2 shadow max-w-xs sm:max-w-sm ${
                        m.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                      }`}
                    >
                      {m.role === "user" ? (
                        <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            h1: ({ children }: any) => (
                              <h1 className="text-lg font-bold mb-2 leading-tight">{children}</h1>
                            ),
                            h2: ({ children }: any) => (
                              <h2 className="text-base font-semibold mb-2 leading-tight">{children}</h2>
                            ),
                            h3: ({ children }: any) => (
                              <h3 className="text-sm font-semibold mb-2 leading-tight">{children}</h3>
                            ),
                            p: ({ children }: any) => <p className="text-sm mb-2 leading-relaxed">{children}</p>,
                            ul: ({ children }: any) => (
                              <ul className="list-disc ml-5 text-sm space-y-1 mb-2">{children}</ul>
                            ),
                            ol: ({ children }: any) => (
                              <ol className="list-decimal ml-5 text-sm space-y-1 mb-2">{children}</ol>
                            ),
                            li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }: any) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }: any) => <em className="italic">{children}</em>,
                            code: ({ children }: any) => (
                              <code className="rounded bg-neutral-200 px-1 py-0.5 text-[0.85rem] dark:bg-neutral-700">
                                {children}
                              </code>
                            ),
                            pre: ({ children }: any) => (
                              <pre className="rounded-md bg-neutral-900 text-neutral-100 p-3 overflow-x-auto text-[0.85rem]">
                                {children}
                              </pre>
                            ),
                            blockquote: ({ children }: any) => (
                              <blockquote className="border-l-4 border-neutral-300 pl-3 italic text-sm mb-2 dark:border-neutral-600">
                                {children}
                              </blockquote>
                            ),
                            a: ({ children, href }: any) => (
                              <a href={href} className="text-blue-600 hover:underline">
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              {followups.length > 0 && (
                <div className="px-3 pt-2 flex flex-wrap gap-2 shrink-0">
                  {followups.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s)}
                      className="text-xs px-2 py-1 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!sending) send();
                }}
                className="flex items-center gap-2 p-3 border-t border-neutral-200 dark:border-neutral-800 shrink-0"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
