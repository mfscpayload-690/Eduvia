import { getServerSession as nextAuthGetServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import type { Session } from "./types";

/**
 * Get the current server session with full type safety
 */
export async function getServerSession(): Promise<Session | null> {
  const session = await nextAuthGetServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  return {
    user: {
      id: (session.user as any).id || "",
      email: session.user.email || "",
      name: session.user.name || "",
      role: (session.user as any).role || "student",
    },
    expires: session.expires,
  };
}

/**
 * Verify that the current user is an admin (admin or super_admin)
 */
export async function requireAdmin(): Promise<Session> {
  const session = await getServerSession();

  if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    throw new Error("Unauthorized: Admin access required");
  }

  return session;
}

/**
 * Verify that a user is authenticated
 */
export async function requireAuth(): Promise<Session> {
  const session = await getServerSession();

  if (!session) {
    throw new Error("Unauthorized: Authentication required");
  }

  return session;
}
