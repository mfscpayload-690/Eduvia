import { NextResponse } from "next/server";
import { chatWithLLMStreaming } from "@/lib/openai";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const body = await req.json();
    const { message, context, history = [], sessionId: requestedSessionId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let sessionId = requestedSessionId;

    // Create session if not exists
    if (!sessionId) {
      const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
      const { data: newSession, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({ user_id: userId, title })
        .select()
        .single();

      if (sessionError) throw new Error(`Failed to create session: ${sessionError.message}`);
      sessionId = newSession.id;
    }

    // Save User Message
    const { error: msgError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        role: "user",
        content: message
      });

    if (msgError) throw new Error(`Failed to save message: ${msgError.message}`);

    // Prepare messages for LLM
    const messages: ChatMessage[] = [
      ...history.slice(-5).map((h: any) => ({ role: h.role, content: h.content })),
      { role: "user", content: message }
    ];

    const stream = await chatWithLLMStreaming(messages, context);

    // Tee the stream to save to DB while sending to client
    const [clientStream, serverStream] = stream.tee();

    // Async save to DB (fire and forget)
    // We explicitly don't await this to avoid blocking the response
    (async () => {
      try {
        const reader = serverStream.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value, { stream: true });
        }

        if (fullResponse) {
          await supabase.from("chat_messages").insert({
            session_id: sessionId,
            role: "assistant",
            content: fullResponse
          });
        }
      } catch (err) {
        console.error("Failed to save assistant response:", err);
      }
    })();

    return new Response(clientStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Session-Id": sessionId, // Return session ID to client
      },
    });

  } catch (error: any) {
    console.error("POST /api/chat error:", error);

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "LLM service not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to process chat" },
      { status: 500 }
    );
  }
}
