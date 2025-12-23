import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { supabase } from "@/lib/supabase";
import type { UpdateProfileDTO } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UpdateProfileDTO = await req.json();

    // Validate required fields
    if (!body.college || !body.mobile || !body.semester ||
      !body.year_of_study || !body.branch || !body.program_type) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Update user profile in Supabase
    const { data, error } = await supabase
      .from("users")
      .update({
        name: body.name || undefined,
        college: body.college,
        mobile: body.mobile,
        semester: body.semester,
        year_of_study: body.year_of_study,
        branch: body.branch,
        program_type: body.program_type,
        profile_completed: true
      })
      .eq("email", session.user.email)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: data
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", session.user.email)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("email", session.user.email);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    return NextResponse.json({ message: "Account deleted" });
  } catch (error) {
    console.error("Account delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
