# NashoNuma API

NestJS + TypeORM + PostgreSQL backend for the NashoNuma web app (`../nashonuma-react`).
It stores parent reports ("Check my child"), SRQ-20 wellbeing checks, children with their MORBAS
history, and the licensed SDQ text, behind JWT login with the app's six roles.

## Run it

```bash
docker compose up -d          # Postgres 16 on :5432 (creates nashonuma and nashonuma_test)
npm install
cp .env.example .env          # first time only
npm run migration:run
npm run seed
npm run start:dev             # http://localhost:3001/api
```

Then, in `../nashonuma-react`, run `npm run dev` and open http://localhost:5173. The web app's
`.env.development` sets `VITE_API_URL=/api`, and Vite proxies `/api` to port 3001.

### Demo accounts (from the seed)

All use the password in `SEED_PASSWORD` (default `Password123!`).

| Email | Role | Name |
|---|---|---|
| clinician@nashonuma.test | clinician | Dr Sana Iqbal |
| parent@nashonuma.test | parent | Shazia Bibi |
| supervisor@nashonuma.test | supervisor | Rukhsana Begum |
| programme@nashonuma.test | programme | Imran Khattak |
| researcher@nashonuma.test | researcher | Dr Hira Malik |
| admin@nashonuma.test | admin | Faisal Ahmed |

## Scripts

| Script | What it does |
|---|---|
| `start:dev` | API with reload |
| `build` / `start` | compile to `dist/` and run it |
| `migration:generate -- src/migrations/<Name>` | new migration from entity changes |
| `migration:run` / `migration:revert` | apply / undo migrations |
| `migration:check` | fails if the entities and the database differ |
| `seed` | all seeders (safe to run again) |
| `seed -- --only=users` | one seeder: users, children, morbas, reports, wellbeing, config |
| `db:reset` | drop everything, migrate, seed (blocked when `NODE_ENV=production`) |
| `test` | unit tests |
| `test:e2e` | API tests against the `nashonuma_test` database (it is wiped first) |

## Structure

```
src/
  main.ts, app.module.ts       global prefix /api, validation, JWT + roles guards
  config/data-source.ts        TypeORM settings shared by the app, the migration CLI and the seeders
  migrations/                  schema changes (synchronize is off)
  common/                      Role enum, @Public, @Roles, @CurrentUser, guards, base entity
  modules/<name>/              <name>.module.ts, .controller.ts, .service.ts, entities/, dto/
    auth/  users/  children/  reports/  wellbeing/  config/  events/
  seed/                        seed.ts runner, seeders/ (one per entity), data/ (sample JSON)
test/                          e2e tests
```

- Each entity lives in its own module and is registered with `TypeOrmModule.forFeature`.
- Controllers only route, guard and validate. Database work is in the services.
- Column names are snake_case in Postgres (`SnakeNamingStrategy`) and camelCase in code.
- Responses use the same field names as the web app's old mock JSON, with null fields left out, so the page code did not change.

## API

Every route needs `Authorization: Bearer <token>` except login.

| Method & path | Who | Notes |
|---|---|---|
| `POST /api/auth/login` | anyone | `{ email, password }` → `{ token, user }` |
| `GET /api/auth/me` | signed in | the current user |
| `GET /api/reports` | staff, parent | a parent gets only her own |
| `PUT /api/reports/:id` | parent, clinician, supervisor | upsert; the id comes from the phone. A parent can only create, and it is saved as `New` |
| `PATCH /api/reports/:id` | clinician, supervisor | `{ status: "New" \| "Seen" }` |
| `GET / PUT / PATCH /api/wellbeing[/:id]` | same as reports | status `New` \| `Contacted`; `ans` is 20 × 0/1 |
| `GET /api/children` | staff, parent | children with `hist` (MORBAS); a parent gets only hers |
| `POST /api/children/:id/assessments` | clinician | `{ name, dob, date, scores[7], marks? }`; creates the child if new, assigns `MB-` id |
| `GET /api/config` | signed in | `{ sdq: {...} \| null }` |
| `PUT /api/config/sdq` | admin | `{ items: { en?, ur?, mn? } }`, exactly 25 items per language |
| `GET /api/events?token=` | signed in | server-sent events: `change` `{ collection, id }` after each write |

## Notes

- Port 3000 was taken on the development machine, so the API uses **3001** (`PORT` in `.env`).
- Passwords are hashed with `bcryptjs`, which needs no native build on Windows.
- Live updates (`/events`) run in a single process. If you run more than one API instance, move `EventsService` onto Postgres `LISTEN/NOTIFY` or Redis.
