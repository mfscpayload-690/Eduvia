/**
 * Type definitions for Eduvia
 * Single source of truth for all domain models
 */

// ============================================================================
// Users & Authentication
// ============================================================================

export type UserRole = "student" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: Date;
}

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  expires: string;
}

// ============================================================================
// Notes (Google Drive PDFs)
// ============================================================================

export interface Note {
  id: string;
  title: string;
  course: string;
  file_id: string; // Google Drive file ID
  drive_url: string; // Direct download URL
  created_by: string; // User ID
  created_at: Date;
}

export interface CreateNoteDTO {
  title: string;
  course: string;
  file_id: string;
  drive_url: string;
}

// ============================================================================
// Timetable
// ============================================================================

export type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export interface TimetableEntry {
  id: string;
  course: string;
  day: Day;
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  room: string;
  faculty: string;
}

export interface CreateTimetableDTO {
  course: string;
  day: Day;
  start_time: string;
  end_time: string;
  room: string;
  faculty: string;
}

// ============================================================================
// Events
// ============================================================================

export interface Event {
  id: string;
  title: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
  created_by: string; // User ID
}

export interface CreateEventDTO {
  title: string;
  description: string;
  starts_at: Date;
  ends_at: Date;
}

// ============================================================================
// Lost & Found
// ============================================================================

export type LostFoundStatus = "lost" | "found" | "claimed";

export interface LostFoundItem {
  id: string;
  item_name: string;
  description: string;
  status: LostFoundStatus;
  contact: string; // Email or phone
  created_at: Date;
}

export interface CreateLostFoundDTO {
  item_name: string;
  description: string;
  status: LostFoundStatus;
  contact: string;
}

// ============================================================================
// API Response Envelopes
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// Chat / Chatbot
// ============================================================================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  context?: string; // Optional FAQ or campus info
}

export interface ChatResponse {
  reply: string;
  sources?: string[]; // Optional references
}
