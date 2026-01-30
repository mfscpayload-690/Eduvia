# Fork & Setup Guide for eduvia

This guide will help you fork the eduvia project and deploy your own version for your institution.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** or **pnpm** package manager
- **Git** installed and configured
- A **GitHub** account
- A **Supabase** account (free tier works)
- A **Vercel** account for deployment (optional, free tier available)
- A **Google Cloud Console** account for OAuth setup

---

## Step 1: Fork the Repository

1. Go to [https://github.com/mfscpayload-690/eduvia](https://github.com/mfscpayload-690/eduvia)
2. Click the **Fork** button in the top-right
3. Choose your account/organization
4. Clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/eduvia.git
cd eduvia
```

---

## Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

---

## Step 3: Set Up Supabase Database

### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to initialize

### 3.2 Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run this schema:

```sql
-- Users table
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'student'::text CHECK (role = ANY (ARRAY['student'::text, 'admin'::text, 'super_admin'::text])),
  created_at timestamp with time zone DEFAULT now(),
  college text,
  mobile text,
  semester integer,
  year_of_study integer,
  branch text,
  program_type text CHECK (program_type = ANY (ARRAY['B.Tech'::text, 'M.Tech'::text])),
  profile_completed boolean DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users RLS policies
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Notes table
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  course text NOT NULL,
  file_id text NOT NULL,
  drive_url text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  semester integer,
  year_of_study integer,
  branches text[],
  semesters integer[],
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view notes" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Admins can manage notes" ON public.notes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin'))
);

-- Events table
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  starts_at timestamp with time zone NOT NULL,
  ends_at timestamp with time zone NOT NULL,
  created_by uuid NOT NULL,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin'))
);

-- Timetable table
CREATE TABLE public.timetable (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course text NOT NULL,
  day text NOT NULL CHECK (day = ANY (ARRAY['Monday'::text, 'Tuesday'::text, 'Wednesday'::text, 'Thursday'::text, 'Friday'::text, 'Saturday'::text])),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  room text NOT NULL,
  faculty text NOT NULL,
  CONSTRAINT timetable_pkey PRIMARY KEY (id)
);

-- Timetable Grid table
CREATE TABLE public.timetable_grid (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  semester integer NOT NULL,
  year integer NOT NULL,
  branch text NOT NULL,
  section text DEFAULT ''::text,
  schedule_config jsonb NOT NULL,
  schedule jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT timetable_grid_pkey PRIMARY KEY (id)
);

ALTER TABLE public.timetable_grid ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view timetables" ON public.timetable_grid FOR SELECT USING (true);
CREATE POLICY "Admins can manage timetables" ON public.timetable_grid FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin'))
);

-- Lost & Found table
CREATE TABLE public.lostfound (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'lost'::text CHECK (status = ANY (ARRAY['lost'::text, 'found'::text, 'claimed'::text])),
  contact text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  CONSTRAINT lostfound_pkey PRIMARY KEY (id),
  CONSTRAINT lostfound_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

ALTER TABLE public.lostfound ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lost & found" ON public.lostfound FOR SELECT USING (true);
CREATE POLICY "Users can create items" ON public.lostfound FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their items" ON public.lostfound FOR UPDATE USING (auth.uid() = user_id);

-- Admin Requests table
CREATE TABLE public.admin_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  college text,
  mobile text,
  reason text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by text,
  CONSTRAINT admin_requests_pkey PRIMARY KEY (id),
  CONSTRAINT admin_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Chat Sessions table
CREATE TABLE public.chat_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New Chat'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Chat Messages table
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type = ANY (ARRAY['CLASS_UPDATE'::text, 'NEW_NOTE'::text, 'EVENT'::text, 'LOST_FOUND'::text])),
  link text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Chat session timestamp trigger function
CREATE OR REPLACE FUNCTION update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions SET updated_at = NOW() WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

CREATE TRIGGER update_chat_session_on_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_session_timestamp();
```

### 3.3 Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (for client-side)
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`) - ⚠️ Keep secret!

---

## Step 4: Set Up Google OAuth

### 4.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-domain.com/api/auth/callback/google` (for production)
7. Copy **Client ID** and **Client Secret**

---

## Step 5: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Integration (Optional - choose one)
# Gemini (Recommended)
NEXT_PUBLIC_LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key

# OR OpenAI
# NEXT_PUBLIC_LLM_PROVIDER=openai
# OPENAI_API_KEY=your_openai_api_key

# OR Groq
# NEXT_PUBLIC_LLM_PROVIDER=groq
# GROQ_API_KEY=your_groq_api_key
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Get Gemini API Key:**
- Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create API key

---

## Step 6: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and test:
1. Sign in with Google
2. Complete your profile
3. Test features

---

## Step 7: Deploy to Vercel

### 7.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. **Import Project** → Select your forked repository
3. Vercel will auto-detect Next.js

### 7.2 Configure Environment Variables

Add all variables from `.env.local` in Vercel dashboard:
- **Settings** → **Environment Variables**
- Add all keys (except change `NEXTAUTH_URL` to your deployed URL)

### 7.3 Deploy

Click **Deploy** and wait for build to complete!

---

## Customization

### Update Branding

1. Replace logo: `public/assets/eduvia_title_only.png`
2. Update `app/layout.tsx` metadata
3. Modify colors in `tailwind.config.ts`

### Change Institution Info

Update references to "IHRD College of Engineering Kallooppara" throughout the codebase.

---

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies are correct

### OAuth Not Working
- Verify redirect URIs match exactly
- Check Google OAuth credentials

### Build Errors
- Run `npm run type-check` for TypeScript errors
- Ensure all environment variables are set

---

## Need Help?

- Check the [original repository issues](https://github.com/mfscpayload-690/eduvia/issues) for common problems
- Review the codebase - it's well-documented!
- Join relevant Next.js/Supabase communities

---

## License

Remember to keep the MIT License and attribution to the original team when forking!

---

*Good luck with your fork! 🚀*
