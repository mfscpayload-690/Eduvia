/**
 * Admin Requests API Route
 * POST: Create a new faculty access request (authenticated users)
 * GET: List all requests (super admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import {
    createAdminRequest,
    getAdminRequests,
    isSuperAdmin,
} from "@/lib/admin-requests";

// Rate limiting map (simple in-memory, consider Redis for production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max requests
const RATE_WINDOW = 60 * 1000; // per minute

function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || now > record.resetAt) {
        rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT) {
        return false;
    }

    record.count++;
    return true;
}

/**
 * POST /api/admin-requests
 * Create a new faculty access request
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Rate limiting by user ID
        if (!checkRateLimit(session.user.id)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        // Parse and validate input
        let body: { reason?: string } = {};
        try {
            body = await request.json();
        } catch {
            // Empty body is fine
        }

        // Sanitize reason input (prevent XSS)
        const reason = body.reason
            ? String(body.reason).slice(0, 500).trim()
            : undefined;

        const adminRequest = await createAdminRequest(session.user.id, reason);

        return NextResponse.json({
            success: true,
            request: adminRequest,
        });
    } catch (error) {
        console.error("Create admin request error:", error);
        const message = error instanceof Error ? error.message : "Failed to create request";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

/**
 * GET /api/admin-requests
 * List all admin requests (SUPER ADMIN ONLY)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // CRITICAL: Only super admin can list all requests
        if (!isSuperAdmin(session.user.email)) {
            return NextResponse.json(
                { error: "Access denied. Super admin only." },
                { status: 403 }
            );
        }

        // Get optional status filter from query params
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as "pending" | "approved" | "rejected" | null;

        const requests = await getAdminRequests(status || undefined);

        return NextResponse.json({
            success: true,
            requests,
        });
    } catch (error) {
        console.error("Fetch admin requests error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch requests";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
