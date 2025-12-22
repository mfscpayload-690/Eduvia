/**
 * Admin Request Actions API Route
 * PATCH: Approve or reject a specific request (super admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import {
    approveAdminRequest,
    rejectAdminRequest,
    isSuperAdmin,
} from "@/lib/admin-requests";

/**
 * PATCH /api/admin-requests/[id]
 * Approve or reject an admin request
 * Body: { action: "approve" | "reject" }
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // CRITICAL: Only super admin can approve/reject
        if (!isSuperAdmin(session.user.email)) {
            // Log unauthorized attempt for security monitoring
            console.warn(
                `[SECURITY] Unauthorized admin request action attempt by: ${session.user.email}`
            );
            return NextResponse.json(
                { error: "Access denied. Super admin only." },
                { status: 403 }
            );
        }

        // Validate request ID format (UUID)
        const requestId = params.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(requestId)) {
            return NextResponse.json(
                { error: "Invalid request ID format" },
                { status: 400 }
            );
        }

        // Parse and validate action
        const body = await request.json();
        const action = body.action;

        if (!action || !["approve", "reject"].includes(action)) {
            return NextResponse.json(
                { error: "Invalid action. Must be 'approve' or 'reject'" },
                { status: 400 }
            );
        }

        // Perform the action
        if (action === "approve") {
            await approveAdminRequest(requestId, session.user.email);
        } else {
            await rejectAdminRequest(requestId, session.user.email);
        }

        return NextResponse.json({
            success: true,
            message: `Request ${action}ed successfully`,
        });
    } catch (error) {
        console.error("Admin request action error:", error);
        const message = error instanceof Error ? error.message : "Action failed";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
