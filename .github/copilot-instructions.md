# AI Coding Agent Instructions for Smart Campus Assistant

**This is the authoritative guide for GitHub Copilot, Cursor, and all AI coding agents contributing to this project.**

See the full technical specification in [Master_Prompt.md](../docs/Master_Prompt.md) for comprehensive architecture details.

---

## Quick Facts

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + TailwindCSS + ShadCN UI
- **Backend**: Vercel serverless functions (Next.js API routes / Server Actions)
- **Database**: Supabase Postgres with Row Level Security
- **Auth**: NextAuth.js + Google OAuth (JWT sessions)
- **Storage**: Google Drive PDFs + serverless proxy routes
- **AI**: OpenAI/Groq/Mistral via `/api/chat` serverless function

---

## Critical Rules (Non-negotiable)

1. **TypeScript everywhere** — no plain JavaScript. Use explicit return types.
2. **Never hardcode secrets** — all API keys, tokens in `process.env.*` only (Vercel environment).
3. **Types are single-source-of-truth** — maintain all types/schemas in `/lib/types.ts`.
4. **Role-based access** — every admin endpoint MUST validate `session.user.role === "admin"`.
5. **Try-catch all serverless functions** — return `NextResponse.json({ error: "..." }, { status: 500 })` on failure.
6. **Mobile-first design** — TailwindCSS responsive breakpoints (sm, md, lg, xl).
7. **No random folder creation** — all code fits the prescribed structure (see below).

---

## Project Structure

```
app/
├── (dashboard)/dashboard/page.tsx   # Main student dashboard
├── admin/                           # Admin-only routes (verify session.user.role === "admin")
│   ├── notes/page.tsx              # Admin: register notes from Drive
│   ├── events/page.tsx             # Admin: create/edit events
│   └── timetable/page.tsx          # Admin: manage timetable entries
├── notes/page.tsx                   # Student: list & view notes
├── notes/[id]/page.tsx             # Note detail + PDF preview
├── timetable/page.tsx               # Student: view timetable
├── lostfound/page.tsx               # Lost & Found portal
├── events/page.tsx                  # Upcoming events
└── api/
    ├── chat/route.ts                # Chatbot: POST { message } → { reply }
    ├── notes/route.ts               # GET notes, POST admin creates
    ├── notes/[id]/download/route.ts # Direct drive proxy or redirect
    ├── events/route.ts              # GET/POST events
    ├── timetable/route.ts           # GET/POST timetable
    ├── classfinder/route.ts         # GET classfinder?query=CS101
    ├── lostfound/route.ts           # GET/POST lost & found items
    └── auth/[...nextauth]/route.ts  # NextAuth config + Google OAuth

components/
├── ui/*                             # ShadCN / Radix UI components
├── navbar.tsx                       # Top navigation bar
├── sidebar.tsx                      # Desktop sidebar (hidden on mobile)
├── pdf-viewer.tsx                   # PDF.js wrapper for in-browser preview
├── searchbar.tsx
└── chatbot.tsx                      # Chat UI

lib/
├── types.ts                         # ALL TypeScript interfaces (users, notes, events, etc.)
├── supabase.ts                      # Supabase client + query helpers
├── auth.ts                          # Session helpers + role checks
├── drive.ts                         # Google Drive file_id ↔ download_url conversion
└── openai.ts                        # LLM API wrapper (OpenAI/Groq/Mistral)
```

---

## Database Schema (Immutable)

Never add/remove columns without explicit team approval.

```sql
-- users
id (uuid) | email (text) | name (text) | role (enum: "student" | "admin") | created_at

-- notes
id (uuid) | title | course | file_id | drive_url | created_by (uuid) | created_at

-- timetable
id (uuid) | course | day | start_time (time) | end_time (time) | room | faculty

-- events
id (uuid) | title | description | starts_at | ends_at | created_by (uuid)

-- lostfound
id (uuid) | item_name | description | status (enum: "lost" | "found" | "claimed") | contact | created_at
```

---

## Common Patterns & Examples

### 1. Protected Admin Endpoint
```typescript
// app/api/admin/notes/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Your logic here
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

### 2. Type Safety
```typescript
// lib/types.ts
export interface Note {
  id: string;
  title: string;
  course: string;
  file_id: string;
  drive_url: string;
  created_by: string;
  created_at: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
  created_at: Date;
}

// Usage in components:
const notes: Note[] = await fetchNotes();
```

### 3. Supabase Query
```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use only in server code
);

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*");
  
  if (error) throw new Error(`Failed to fetch notes: ${error.message}`);
  return data;
}
```

### 4. Serverless Function (No Hardcoding Secrets)
```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { message } = await req.json();
  
  // ✅ API key from environment
  const apiKey = process.env.OPENAI_API_KEY;
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: message }],
    }),
  });
  
  const data = await response.json();
  return NextResponse.json({ reply: data.choices[0].message.content });
}
```

### 5. Responsive Component
```typescript
// Dark-first, mobile-first TailwindCSS
export function StudentCard() {
  return (
    <div className="bg-neutral-900 text-neutral-100 p-4 md:p-6 lg:p-8">
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold">Course Name</h2>
      <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 rounded-md transition">
        Download
      </button>
    </div>
  );
}
```

---

## Workflows

### Adding a New Student Feature
1. Create feature branch: `git checkout -b feature/classroom-finder`
2. If backend needed: add route to `app/api/classfinder/route.ts` with proper auth
3. Add types to `lib/types.ts`
4. Create page in `app/classfinder/page.tsx`
5. Import ShadCN components, use TailwindCSS for styling
6. Test TypeScript strict mode: `npm run type-check`
7. PR with description: "What changed, why, which spec section"

### Adding an Admin Feature
1. Create route in `app/admin/<feature>/page.tsx`
2. Verify role-based access: `session.user.role === "admin"`
3. Create corresponding `/api/admin/<feature>/route.ts` endpoint
4. Add database query helpers to `lib/supabase.ts`
5. Validate input in the API route

### Integrating Google Drive
- Use `file_id` (extracted from share link) to construct: `https://drive.google.com/uc?export=download&id=FILE_ID`
- Store both `file_id` and `drive_url` in database for flexibility
- Helper in `lib/drive.ts` to convert between formats

### Chatbot Integration
- All LLM calls go through `/api/chat/route.ts`
- Never expose API keys to frontend
- System prompt should discourage hallucinations (reference FAQ or admin-approved context)
- Support streaming responses where possible

---

## Testing & Validation

- **TypeScript**: `npm run type-check` (strict mode enabled)
- **Linting**: ESLint must pass before merge
- **Formatting**: Prettier auto-format on save
- **Environment**: Vercel preview URL auto-generated on PR
- **Database**: Test schema queries in Supabase Studio before deploying

---

## When in Doubt

1. **Architecture question?** → Read [Master_Prompt.md](../docs/Master_Prompt.md)
2. **DB schema unsure?** → Check `lib/types.ts` and schema section above
3. **Should this be a server component or client?** → Default to server; only client if interactive or uses hooks
4. **Is this an admin feature?** → Requires role check in API + conditional UI on frontend
5. **Secrets management?** → ALWAYS use `process.env.*`, set in Vercel dashboard, never commit `.env.local`

---

## Anti-Patterns (Don't Do These)

❌ Hardcoding API keys or secrets anywhere  
❌ Creating new folders outside the prescribed structure  
❌ Plain JavaScript (use TypeScript)  
❌ Storing PDFs in the Git repo  
❌ Bypassing role checks  
❌ Duplicating types (use `/lib/types.ts` as single source of truth)  
❌ Forgetting try-catch in serverless functions  
❌ Desktop-first responsive design (mobile-first only)  

---

**Last Updated**: December 17, 2025  
**Maintainers**: Project Lead, AI Coding Agents  
**For changes**: Update this file alongside code changes.
