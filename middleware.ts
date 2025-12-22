import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  async function middleware(req: NextRequest) {
    const token = (req as any).nextauth?.token;
    const pathname = req.nextUrl.pathname;

    // Skip profile check for profile creation and settings routes
    if (pathname.startsWith("/profile") || pathname.startsWith("/settings")) {
      return NextResponse.next();
    }

    // Check if user has completed their profile
    if (token && !(token as any).profile_completed) {
      // Redirect to profile creation if not completed
      const url = req.nextUrl.clone();
      url.pathname = "/profile/create";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/signin",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (!token) return false;
        if (pathname.startsWith("/admin")) {
          const role = (token as any).role;
          // Allow both admin and super_admin to access admin routes
          return role === "admin" || role === "super_admin";
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/notes/:path*",
    "/timetable/:path*",
    "/lostfound/:path*",
    "/events/:path*",
    "/classfinder/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
