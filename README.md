# Content Approvals

A simple internal tool for uploading client social content by month and approving it.

- One shared team password gates the whole app (no individual accounts).
- Each **client** has a folder-like page. Content is grouped by **month**, with a
  previous/next navigator (defaults to the current month).
- Each post (photo or video) can be marked **Pending**, **Approved**, or **Needs
  Changes** (with a note explaining what to fix).

## Stack

- Next.js (App Router) + Tailwind
- Postgres via Prisma (works with any Postgres provider; Vercel Marketplace → Neon is the default)
- Vercel Blob for storing uploaded media

## Local setup

1. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — a Postgres connection string
   - `TEAM_PASSWORD` — the password your team will use to log in
   - `AUTH_SECRET` — any long random string (used to sign the login session cookie)
   - `BLOB_READ_WRITE_TOKEN` — from your Vercel Blob store (only needed for local dev;
     Vercel sets this automatically in deployments)
2. Push the schema to your database:
   ```bash
   npm run db:push
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 and log in with `TEAM_PASSWORD`.

## Deploying on Vercel

1. Push this repo to GitHub, then import it into Vercel.
2. In the Vercel project, add:
   - A **Postgres** database (Storage tab → Marketplace → e.g. Neon) — this sets
     `DATABASE_URL` automatically.
   - A **Blob** store (Storage tab → Blob) — this sets `BLOB_READ_WRITE_TOKEN`
     automatically.
3. Add `TEAM_PASSWORD` and `AUTH_SECRET` as environment variables in the Vercel project
   settings.
4. Run `npm run db:push` once (locally with `vercel env pull` first, or via a one-off
   `vercel` deployment) to create the tables in the production database.
5. Point your custom domain at the Vercel project (Settings → Domains).
