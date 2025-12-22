/**
 * User's Own Admin Request Status API
 * GET: Check own request status
 */

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getUserRequestStatus } from "@/lib/admin-requests";

/**
 * GET /api/admin-requests/my-status
 * Get the current user's own faculty access request status
 */
export async function GET() {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const request = await getUserRequestStatus(session.user.id);

        return NextResponse.json({
            success: true,
            hasRequest: !!request,
            request: request || null,
        });
    } catch (error) {
        console.error("Get request status error:", error);
        const message = error instanceof Error ? error.message : "Failed to get status";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
