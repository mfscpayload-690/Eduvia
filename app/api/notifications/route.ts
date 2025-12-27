import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin"; // Use admin or regular client?
// We should use regular client inside API if possible, but admin is easier for straightforward queries if we passing user_id manually.
// ACTUALLY, strict RLS is better.
// Let's use `supabaseAdmin` but strictly filtering by session user ID to ensure safety.

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await requireAuth();

        const { data: notifications, error } = await supabaseAdmin
            .from("notifications")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) throw error;

        return NextResponse.json({ success: true, notifications });

    } catch (error: any) {
        console.error("GET /api/notifications error:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

export async function PATCH() {
    // Mark ALL as read
    try {
        const session = await requireAuth();

        const { error } = await supabaseAdmin
            .from("notifications")
            .update({ read: true })
            .eq("user_id", session.user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("PATCH /api/notifications error:", error);
        return NextResponse.json(
            { error: "Failed to update notifications" },
            { status: 500 }
        );
    }
}
