🔥 eduvia — MASTER TECHNICAL SPEC FOR AI AGENTS

Version: 1.0
Purpose: Provide a deterministic engineering blueprint enabling autonomous coding agents (GitHub Copilot Agent, Google Antigravity, ChatGPT Agents, Cursor IDE Agents) to contribute code safely, consistently, and without architectural drift.

This document defines the source of truth for architecture, code style, component design, backend contracts, DB schema, and workflow expectations.
Agents MUST adhere strictly to these conventions.

1 — CORE PROJECT DESCRIPTION

Build a full-stack eduvia Web App with the following features:

Timetable viewer

Bus schedule viewer

Classroom finder

Event updates

Notes sharing (PDF preview + download) from Google Drive

Lost & Found management

Admin dashboard

Google OAuth for login

AI Chatbot for study help and app guidance (LLM-based)

The project MUST deploy the frontend + backend serverless functions on Vercel.

Backend data is stored in Supabase Postgres, and PDF files are stored externally in Google Drive, accessed via direct download links or serverless proxy routes.

2 — APPROVED TECH STACK (MANDATORY)
Frontend

Next.js 14+ (App Router)

React + TypeScript

TailwindCSS

ShadCN / Radix UI

Framer Motion (optional, for animations)

Backend

Next.js Server Actions OR Vercel Serverless Functions

Use Node.js / TypeScript runtime

Database

Supabase Postgres

Migrations MUST be handled via SQL files or Prisma (optional)

Authentication

NextAuth.js with Google OAuth

Session strategy: JWT

Storage

Google Drive for notes PDFs

Use direct download URLs or serverless proxy endpoints

AI Chatbot

Integrate OpenAI / Groq / Mistral via serverless /api/chat endpoint.

API keys MUST remain server-side only.

3 — GLOBAL ARCHITECTURAL PRINCIPLES

AI agents MUST follow these principles:

3.1 Single-source-of-truth

All types, schemas, and API contracts must reside in /lib/types.ts or /lib/schema.ts.

Never duplicate types across files.

3.2 Server-side protection

NO API keys, secrets, or tokens should ever appear in client components.

Use environment variables via Vercel (process.env.*).

3.3 Strict typing

All components MUST be written in TypeScript with explicit return types.

3.4 Error handling

Every serverless function must:

try { … } catch (error) {
  return NextResponse.json({ error: "MESSAGE" }, { status: 500 })
}

3.5 Role-based access

Admin-only routes must verify:
session.user.role === "admin"

3.6 Accessibility

Agents must ensure tailwind classes support good color contrast.

Use semantic HTML elements.

4 — PROJECT STRUCTURE (MANDATORY)
smart-campus/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (dashboard)/dashboard/page.tsx
│   ├── notes/page.tsx
│   ├── notes/[id]/page.tsx
│   ├── timetable/page.tsx
│   ├── lostfound/page.tsx
│   ├── events/page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── notes/page.tsx
│   │   ├── events/page.tsx
│   │   └── timetable/page.tsx
│   └── api/
│       ├── chat/route.ts
│       ├── notes/route.ts
│       ├── notes/[id]/download/route.ts
│       ├── events/route.ts
│       ├── timetable/route.ts
│       ├── classfinder/route.ts
│       ├── lostfound/route.ts
│       └── auth/[...nextauth]/route.ts
│
├── components/
│   ├── ui/*                # Prebuilt or ShadCN components
│   ├── navbar.tsx
│   ├── sidebar.tsx
│   ├── pdf-viewer.tsx
│   ├── searchbar.tsx
│   └── chatbot.tsx
│
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   ├── drive.ts            # Helpers to convert Google Drive share links
│   ├── openai.ts
│   ├── utils.ts
│   └── types.ts
│
├── styles/
│   └── globals.css
│
├── docs/
│   └── masterprompt.md
└── package.json


Agents MUST NOT create new random folders.
All components must reside under components/.
All server logic belongs under app/api/.

5 — DATABASE SCHEMA (SOURCE OF TRUTH)

AI agents must use these schemas for all queries.

users
id (uuid)
email (text)
name (text)
role (enum: "student" | "admin")
created_at (timestamp)

notes
id (uuid)
title (text)
course (text)
file_id (text)                      # Google Drive file id
drive_url (text)                    # direct download or share link
created_by (uuid)
created_at (timestamp)

timetable
id (uuid)
course (text)
day (text)
start_time (time)
end_time (time)
room (text)
faculty (text)

events
id (uuid)
title (text)
description (text)
starts_at (timestamp)
ends_at (timestamp)
created_by (uuid)

lostfound
id (uuid)
item_name (text)
description (text)
status (enum: "lost" | "found" | "claimed")
contact (text)
created_at (timestamp)


Agents must NOT deviate from these model names or fields.

6 — API CONTRACTS (MANDATORY)
6.1 Notes
GET /api/notes
→ { notes: [{ id, title, course, drive_url }] }

GET /api/notes/:id/download
→ redirect to direct download OR proxy file stream

POST /api/admin/notes
Body: { title, course, drive_url }
Auth: admin only

6.2 Timetable
GET /api/timetable?course=...
POST /api/admin/timetable   (admin only)

6.3 Events
GET /api/events?filter=upcoming
POST /api/admin/events      (admin only)

6.4 Lost & Found
GET /api/lostfound
POST /api/lostfound

6.5 Classroom Finder
GET /api/classfinder?query=CS101
→ { building, floor, room }

6.6 Chatbot
POST /api/chat
Body: { message: string }
Response: { reply: string, sources?: [...] }

7 — UI/UX RULES (AGENTS MUST FOLLOW)
Theme

Dark mode first

Tailwind classes must use text-neutral-* and bg-neutral-* scales

Admin dashboard uses slightly larger font sizes (accessibility)

Layout

Use a top navbar + left sidebar for desktop

Use a bottom tab bar for mobile

Components

Use ShadCN or Radix UI primitives (Button, Card, Dialog, Input, etc.)

Never hardcode inline styles unless necessary.

Responsiveness

Mobile first

Use Tailwind breakpoints sm, md, lg, xl

Accessibility

Use semantic <main> <nav> <section>

Provide ARIA labels for interactive elements

All buttons must have hover + focus states

8 — RULES FOR AI AGENTS (IMPORTANT)

AI agents MUST follow these rules:

✔ Only create code inside approved directories.
✔ Never create new frameworks or introduce hidden abstractions.
✔ TypeScript everywhere — no plain JS.
✔ Avoid “magic strings”; use constants/types.
✔ Error messages must be human-readable.
✔ Use async/await exclusively.
✔ Never expose env secrets in client-side code.
✔ All serverless functions must validate input.
✔ Must not auto-generate unnecessary files.
✔ Never alter masterprompt.md.

If uncertain, the agent MUST ask for clarification before generating code.

9 — DEVELOPMENT WORKFLOW RULES

AI agents must behave as if part of a human engineering team.

Workflow:

Create a feature branch

Generate files only within the scope of that feature

Produce a clear PR description with:

What changed

Why

Which part of spec it relates to

All code must pass:

ESLint

Prettier

TypeScript strict mode

Git Branch name rules:
feature/<name>
fix/<issue>
refactor/<component>
docs/<change>

10 — AI CHATBOT REQUIREMENTS
Minimal implementation:

/api/chat serverless route

Pass user prompt → LLM API

Return streaming or non-streaming text

Constraints:

No API keys on frontend

Should optionally support context injection (FAQ)

Avoid hallucinating campus-specific data — use system prompts

11 — EDGE CASES AGENTS MUST HANDLE

Missing or broken Google Drive URLs

Supabase downtime (return a friendly fallback message)

Unauthenticated user accessing protected routes

Admin trying to upload invalid data

Incorrect date/time formats

Large PDF downloads triggering timeouts (retry logic recommended)

12 — WHAT AGENTS MUST NOT DO

❌ Do NOT introduce alternative architectures
❌ Do NOT use Python backend inside this repo
❌ Do NOT store PDFs directly in repo
❌ Do NOT add heavy dependencies (like Firebase, NestJS, Django)
❌ Do NOT bypass role checks
❌ Do NOT produce code without strict typing

13 — FINAL DECLARATION

Any code generated MUST conform to this masterprompt.md file.
This is the official technical standard for the eduvia project.
Deviations are treated as architecture violations.

Agents must operate with clarity, determinism, and consistent patterns aligned with this spec.