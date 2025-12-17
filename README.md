# Eduvia

A hosted web application providing essential campus utilities for students and faculty. Access the live application at your institution's domain.

**Tech Stack**: Next.js 14 | React | TypeScript | TailwindCSS | Supabase | NextAuth.js | Vercel

---

## For Users

Access the application through your browser using your institutional Google account. No installation required.

### Features

**Student Access**
- View your course timetable
- Access and download shared course notes
- Report or search lost and found items
- Browse upcoming campus events
- Chat with AI study assistant

**Admin Access** (faculty and staff)
- Manage course timetables
- Register course notes from Google Drive
- Create and publish campus events
- Manage lost and found items

---

## For Developers

This section is for developers contributing to the codebase.

### Quick Start (Development)

```bash
git clone <repository>
cd smart-campus-assistant
npm install
cp .env.example .env.local
# Fill in .env.local with credentials
npm run dev
```

Visit http://localhost:3000

### Table of Contents

- [Tech Stack](#tech-stack)
- [Environment Configuration](#environment-configuration)
- [Database Schema](#database-schema)
- [Development Workflow](#development-workflow)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)


---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + React + TypeScript |
| Styling | TailwindCSS + ShadCN UI |
| Backend | Vercel Serverless Functions |
| Database | Supabase Postgres + RLS |
| Auth | NextAuth.js + Google OAuth |
| Storage | Google Drive |
| AI | OpenAI / Groq / Mistral |
| Deploy | Vercel



### Prerequisites for Development
- Node.js 18+
- npm or yarn
- Supabase account (free tier supported)
- Google Cloud project with OAuth configured
- LLM API key (OpenAI, Groq, or Mistral)

### Supabase
Get from Supabase dashboard > Settings > API:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### Google OAuth
Create OAuth 2.0 credentials in Google Cloud Console:
```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
```

Authorized redirect URIs:
- Development: http://localhost:3000/api/auth/callback/google
- Production: https://yourdomain.com/api/auth/callback/google

### NextAuth
Generate a secure random string:
```bash
openssl rand -base64 32
```

```env
NEXTAUTH_SECRET=<generated_secret>
NEXTAUTH_URL=http://localhost:3000  # Change for production
```

### LLM Provider (Choose one)
```env
NEXT_PUBLIC_LLM_PROVIDER=openai
OPENAI_API_KEY=sk_your_key

# OR
NEXT_PUBLIC_LLM_PROVIDER=groq
GROQ_API_KEY=your_key

# OR
NEXT_PUBLIC_LLM_PROVIDER=mistral
MISTRAL_API_KEY=your_key
```

---

## Database Schema

Run the SQL in Supabase SQL Editor (see `docs/schema.sql` for full migration):

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  course TEXT NOT NULL,
  file_id TEXT NOT NULL,
  drive_url TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course TEXT NOT NULL,
  day TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT NOT NULL,
  faculty TEXT NOT NULL
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id)
);

CREATE TABLE lostfound (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lost' CHECK (status IN ('lost', 'found', 'claimed')),
  contact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lostfound ENABLE ROW LEVEL SECURITY;
```

Then set up RLS policies (see `docs/schema.sql` for complete setup).

After first login, set your role to admin in Supabase:
1. Navigate to `tables > users`
2. Find your email
3. Change `role` from `student` to `admin`
4. Save

## Development

### Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint
npm run build        # Build for production
npm start            # Start production server
```

### Code Standards

- **TypeScript strict mode** - all files must pass type checking
- **ESLint** - code must pass linting
- **Prettier** - auto-formats on save (configure in VS Code)
- **Mobile-first** - responsive design with TailwindCSS breakpoints

Verify before committing:
```bash
npm run type-check && npm run lint
```

### Development Workflow

```
app/                          Next.js App Router
├── layout.tsx               Root layout
├── page.tsx                 Home redirect
├── (dashboard)/dashboard/   Main dashboard
├── notes/                   Notes pages
├── timetable/               Timetable viewer
├── events/, lostfound/, etc.
└── api/                     API routes
    ├── auth/[...nextauth]/  NextAuth handler
    ├── notes/               Notes CRUD
    ├── timetable/           Timetable CRUD
    ├── events/              Events CRUD
    ├── lostfound/           Lost & Found CRUD
    └── chat/                LLM chat

components/
├── ui/                      ShadCN UI components
├── navbar.tsx               Navigation
└── sidebar.tsx              Desktop sidebar

lib/
├── types.ts                 Type definitions (source of truth)
├── supabase.ts              DB queries
├── auth.ts                  Auth helpers
├── drive.ts                 Google Drive utilities
├── openai.ts                LLM wrapper
└── utils.ts                 Utilities
```

#### Adding Features

1. **Define types** in `lib/types.ts`
2. **Create page** in `app/[feature]/page.tsx`
3. **Add API route** in `app/api/[feature]/route.ts`
4. **Add DB queries** in `lib/supabase.ts` if needed
5. **Test locally**, then commit

#### Git Workflow

```bash
git checkout -b feature/my-feature
# Make changes
npm run type-check && npm run lint
git add .
git commit -m "feat: description of change"
git push origin feature/my-feature
# Create PR
```

## API Reference

### Authentication
- POST `/api/auth/signin` - Google OAuth challenge
- POST `/api/auth/callback` - OAuth redirect handler
- GET `/api/auth/session` - Current session
- POST `/api/auth/signout` - Sign out

### Notes
- GET `/api/notes` - List all notes (authenticated)
- POST `/api/notes` - Create note (admin only)
- GET `/api/notes/:id` - Get specific note
- GET `/api/notes/:id/download` - Download PDF

### Timetable
- GET `/api/timetable?course=CS101` - List entries (optional course filter)
- POST `/api/timetable` - Create entry (admin only)

### Events
- GET `/api/events?filter=upcoming` - List events
- POST `/api/events` - Create event (admin only)

### Lost & Found
- GET `/api/lostfound` - List items
- POST `/api/lostfound` - Report item (any user)

### Chat
- POST `/api/chat` - Send message to LLM assistant

All endpoints require authentication except `/api/auth/*`. Admin endpoints verify `session.user.role === 'admin'`.

## Deployment

The application is deployed on Vercel with automatic CI/CD. Commits to the main branch automatically deploy to production.

### Environment Variables
All required environment variables must be set in Vercel project settings:
- Supabase credentials
- Google OAuth keys
- LLM API key
- NextAuth secret

### Deployment Process

1. Code changes pushed to GitHub
2. Vercel automatically builds and tests
3. On success, deploys to production
4. Domain URL receives latest version

### Production Requirements

- Database tables created with RLS enabled
- Google OAuth redirect URIs configured for production domain
- NEXTAUTH_URL set to production domain
- All environment variables configured
- Database backups enabled

---

### Guidelines

- **No hardcoded secrets** — always use environment variables
- **TypeScript only** — no plain JavaScript
- **Types in `/lib/types.ts`** — single source of truth
- **Role-based access** — verify `session.user.role` in admin routes
- **Mobile-first design** — TailwindCSS responsive breakpoints
- **Clear PR descriptions** — what changed, why, which spec section

