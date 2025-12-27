
import { NextResponse } from "next/server";
import { getLostFoundItems, createLostFoundItem } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/lostfound
 * Fetch all lost & found items
 */
export async function GET() {
  try {
    await requireAuth();

    const items = await getLostFoundItems();

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("GET /api/lostfound error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lost & found items" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lostfound
 * Create a new lost & found item (any authenticated user)
 */
export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { item_name, description, status, contact } = body;

    if (!item_name || !description || !status || !contact) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["lost", "found", "claimed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const item = await createLostFoundItem({
      item_name,
      description,
      status,
      contact,
      user_id: session.user.id,
    });

    return NextResponse.json(
      { success: true, item },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/lostfound error:", error);
    return NextResponse.json(
      { error: "Failed to create lost & found item" },
      { status: 500 }
    );
  }
}
