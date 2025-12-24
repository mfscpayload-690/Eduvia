import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        await requireAdmin();

        const body = await req.json();
        const { semester, year, branch, section, scheduleConfig, schedule } = body;

        if (!semester || !year || !branch || !schedule) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if timetable exists for this sem-year-branch combo
        const { data: existing } = await supabase
            .from("timetable_grid")
            .select("id")
            .eq("semester", semester)
            .eq("year", year)
            .eq("branch", branch)
            .eq("section", section || "")
            .single();

        const payload = {
            semester,
            year,
            branch,
            section: section || "",
            schedule_config: scheduleConfig,
            schedule,
            updated_at: new Date().toISOString(),
        };

        if (existing) {
            // Update
            const { error } = await supabase
                .from("timetable_grid")
                .update(payload)
                .eq("id", existing.id);

            if (error) throw new Error(error.message);
        } else {
            // Insert
            const { error } = await supabase
                .from("timetable_grid")
                .insert({ ...payload, created_at: new Date().toISOString() });

            if (error) throw new Error(error.message);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("POST /api/timetable/grid error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to save timetable" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const semester = searchParams.get("semester");
        const year = searchParams.get("year");
        const branch = searchParams.get("branch");
        const listAll = searchParams.get("list");

        // If list=true, return all timetables (for admin)
        if (listAll === "true") {
            const { data, error } = await supabase
                .from("timetable_grid")
                .select("id, semester, year, branch, section, updated_at")
                .order("updated_at", { ascending: false });

            if (error) throw new Error(error.message);
            return NextResponse.json({ success: true, timetables: data || [] });
        }

        if (!semester || !year) {
            return NextResponse.json({ success: true, timetable: null });
        }

        // Require exact match on semester, year, and branch
        let query = supabase
            .from("timetable_grid")
            .select("*")
            .eq("semester", semester)
            .eq("year", year);

        // Strict branch matching
        if (branch) {
            query = query.eq("branch", branch);
        }

        const { data, error } = await query.limit(1).single();

        if (error && error.code !== "PGRST116") {
            throw new Error(error.message);
        }

        return NextResponse.json({ success: true, timetable: data || null });
    } catch (error: any) {
        console.error("GET /api/timetable/grid error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch timetable" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing timetable ID" }, { status: 400 });
        }

        const { error } = await supabase
            .from("timetable_grid")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE /api/timetable/grid error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete timetable" },
            { status: 500 }
        );
    }
}
