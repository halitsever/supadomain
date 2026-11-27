# AGENTS.md

Supadomain is a self-hosted domain expiry monitor (Nuxt 4, MongoDB) that reads expiry dates over RDAP when a domain is added or refreshed, checks them against alert thresholds every hour and sends Slack alerts to the people who run it.

## Verify a change

- CI (Node LTS) runs `npm ci` then `npm run build`. There are no tests or linters; check behavior with `npm run dev` against a local MongoDB.
- `npm ci` runs `nuxt prepare` as a postinstall step, which generates `.nuxt/`.
- The app needs `MONGODB_URI` and `NUXT_SESSION_PASSWORD` (at least 32 characters) in `.env`.

## Gotchas

- The admin account is seeded from `ADMIN_EMAIL` and `ADMIN_PASSWORD` (`server/plugins/setup.user.ts`), and only while the users collection is empty. Without `ADMIN_PASSWORD`, a random password is printed to the server log on first boot.
- `nuxt-api-shield` rate-limits `/api/auth/login` and writes its logs to `logs/`.
- `app/components/ui/` holds shadcn-vue components configured by `components.json`. Generate new ones with the shadcn-vue CLI so they match.
- Most files are not formatted to `.prettierrc` (2 spaces, print width 180). Format only the files you touch with `npx prettier --write <files>`.

## Docs site

- The project website is a VitePress site in `docs/`, published to https://projects.halit.org/supadomain/ by `.github/workflows/docs.yml` on pushes to `main` that touch `docs/**`.
- It has its own `docs/package.json` and lockfile. Build it with `cd docs && npm ci && npm run build`; the root install and build do not touch it.
- `docs/tsconfig.json` keeps the docs build away from the root tsconfig, which points at `.nuxt/`. Nuxt and Tailwind do not scan `docs/`.
- The site documents what the code does. When alert logic, RDAP handling or environment variables change, update the matching page in `docs/guide/`.

## Conventions

- Commit subjects use Conventional Commits, in English, with no body and no trailer.
- Work on a branch and open a pull request. The owner merges.
- New text has no emoji. Code comments are short, one line where possible, and explain why.
- README follows the owner's template. Images served from `halitsever-api.vercel.app` stay byte-for-byte; only the `title=` value of `api/repo-title` and the link around `api/issue` may be corrected.
- Version bumps and releases are done by the owner.
