# Content Approvals

A simple internal tool for uploading client social content by month and approving it.

- One shared team password gates the whole app (no individual accounts).
- Each **client** has a folder-like page. Content is grouped by **month**, with a
  previous/next navigator (defaults to the current month).
- Each post (photo or video) can be marked **Pending**, **Approved**, or **Needs
  Changes** (with a note explaining what to fix).

## Stack

- Next.js (App Router) + Tailwind
- Postgres via Prisma (Neon, provisioned through the Vercel Marketplace)
- Vercel Blob for storing uploaded media

Live at: https://post-upload-app-five.vercel.app
Repo: https://github.com/sonderclicks/PostApp
Vercel project: `sonder-clicks-projects/post-upload-app`

## Local setup

1. Make sure you're linked to the Vercel project and have pulled env vars:
   ```bash
   vercel link
   vercel env pull
   ```
   This creates `.env.local` with `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`,
   `TEAM_PASSWORD`, and `AUTH_SECRET`.
2. Push the schema to the database (only needed after changing `prisma/schema.prisma`):
   ```bash
   npm run db:push
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 and log in with the `TEAM_PASSWORD` value.

## Deploying

Pushing to `main` on GitHub auto-deploys to production (GitHub is connected to the
Vercel project). To deploy manually instead: `vercel --prod`.

## Adding a new client to Vercel from scratch (reference)

If you ever need to set this up under a different Vercel project:

1. `vercel link`
2. `vercel blob create-store <name> --access public --yes`
3. `vercel integration add neon` (requires accepting Neon's marketplace terms in the
   browser first — the CLI will print a link if needed)
4. `vercel env add TEAM_PASSWORD production` (repeat for `preview` and `development`)
5. `vercel env add AUTH_SECRET production` (repeat for `preview` and `development`;
   generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
6. `vercel env pull` then `npm run db:push`
