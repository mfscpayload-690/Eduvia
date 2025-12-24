import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        // Only Super Admin can access user list
        await requireSuperAdmin();

        const { data: users, error } = await supabase
            .from("users")
            .select("id, name, email, mobile, role, branch, semester, year_of_study, created_at")
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);

        return NextResponse.json({
            success: true,
            users: users || []
        });
    } catch (error: any) {
        console.error("GET /api/admin/users error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch users" },
            { status: 500 }
        );
    }
}
