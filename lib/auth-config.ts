import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { getOrCreateUser, updateUserRole } from "@/lib/supabase";
import type { AuthOptions } from "next-auth";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubId = process.env.GITHUB_ID;
const githubSecret = process.env.GITHUB_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!googleClientId || !googleClientSecret || !nextAuthSecret) {
  throw new Error("Missing required authentication environment variables");
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
    GithubProvider({
      clientId: githubId || "",
      clientSecret: githubSecret || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }: any) {
      if (!user.email) {
        return false;
      }

      try {
        // Get or create user in Supabase
        const dbUser = await getOrCreateUser(
          user.email,
          user.name || user.email,
          account.providerAccountId
        );

        // Promote to admin if email is in allowlist
        const allowlist = (process.env.ADMIN_EMAILS || "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);

        const emailLower = user.email.toLowerCase();
        if (allowlist.includes(emailLower) && dbUser.role !== "admin") {
          await updateUserRole(user.email, "admin");
          dbUser.role = "admin";
        }

        // Store user data for JWT
        user.id = dbUser.id;
        user.role = dbUser.role;
        user.profile_completed = dbUser.profile_completed;

        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },

    async jwt({ token, user, trigger }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profile_completed = user.profile_completed;
        token.email = user.email;
      }

      // Refresh profile_completed status when session is updated
      if (trigger === "update") {
        // Re-fetch user from database to get latest profile_completed status
        const { supabase } = await import("@/lib/supabase");
        const { data } = await supabase
          .from("users")
          .select("profile_completed, role")
          .eq("email", token.email)
          .single();

        if (data) {
          token.profile_completed = data.profile_completed;
          token.role = data.role;
        }
      }

      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.profile_completed = token.profile_completed;
      }
      return session;
    },
  },
  secret: nextAuthSecret,
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
