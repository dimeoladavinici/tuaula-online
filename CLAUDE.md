@AGENTS.md

# Tu Aula Online

## Stack
- Next.js 16 (App Router) + TypeScript
- Prisma 7 + PostgreSQL
- NextAuth v5 (Auth.js beta)
- Tailwind CSS v4
- @react-pdf/renderer for certificates

## Key commands
- `npm run dev` — start dev server
- `npx prisma generate` — regenerate Prisma client
- `npx prisma migrate dev` — run migrations
- `npx prisma studio` — open DB GUI

## Architecture notes
- Prisma v7: datasource URL goes in `prisma.config.ts`, NOT in schema.prisma
- Prisma client output: `src/generated/prisma` (gitignored, regenerated)
- Auth: credentials provider with bcrypt password hashing
- Roles: SUPER_ADMIN, TEACHER, STUDENT — enforced via middleware
- All video/file content is external (Google Drive, Loom) — platform only stores links
