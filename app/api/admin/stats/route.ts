import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { getAdminStats } from "@/lib/supabase";

export async function GET() {
    try {
        // CRITICAL: Only Super Admin (the user) can call this
        await requireSuperAdmin();

        const stats = await getAdminStats();

        return NextResponse.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error("GET /api/admin/stats error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
