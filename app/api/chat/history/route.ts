import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const session = await requireAuth();
        const userId = session.user.id;

        const { data: sessions, error } = await supabase
            .from("chat_sessions")
            .select("*")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            success: true,
            sessions: sessions || []
        });

    } catch (error: any) {
        console.error("GET /api/chat/history error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch chat history" },
            { status: 500 }
        );
    }
}
