# Repository Guidelines

## Project Structure & Module Organization
The Next.js App Router lives in `src/app`; API handlers sit in `src/app/api` and namespace views in `src/app/ns/[nsId]`. Shared integrations for Discord, VRChat, and GitHub live in `src/lib`, with UI pieces in `src/components`, domain types in `src/types`, and request helpers in `src/requests`. Prisma assets stay in `prisma/`, static files in `public/`, docs in `docs/`, and container support in `docker/`.

## Build, Test, and Development Commands
- `pnpm dev` – Start the hot-reload dev server for local checks.
- `pnpm build` – Compile the production bundle before pushing releases.
- `pnpm start` – Serve the compiled app for smoke tests.
- `pnpm lint` / `pnpm lint:fix` – Run Biome checks; `:fix` stages auto-fixes.
- `pnpm typecheck` – Run TypeScript `--noEmit`; treat failures as blockers.
- `pnpm prisma migrate dev` – Apply schema changes and regenerate the Prisma client.

## Coding Style & Naming Conventions
Biome (`biome.json`) enforces two-space indentation, trailing commas, and single quotes in TSX. Use strict TypeScript, prefer named exports from `src/lib`, and keep React components in `PascalCase` files. Hooks adopt the `useThing.ts` pattern inside the feature folder. Keep Tailwind layers aligned with `tailwind.config.ts`.

## Testing Guidelines
No dedicated harness exists yet; add unit or integration tests beside new features (e.g. `src/app/<feature>/__tests__`). Mock platform SDK calls to avoid hitting live APIs. Before opening a PR, run `pnpm lint`, `pnpm typecheck`, and a manual smoke test via `pnpm dev`. Align schema updates with `pnpm prisma migrate dev` and verify seeds when present.

## Commit & Pull Request Guidelines
Commits in this repo are concise statements (often Japanese) describing a single logical change; mirror that style and keep noise out of history. Lefthook enforces Biome checks on staged files, so address issues instead of skipping the hook. PRs should supply a focused summary, linked GitHub issues, UI screenshots or screencasts when visuals change, and confirmation that the standard commands were executed. Call out config or secret updates in the PR body.

## Security & Configuration Tips
Store platform tokens in `.env.local` or `.env.production` and never commit them. When using Docker, mirror variables in `docker/.env`. Avoid logging sensitive payloads in `src/lib`, double-check role toggles before enabling automation, and document operational overrides in `docs/` early.
