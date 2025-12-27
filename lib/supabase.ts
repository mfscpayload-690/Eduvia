import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { User, Note, TimetableEntry, Event, LostFoundItem, UserRole } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// Users
// ============================================================================

export async function getOrCreateUser(
  email: string,
  name: string,
  _googleId: string
): Promise<User> {
  const { data: existing } = await supabase.from("users").select("*").eq("email", email).single();

  if (existing) {
    return existing;
  }

  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      email,
      name,
      role: "student",
      created_at: new Date(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return newUser;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data || null;
}

export async function updateUserRole(email: string, role: UserRole): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("email", email);

  if (error) throw new Error(`Failed to update user role: ${error.message}`);
}

// ============================================================================
// Notes
// ============================================================================

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch notes: ${error.message}`);
  return data || [];
}

export async function getNotesByCourse(course: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("course", course)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch notes by course: ${error.message}`);
  return data || [];
}

/**
 * Get notes filtered by user's branch, semester, and year
 * Notes match if:
 * - branches is empty (all branches) OR user's branch is in branches array
 * - semesters is empty (all semesters) OR user's semester is in semesters array
 * - year_of_study is null OR matches user's year
 */
export async function getNotesByUserProfile(
  branch: string,
  semester?: number,
  year_of_study?: number
): Promise<Note[]> {
  // Get all notes first, then filter in JS since Supabase array contains is tricky
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch notes: ${error.message}`);
  if (!data) return [];

  // Normalize branch for robust matching (remove spaces, lowercase)
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
  const studentBranch = normalize(branch || "");

  // Filter notes based on user's profile
  const filtered = data.filter(note => {
    // Check branch: match if branches is empty/null OR user's branch is included
    const branchMatch = !note.branches || note.branches.length === 0 ||
      note.branches.some((b: string) => {
        const nb = normalize(b);
        return nb === studentBranch || nb.includes(studentBranch) || studentBranch.includes(nb);
      });

    // Check semester: match if semesters is empty/null OR user's semester is included
    const semesterMatch = !note.semesters || note.semesters.length === 0 ||
      (semester !== undefined && note.semesters.some((s: number) => Number(s) === Number(semester)));

    // Check year: match if year_of_study is null OR matches user's year
    const yearMatch = !note.year_of_study || Number(note.year_of_study) === Number(year_of_study);

    const isMatch = branchMatch && semesterMatch && yearMatch;

    if (!isMatch) {
      console.log(`DEBUG: Note "${note.title}" excluded - BranchMatch: ${branchMatch}, SemMatch: ${semesterMatch}, YearMatch: ${yearMatch}`);
      if (!branchMatch) console.log(`  Expected branch (normalized): "${studentBranch}", Note branches:`, note.branches?.map(normalize));
      if (!semesterMatch) console.log(`  Expected sem: ${semester}, Note sems:`, note.semesters);
      if (!yearMatch) console.log(`  Expected year: ${year_of_study}, Note year:`, note.year_of_study);
    }

    return isMatch;
  });

  return filtered;
}

export async function getNoteById(id: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch note: ${error.message}`);
  }

  return data || null;
}

export async function createNote(
  note: Omit<Note, "id" | "created_at">
): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .insert({
      ...note,
      created_at: new Date(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create note: ${error.message}`);
  return data;
}

export async function updateNote(
  id: string,
  note: Partial<Omit<Note, "id" | "created_at">>
): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .update(note)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update note: ${error.message}`);
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Failed to delete note: ${error.message}`);
}

// ============================================================================
// Timetable
// ============================================================================

export async function getTimetable(course?: string): Promise<TimetableEntry[]> {
  let query = supabase.from("timetable").select("*");

  if (course) {
    query = query.eq("course", course);
  }

  const { data, error } = await query.order("day", { ascending: true });

  if (error) throw new Error(`Failed to fetch timetable: ${error.message}`);
  return data || [];
}

export async function createTimetableEntry(
  entry: Omit<TimetableEntry, "id">
): Promise<TimetableEntry> {
  const { data, error } = await supabase
    .from("timetable")
    .insert(entry)
    .select()
    .single();

  if (error) throw new Error(`Failed to create timetable entry: ${error.message}`);
  return data;
}

export async function updateTimetableEntry(
  id: string,
  entry: Partial<Omit<TimetableEntry, "id">>
): Promise<TimetableEntry> {
  const { data, error } = await supabase
    .from("timetable")
    .update(entry)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update timetable entry: ${error.message}`);
  return data;
}

// ============================================================================
// Events
// ============================================================================

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch events: ${error.message}`);
  return data || [];
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("starts_at", now)
    .order("starts_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch upcoming events: ${error.message}`);
  return data || [];
}

export async function createEvent(event: Omit<Event, "id">): Promise<Event> {
  const { data, error } = await supabase
    .from("events")
    .insert(event)
    .select()
    .single();

  if (error) throw new Error(`Failed to create event: ${error.message}`);
  return data;
}

export async function updateEvent(
  id: string,
  event: Partial<Omit<Event, "id">>
): Promise<Event> {
  const { data, error } = await supabase
    .from("events")
    .update(event)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update event: ${error.message}`);
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Failed to delete event: ${error.message}`);
}

// ============================================================================
// Lost & Found
// ============================================================================

export async function getLostFoundItems(): Promise<LostFoundItem[]> {
  const { data, error } = await supabase
    .from("lostfound")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch lost & found items: ${error.message}`);
  return data || [];
}

export async function createLostFoundItem(
  item: Omit<LostFoundItem, "id" | "created_at">
): Promise<LostFoundItem> {
  const { data, error } = await supabase
    .from("lostfound")
    .insert({
      ...item,
      created_at: new Date(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create lost & found item: ${error.message}`);
  return data;
}

export async function updateLostFoundItem(
  id: string,
  item: Partial<Omit<LostFoundItem, "id" | "created_at">>
): Promise<LostFoundItem> {
  const { data, error } = await supabase
    .from("lostfound")
    .update(item)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update lost & found item: ${error.message}`);
  return data;
}

export async function getLostFoundItemById(id: string): Promise<LostFoundItem | null> {
  const { data, error } = await supabase
    .from("lostfound")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch lost & found item: ${error.message}`);
  }

  return data || null;
}

export async function deleteLostFoundItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("lostfound")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Failed to delete lost & found item: ${error.message}`);
}

// ============================================================================
// Super Admin Stats
// ============================================================================

export async function getAdminStats() {
  const [
    { count: totalUsers },
    { count: students },
    { count: admins },
    { count: totalNotes },
    { count: totalEvents },
    { count: pendingRequests }
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("notes").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("admin_requests").select("*", { count: "exact", head: true }).eq("status", "pending")
  ]);

  // Get recent signups (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentUsers } = await supabase
    .from("users")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  return {
    totalUsers: totalUsers || 0,
    students: students || 0,
    admins: admins || 0,
    totalNotes: totalNotes || 0,
    totalEvents: totalEvents || 0,
    pendingRequests: pendingRequests || 0,
    recentSignups: recentUsers?.length || 0
  };
}
