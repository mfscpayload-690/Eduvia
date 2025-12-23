import { NextResponse } from "next/server";
import { getNotes, getNotesByUserProfile, createNote, getUserByEmail } from "@/lib/supabase";
import { requireAuth, requireAdmin } from "@/lib/auth";

/**
 * GET /api/notes
 * Fetch all available notes (student accessible)
 */
export async function GET() {
  try {
    const session = await requireAuth();

    // Admins and super_admins see everything; students see notes filtered by their profile
    let notes;
    if (session.user.role === "admin" || session.user.role === "super_admin") {
      notes = await getNotes();
    } else {
      const user = await getUserByEmail(session.user.email);
      const branch = user?.branch || "";
      const semester = user?.semester;
      const year = user?.year_of_study;
      notes = await getNotesByUserProfile(branch, semester, year);
    }

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("GET /api/notes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes
 * Admin-only: Create a new note
 */
export async function POST(req: Request) {
  try {
    const session = await requireAdmin();

    const body = await req.json();
    const { title, course, file_id, drive_url, branches, semesters, year_of_study } = body;

    if (!title || !course || !file_id || !drive_url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const note = await createNote({
      title,
      course,
      file_id,
      drive_url,
      branches,
      semesters,
      year_of_study,
      created_by: session.user.id,
    });

    return NextResponse.json(
      { success: true, note },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/notes error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
