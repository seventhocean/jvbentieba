# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**剧本圈 (Juben Circle)** — A script-murder (剧本杀) fan community forum, similar to Tieba. Built with Next.js 14 App Router. Supports guest browsing, account registration, posting, nested comments (two-level), likes, favorites, following users/topics, and admin moderation.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start dev server
pnpm dev

# Production build
pnpm build
pnpm start

# Database
pnpm db:generate          # Generate Prisma client
pnpm db:migrate           # Run migrations (dev)
pnpm db:migrate:deploy    # Run migrations (production)
pnpm db:seed              # Seed initial data (4 topics + admin)
pnpm db:studio            # Open Prisma Studio

# Lint
pnpm lint
```

Default admin: `admin@juben.com` / `admin123456`

## Architecture

### Routing (Next.js App Router)

Route groups control auth visibility:
- `app/(public)/` — Guest-accessible pages (home, post detail, topic, search, user profile)
- `app/(auth)/` — Login/register pages
- `app/(app)/` — Auth-required pages (user center, new post, admin panel)
- `app/api/` — API routes (all use Next.js route handlers)

`middleware.ts` enforces auth redirects for `/me/:path*`, `/posts/new`, `/admin/:path*`.

### Database

PostgreSQL + Prisma ORM. Key models:
- **User** — email/password auth, role (USER/ADMIN), status (ACTIVE/BANNED)
- **Topic** — forum categories with slug, preset flag, post/follow counts
- **Post** — belongs to topic + author, has images, tracks like/comment/favorite/view counts
- **Comment** — two-level nesting via `parentId` self-relation
- **Like** — polymorphic target (POST or COMMENT), unique constraint prevents duplicates
- **Favorite** — user-post junction table
- **Follow** — polymorphic (follow USER or TOPIC)
- **Report** — report POST/COMMENT/USER with status tracking

Schema: `prisma/schema.prisma`. Seed: `prisma/seed.ts`.

### API Routes

All API routes live under `app/api/`. They use standard Next.js route handlers (`GET`, `POST`, etc.) rather than legacy API route format. Request/response patterns:
- Read data: directly from `db` in the route handler
- Auth: use `getServerSession` from `next-auth` with options from `lib/auth.ts`
- Validation: Zod schemas (imported per-route)
- Error handling: `NextResponse.json()` with appropriate status codes

### Auth

NextAuth.js with Credentials provider (email/password, bcrypt hashing). JWT sessions. Custom callbacks inject `id` and `role` into the session token. Auth config in `lib/auth.ts`, bootstrap route at `app/api/auth/[...nextauth]/route.ts`.

### State Management

- **Server-side**: Prisma queries in API routes and server components
- **Client-side**: Zustand for global state, React Query (`@tanstack/react-query`) for data fetching
- Shared providers wrapped in `components/providers.tsx`

### Shared Libraries

- `lib/db.ts` — Prisma singleton (globalThis caching for dev hot-reload)
- `lib/auth.ts` — NextAuth options
- `lib/auth-helpers.ts` — Client-side auth utilities
- `lib/redis.ts` — ioredis singleton (lazyConnect, globalThis caching)
- `lib/upload.ts` — Local file upload handler (saves to `uploads/YYYY/MM/`)
- `lib/utils.ts` — Shared utility functions (cn helper, etc.)

### Shared Components

Located in `components/`: `Header`, `PostCard`, `TopicCard`, `CommentList`, `ImageUploader`, `LoginDialog`, `Providers`.

### UI

TailwindCSS with dark theme. Radix UI primitives for dialogs, dropdowns, tabs, etc. Lucide React for icons. Sonner for toast notifications.

### Deployment

Docker Compose in `docker/`: app + PostgreSQL + Redis + Nginx. See `docker/docker-compose.yml`, `docker/Dockerfile`, `docker/nginx.conf`. SSL certs go in `certs/`.

## Environment Variables

Required in `.env.local` (copy from `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `NEXTAUTH_SECRET` — JWT signing key (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — Site URL
- `UPLOAD_DIR` / `NEXT_PUBLIC_UPLOAD_BASE` — File upload paths
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — Bootstrap admin credentials
