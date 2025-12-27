import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getLostFoundItemById, updateLostFoundItem, deleteLostFoundItem } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;
        const body = await req.json();

        const item = await getLostFoundItemById(params.id);
        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        // Authorization: Owner or Admin
        if (item.user_id !== userId && session.user.role !== "admin" && session.user.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { status } = body;
        if (status && !["lost", "found", "claimed"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const updated = await updateLostFoundItem(params.id, { status });

        return NextResponse.json({ success: true, item: updated });

    } catch (error: any) {
        console.error("PATCH lostfound item error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await requireAuth();
        const userId = session.user.id;

        const item = await getLostFoundItemById(params.id);
        if (!item) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        // Authorization: Owner or Admin
        if (item.user_id !== userId && session.user.role !== "admin" && session.user.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await deleteLostFoundItem(params.id);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("DELETE lostfound item error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
