/**
 * Admin Access Request Management
 * Secure server-side only functions for faculty access requests
 */

import { supabase } from "./supabase";
import type { AdminRequest, AdminRequestStatus } from "./types";

// ============================================================================
// Security Utilities
// ============================================================================

/**
 * Get super admin email from environment variable (NEVER hardcoded)
 * This is the ONLY user who can manage faculty access requests
 */
export function getSuperAdminEmail(): string {
    const email = process.env.SUPER_ADMIN_EMAIL;
    if (!email) {
        throw new Error("SUPER_ADMIN_EMAIL environment variable is not set");
    }
    return email.toLowerCase().trim();
}

/**
 * Check if a given email is the super admin
 * Always normalize to lowercase for comparison
 */
export function isSuperAdmin(email: string | null | undefined): boolean {
    if (!email) return false;
    try {
        return email.toLowerCase().trim() === getSuperAdminEmail();
    } catch {
        // If env var not set, no one is super admin
        return false;
    }
}

// ============================================================================
// Admin Request CRUD Operations
// ============================================================================

/**
 * Create a new faculty access request
 * Called when a user clicks "Request Faculty Access" during profile creation
 */
export async function createAdminRequest(
    userId: string,
    reason?: string
): Promise<AdminRequest> {
    // First, get user details to populate request
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("name, email, college, mobile")
        .eq("id", userId)
        .single();

    if (userError || !user) {
        throw new Error("User not found");
    }

    // Check if user already has a pending request
    const { data: existingRequest } = await supabase
        .from("admin_requests")
        .select("id, status")
        .eq("user_id", userId)
        .eq("status", "pending")
        .single();

    if (existingRequest) {
        throw new Error("You already have a pending faculty access request");
    }

    // Create the request
    const { data, error } = await supabase
        .from("admin_requests")
        .insert({
            user_id: userId,
            name: user.name,
            email: user.email,
            college: user.college || "Not specified",
            mobile: user.mobile || "Not specified",
            reason: reason || null,
            status: "pending",
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create request: ${error.message}`);
    }

    return data;
}

/**
 * Get all admin requests (SUPER ADMIN ONLY)
 * Returns all pending, approved, and rejected requests
 */
export async function getAdminRequests(
    status?: AdminRequestStatus
): Promise<AdminRequest[]> {
    let query = supabase
        .from("admin_requests")
        .select("*")
        .order("created_at", { ascending: false });

    if (status) {
        query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch requests: ${error.message}`);
    }

    return data || [];
}

/**
 * Get request status for a specific user
 * Users can check their own request status
 */
export async function getUserRequestStatus(
    userId: string
): Promise<AdminRequest | null> {
    const { data, error } = await supabase
        .from("admin_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== "PGRST116") {
        throw new Error(`Failed to fetch request status: ${error.message}`);
    }

    return data || null;
}

/**
 * Approve a faculty access request (SUPER ADMIN ONLY)
 * Changes user role to 'admin' and updates request status
 */
export async function approveAdminRequest(
    requestId: string,
    reviewerEmail: string
): Promise<void> {
    // Get the request first
    const { data: request, error: fetchError } = await supabase
        .from("admin_requests")
        .select("user_id, email, status")
        .eq("id", requestId)
        .single();

    if (fetchError || !request) {
        throw new Error("Request not found");
    }

    if (request.status !== "pending") {
        throw new Error("Request has already been reviewed");
    }

    // Update user role to admin
    const { error: userError } = await supabase
        .from("users")
        .update({ role: "admin" })
        .eq("email", request.email);

    if (userError) {
        throw new Error(`Failed to update user role: ${userError.message}`);
    }

    // Update request status
    const { error: requestError } = await supabase
        .from("admin_requests")
        .update({
            status: "approved",
            reviewed_at: new Date().toISOString(),
            reviewed_by: reviewerEmail,
        })
        .eq("id", requestId);

    if (requestError) {
        throw new Error(`Failed to update request: ${requestError.message}`);
    }
}

/**
 * Reject a faculty access request (SUPER ADMIN ONLY)
 * User remains as student, request marked as rejected
 */
export async function rejectAdminRequest(
    requestId: string,
    reviewerEmail: string
): Promise<void> {
    // Get the request first
    const { data: request, error: fetchError } = await supabase
        .from("admin_requests")
        .select("status")
        .eq("id", requestId)
        .single();

    if (fetchError || !request) {
        throw new Error("Request not found");
    }

    if (request.status !== "pending") {
        throw new Error("Request has already been reviewed");
    }

    // Update request status to rejected
    const { error } = await supabase
        .from("admin_requests")
        .update({
            status: "rejected",
            reviewed_at: new Date().toISOString(),
            reviewed_by: reviewerEmail,
        })
        .eq("id", requestId);

    if (error) {
        throw new Error(`Failed to reject request: ${error.message}`);
    }
}

/**
 * Revoke admin access (SUPER ADMIN ONLY)
 * Demotes an admin back to student role
 */
export async function revokeAdminAccess(
    userEmail: string,
    reviewerEmail: string
): Promise<void> {
    // Prevent revoking super admin
    if (isSuperAdmin(userEmail)) {
        throw new Error("Cannot revoke super admin access");
    }

    // Update user role back to student
    const { error } = await supabase
        .from("users")
        .update({ role: "student" })
        .eq("email", userEmail);

    if (error) {
        throw new Error(`Failed to revoke access: ${error.message}`);
    }

    // Update any approved requests to rejected
    await supabase
        .from("admin_requests")
        .update({
            status: "rejected",
            reviewed_at: new Date().toISOString(),
            reviewed_by: reviewerEmail,
        })
        .eq("email", userEmail)
        .eq("status", "approved");
}
