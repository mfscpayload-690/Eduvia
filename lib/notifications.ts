import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type NotificationType = "CLASS_UPDATE" | "NEW_NOTE" | "EVENT" | "LOST_FOUND";

interface NotificationPayload {
    title: string;
    description: string;
    type: NotificationType;
    link?: string;
}

/**
 * Send a notification to a single user
 */
export async function notifyUser(userId: string, payload: NotificationPayload) {
    try {
        const { error } = await supabaseAdmin
            .from("notifications")
            .insert({
                user_id: userId,
                ...payload
            });

        if (error) throw error;
    } catch (error) {
        console.error(`Failed to notify user ${userId}:`, error);
    }
}

/**
 * Send a notification to ALL users
 */
export async function notifyAllUsers(payload: NotificationPayload) {
    try {
        // Fetch all user IDs
        // Note: In a massive scale app, we would batch this. For now, fetching all IDs is okay.
        const { data: users, error: userError } = await supabaseAdmin
            .from("users")
            .select("id");

        if (userError) throw userError;
        if (!users || users.length === 0) return;

        // Prepare batch insert
        const notifications = users.map(user => ({
            user_id: user.id,
            ...payload,
            created_at: new Date(),
            read: false
        }));

        const { error: insertError } = await supabaseAdmin
            .from("notifications")
            .insert(notifications);

        if (insertError) throw insertError;

    } catch (error) {
        console.error("Failed to notify all users:", error);
    }
}

/**
 * Send notification to users matching specific criteria (arrays act as OR)
 */
export async function notifyTargetAudience(
    criteria: { branches?: string[]; semesters?: number[]; year?: number },
    payload: NotificationPayload
) {
    try {
        let query = supabaseAdmin.from("users").select("id");

        if (criteria.branches && criteria.branches.length > 0) {
            // Normalize branches? Ideally database has strict enums.
            // We'll use .in() which is OR logic within the list
            query = query.in("branch", criteria.branches);
        }

        if (criteria.semesters && criteria.semesters.length > 0) {
            query = query.in("semester", criteria.semesters);
        }

        if (criteria.year) {
            query = query.eq("year_of_study", criteria.year);
        }

        const { data: users, error: userError } = await query;

        if (userError) throw userError;
        if (!users || users.length === 0) return;

        const notifications = users.map(user => ({
            user_id: user.id,
            ...payload,
            created_at: new Date(),
            read: false
        }));

        // Chunking might be needed for very large inserts, but for < 1000 users one go is fine.
        const { error: insertError } = await supabaseAdmin
            .from("notifications")
            .insert(notifications);

        if (insertError) throw insertError;

    } catch (error) {
        console.error("Failed to notify target audience:", error);
    }
}
