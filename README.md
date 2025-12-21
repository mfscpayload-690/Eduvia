# eduvia

**Status: Under Development**

This project is currently in active development. Features and functionality may change frequently.

---

Your all-in-one campus companion. Effortlessly manage your academic life with integrated tools for schedules, notes, events, and more.

---

## What is eduvia?

eduvia is a comprehensive campus management platform designed to streamline student and faculty interactions. Whether you're looking for your next class location, accessing shared course materials, or staying updated on campus events, eduvia brings everything you need into one unified platform.

---

## Features

### For Students

- **Timetable Viewer** - See your complete course schedule and classroom locations at a glance
- **Course Notes** - Access and download PDF notes shared by instructors
- **Classroom Finder** - Quickly locate any classroom on campus with built-in navigation
- **Event Calendar** - Stay informed about upcoming campus events and activities
- **Study Assistant** - Get help from an AI-powered chatbot for academic questions
- **Lost & Found** - Report missing items or find items others have turned in

### For Faculty & Administration

- **Timetable Management** - Create and update course schedules
- **Notes Registration** - Upload and share course materials with students
- **Event Creation** - Publish campus-wide announcements and events
- **Lost & Found Management** - Oversee lost and found operations

---

## Getting Started

### Sign In

1. Visit eduvia through your institution's portal
2. Click "Sign in with Google"
3. Authenticate with your institutional email
4. Start managing your campus life

### First Steps

- Review your complete course timetable
- Download important course materials from the Notes section
- Check the Events page for upcoming activities
- Use Classroom Finder to navigate campus

---

## For Developers

Detailed developer documentation is available in the `/docs` directory, including architecture specifications, setup instructions, and contribution guidelines.

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

---

## Web Analytics

- Analytics is enabled via `@vercel/analytics` and the `<Analytics />` component mounted in the root layout.
- No configuration is required; page views are tracked automatically in Vercel.
- To view metrics, open the project in Vercel → Analytics.

Local development works without errors, but events are collected from deployed environments.

