import { NextResponse } from "next/server";
import { chatWithLLM } from "@/lib/openai";
import { requireAuth } from "@/lib/auth";
import type { ChatMessage } from "@/lib/types";

/**
 * POST /api/chat
 * Chat with the LLM-powered assistant
 */
export async function POST(req: Request) {
  try {
    await requireAuth();

    const body = await req.json();
    const { message, context } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Build message history (in a real app, you'd store this in the session or database)
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: message,
      },
    ];

    const response = await chatWithLLM(messages, context);

    return NextResponse.json({
      success: true,
      reply: response.reply,
      sources: response.sources,
    });
  } catch (error) {
    console.error("POST /api/chat error:", error);

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "LLM service not configured" },
        { status: 503 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to process chat message";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
