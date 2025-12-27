import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await requireAuth();

        // Ensure the notification belongs to the user
        const { error } = await supabaseAdmin
            .from("notifications")
            .update({ read: true })
            .eq("id", params.id)
            .eq("user_id", session.user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("PATCH notification item error:", error);
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 }
        );
    }
}
