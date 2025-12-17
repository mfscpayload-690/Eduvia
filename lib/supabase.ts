import { createClient } from "@supabase/supabase-js";
import type { User, Note, TimetableEntry, Event, LostFoundItem } from "./types";

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
  googleId: string
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
