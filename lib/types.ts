/**
 * Type definitions for eduvia
 * Single source of truth for all domain models
 */

// ============================================================================
// Users & Authentication
// ============================================================================

export type UserRole = "student" | "admin" | "super_admin";

export type BranchOfStudy =
  | "Computer Science and Engineering(CS)"
  | "Computer Science and Engineering(CYBERSECURITY)"
  | "Electronics and Communication Engineering (EC)"
  | "Electrical and Electronics Engineering (EE)"
  | "M.Tech in Computer Science and Engineering(Cyber Forensics and Information Security)";

export type ProgramType = "B.Tech" | "M.Tech";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  college?: string;
  mobile?: string;
  semester?: number;
  year_of_study?: number;
  branch?: BranchOfStudy;
  program_type?: ProgramType;
  profile_completed: boolean;
  created_at: Date;
}

export interface UpdateProfileDTO {
  name?: string;
  college: string;
  mobile: string;
  semester: number;
  year_of_study: number;
  branch: BranchOfStudy;
  program_type: ProgramType;
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
// Admin Access Requests
// ============================================================================

export type AdminRequestStatus = "pending" | "approved" | "rejected";

export interface AdminRequest {
  id: string;
  user_id: string;
  name: string;
  email: string;
  college: string;
  mobile: string;
  reason?: string;
  status: AdminRequestStatus;
  created_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
}

export interface CreateAdminRequestDTO {
  reason?: string;
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
  branches?: string[]; // Array of branch names this note applies to
  semesters?: number[]; // Array of semesters this note applies to
  year_of_study?: number;
  created_by: string; // User ID
  created_at: Date;
}

export interface CreateNoteDTO {
  title: string;
  course: string;
  file_id: string;
  drive_url: string;
  branches?: string[];
  semesters?: number[];
  year_of_study?: number;
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
