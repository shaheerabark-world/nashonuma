# NashoNuma

This repo holds two apps:

| Folder | What it is | Port |
|---|---|---|
| [`nashonuma-be/`](nashonuma-be/) | API: NestJS, TypeORM and PostgreSQL | 3001 (`/api`) |
| [`nashonuma-fe/`](nashonuma-fe/) | Web app: Vite, React 18 and TypeScript | 5173 |

Each folder has its own README with more detail: the API's routes, scripts and structure, and the web app's pages and architecture.

## What you need

- Node.js 18 or later, with npm
- Docker, to run PostgreSQL 16. You can use your own Postgres instead; see [Using your own Postgres](#using-your-own-postgres).

## Quick start: full stack

Use two terminals.

### 1. Backend (`nashonuma-be`)

```bash
cd nashonuma-be
docker compose up -d          # Postgres 16 on :5432 (creates the nashonuma and nashonuma_test databases)
npm install
cp .env.example .env          # first time only
npm run migration:run         # create the tables
npm run seed                  # demo users and sample data (safe to run again)
npm run start:dev             # http://localhost:3001/api
```

### 2. Frontend (`nashonuma-fe`)

Env files are git-ignored, so a fresh clone has no `.env.development`. Create it first:

```bash
cd nashonuma-fe
echo "VITE_API_URL=/api" > .env.development   # first time only
npm install
npm run dev                   # http://localhost:5173
```

Open http://localhost:5173. The app sends you to `/login`. Vite forwards `/api` to `http://localhost:3001`, so you don't need to set up CORS for development.

### Demo accounts

The seed creates these accounts. They all use the password in `SEED_PASSWORD` (default `Password123!`).

| Email | Role |
|---|---|
| clinician@nashonuma.test | clinician |
| parent@nashonuma.test | parent |
| supervisor@nashonuma.test | supervisor |
| programme@nashonuma.test | programme |
| researcher@nashonuma.test | researcher |
| admin@nashonuma.test | admin |

## Quick start: frontend only (no backend)

If `VITE_API_URL` isn't set, the web app runs on sample data stored in localStorage. There is no sign-in, and you can open any role's pages directly.

```bash
cd nashonuma-fe
npm install
npm run dev                   # e.g. http://localhost:5173/clinician/queue
```

If you created `.env.development` earlier, delete it or remove its `VITE_API_URL` line first.

## Configuration

Backend settings live in `nashonuma-be/.env`, copied from `.env.example`:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | API port. If you change it, change the proxy target in `nashonuma-fe/vite.config.ts` too. |
| `DATABASE_URL` | `postgres://nashonuma:nashonuma@localhost:5432/nashonuma` | Postgres connection |
| `JWT_SECRET` | placeholder | **Change this** to a long random string outside local development |
| `JWT_EXPIRES_IN` | `12h` | How long a login token lasts |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed browser origin |
| `SEED_PASSWORD` | `Password123!` | Password for the demo accounts |

The frontend has one setting, `VITE_API_URL`, in `nashonuma-fe/.env.development`. Set it to `/api` to use the backend, or leave it unset to use localStorage sample data.

### Using your own Postgres

Skip `docker compose up` and point `DATABASE_URL` at your server. For the e2e tests, also create a `nashonuma_test` database. [`nashonuma-be/docker/init-test-db.sql`](nashonuma-be/docker/init-test-db.sql) shows how.

## Tests and builds

```bash
# Backend
cd nashonuma-be
npm test                      # unit tests
npm run test:e2e              # API tests against nashonuma_test (that database is wiped first)
npm run build && npm start    # production build into dist/, then run it

# Frontend
cd nashonuma-fe
npm test                      # scoring, parity, every page in EN/MN/UR
npm run typecheck
npm run build                 # production build into dist/
npm run preview               # serve the production build
```

## Common tasks

| Task | Command (in `nashonuma-be`) |
|---|---|
| Reset the database (drop, migrate, seed) | `npm run db:reset` (blocked when `NODE_ENV=production`) |
| Create a migration after changing entities | `npm run migration:generate -- src/migrations/<Name>` |
| Undo the last migration | `npm run migration:revert` |
| Stop Postgres | `docker compose down` (add `-v` to delete its data too) |

## Troubleshooting

- **Port 5432 already in use.** Another Postgres is running. Stop it, or change the host port in `docker-compose.yml` and in `DATABASE_URL`.
- **Login fails or the frontend shows API errors.** Check that the API is running on port 3001, and that you ran `migration:run` and `seed`.
- **The frontend shows sample data and no login page.** `nashonuma-fe/.env.development` is missing, or doesn't set `VITE_API_URL=/api`. Restart `npm run dev` after you change it.

> The sub-READMEs still use the projects' old folder names: `nashonuma-api` means `nashonuma-be`, and `nashonuma-react` means `nashonuma-fe`.
