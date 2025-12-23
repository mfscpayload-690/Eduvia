import { NextResponse } from "next/server";
import { getNoteById, updateNote, deleteNote } from "@/lib/supabase";
import { requireAuth, requireAdmin } from "@/lib/auth";

/**
 * GET /api/notes/:id
 * Fetch a specific note by ID
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const { id } = params;

    const note = await getNoteById(id);

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("GET /api/notes/:id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notes/[id]
 * Admin-only: Update a note
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { id } = params;
    const body = await req.json();
    const { title, course, file_id, drive_url, branches, semesters, year_of_study } = body;

    if (!title && !course && !file_id && !drive_url && branches === undefined && semesters === undefined && year_of_study === undefined) {
      return NextResponse.json(
        { error: "At least one field is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (course) updateData.course = course;
    if (file_id) updateData.file_id = file_id;
    if (drive_url) updateData.drive_url = drive_url;
    if (branches !== undefined) updateData.branches = branches;
    if (semesters !== undefined) updateData.semesters = semesters;
    if (year_of_study !== undefined) updateData.year_of_study = year_of_study;

    const note = await updateNote(id, updateData);

    return NextResponse.json(
      { success: true, note },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/notes/[id] error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes/[id]
 * Admin-only: Delete a note
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { id } = params;

    await deleteNote(id);

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/notes/[id] error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
