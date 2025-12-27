import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// GET: Fetch messages for a specific session
export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const sessionId = params.id;

        // Verify ownership
        const { data: chatSession, error: sessionError } = await supabase
            .from("chat_sessions")
            .select("id")
            .eq("id", sessionId)
            .eq("user_id", userId)
            .single();

        if (sessionError || !chatSession) {
            return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 });
        }

        // Fetch messages
        const { data: messages, error: messagesError } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true });

        if (messagesError) throw new Error(messagesError.message);

        return NextResponse.json({
            success: true,
            messages: messages || []
        });

    } catch (error: any) {
        console.error("GET /api/chat/history/[id] error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch chat messages" },
            { status: 500 }
        );
    }
}

// PATCH: Rename a session
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const sessionId = params.id;

        const body = await req.json();
        const { title } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        // Verify ownership and update
        const { data, error } = await supabase
            .from("chat_sessions")
            .update({ title, updated_at: new Date().toISOString() })
            .eq("id", sessionId)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true, session: data });

    } catch (error: any) {
        console.error("PATCH /api/chat/history/[id] error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update session" },
            { status: 500 }
        );
    }
}

// DELETE: Delete a session
export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const sessionId = params.id;

        // Verify ownership and delete
        const { error } = await supabase
            .from("chat_sessions")
            .delete()
            .eq("id", sessionId)
            .eq("user_id", userId);

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("DELETE /api/chat/history/[id] error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete session" },
            { status: 500 }
        );
    }
}
