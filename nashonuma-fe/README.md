# NashoNuma — frontend (`nashonuma-fe`)

Vite + React 18 + TypeScript rebuild of the NashoNuma prototype. It should look and behave exactly
like the prototype's `working/nashonuma.html` (from the `nashonuma-code` project, which is not part
of this repo).

## Quick start

Requires Node 18 or later.

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # scoring, parity with the prototype, every page in EN/MN/UR
npm run typecheck    # tsc only
npm run build        # type-check + production build into dist/
npm run preview      # serve the production build
```

With no env file the app runs on **localStorage sample data** with no sign-in, so you can open any
role straight away (for example `/clinician/queue`).

## Backend (optional)

Data can be saved by the NestJS + Postgres API in `../nashonuma-api`. See its README to start it
(it listens on port 3001).

1. Create `.env.development` (env files are git-ignored, so a fresh clone has none):

   ```bash
   VITE_API_URL=/api
   ```

2. Start the API, then `npm run dev`. Vite proxies `/api` to `http://localhost:3001`, so the
   browser sees one origin.

When `VITE_API_URL` is set:

- You must sign in at `/login`. The token and user are kept in localStorage (`nn_token`, `nn_user`).
- Each account sees only its own role's pages. Switching role in the menu signs you out.
- A `401` from the API ends the session and sends you back to `/login`.
- Changes from other users arrive live over Server-Sent Events (`/api/events`).

Remove the line (or the file) to go back to localStorage sample data. Tests always use
localStorage, whatever the env says (`vite.config.ts` clears `VITE_API_URL` for Vitest).

## Routes

`/:role/:page`, for example `/clinician/reports` or `/parent/pcheck`. An unknown role goes to
`/supervisor/overview`, and an unknown page goes to the role's first page. `/login` exists only
when the API is on.

| Role | Pages |
|---|---|
| supervisor | overview, referrals, quality |
| clinician | queue, completed, reports, mothers, children, morbas, exercises |
| programme | dashboard, dhis, exports |
| researcher | validation, pairs |
| admin | instruments, users, audit, consent |
| parent | pcheck, psent, pwell, pexer |

**Mobile.** Below 768px (`useIsMobile`) the same app uses the prototype's `#mobile` layout, and the
sidebar becomes a drawer. The phone frame from the prototype is not used.

## Folder structure

```
src/
  main.tsx, App.tsx          router, auth guard, live-data sync, mobile switch
  api/http.ts                fetch wrapper (Bearer token, errors), session, login/logout
  app/
    buildViewModel.ts        port of renderVals(): calls the page builders, then builds the shell
    kit.ts                   badge / table cell / KPI / action helpers
    pageKit.ts               search, filters, tabs, table model; `self` (setState/toast) for builders
    state.ts                 UI state (zustand), toast
    useIsMobile.ts           768px breakpoint hook
    render.test.tsx          renders every page in every language
  assets/fonts/              Inter (self-hosted)
  components/
    layout/AppView.generated.tsx   the prototype's template as JSX (generated, do not edit)
    ui/Icon.tsx, iconPaths.ts, Logo.tsx
  features/
    auth/LoginPage.tsx       sign-in page (API mode only)
    supervisor|clinician|programme|researcher|admin/pages.ts   page builders (typed)
    morbas/morbasViews.ts    MORBAS form, chart, children, admin editor      (ported module 04)
    parent/checkMyChild.ts   Check my child + clinician Parent reports       (module 05)
    parent/wellbeing.ts      SRQ-20 + clinician Mothers' wellbeing           (module 06)
    admin/sdqAdmin.ts        SDQ licensed-text import                        (module 07)
    exercises/exercises.ts   17 child exercises; audio.json -> public/audio  (modules 08, 09)
    modules.ts               decides which module view a page shows
  domain/                    typed instrument data and scoring: morbas, parent (Ten Questions,
                             routing), srq20, sdq. Tests: scoring.test.ts, parity.test.ts
  i18n/
    lang.ts                  EN/MN/UR, RTL, translation by English key (# = number)
    jsx-runtime.ts, jsx-dev-runtime.ts, h.ts, translateProps.ts
                             translate string children + placeholder/title/aria-label
    mn.json, ur.json         UI dictionaries
    questionnaires.json      SRQ-20 / Ten Questions / parent texts in UR and MN
  store/
    ReportsStore.ts          the data-store interface
    apiStore.ts              ApiReportsStore: REST + SSE against nashonuma-api
    localStorageStore.ts     LocalReportsStore: localStorage, synced across tabs
    index.ts                 picks one of the two from VITE_API_URL
  data/mock/                 roles/nav, sample children, reports and shared mock data
  styles/                    design system, mobile + languages, generated hover rules
public/audio/                exercise audio clips (EN/MN), referenced from audio.json
scripts/                     one-off converters used to create the generated files
```

Imports use the `@/` alias for `src/`.

## How it works

**Pages.** The prototype renders every page from one template plus a view-model. This app does the
same thing:

- `AppView.generated.tsx` is the template converted to JSX.
- Each page builder fills the view-model: title, KPIs, filters, table and so on.
- The template has a generic page layout, so most pages are only data. MORBAS, the parent flow,
  SRQ-20, SDQ and the exercises render their own views. The template drops these in through `mb.view`.

**Language.** The prototype translated every string as it was rendered. The custom JSX runtime
(`jsxImportSource: "@nn"`, aliased in `vite.config.ts`) does the same thing, so translation coverage
matches the prototype exactly:

- English UI text is the dictionary key.
- Numbers match `#` in the keys.
- Urdu sets `dir="rtl"` on `<html>`.
- When text mixes words and values, keep each piece as its own string or expression
  (`Ranked by {x}`). That matches the dictionary keys.

**Data.** `src/store/` holds the `reports`, `wellbeing` and `children` collections and `config`
documents (for example `config/sdq`). Both stores implement `ReportsStore`, and `App.tsx`
(`useLiveReports`) mirrors the store into app state:

- A check sent from the mother's view shows up at once on the clinic dashboard.
- In localStorage mode this also works across browser tabs, through the `storage` event.
- In API mode other users' changes come in over SSE. If the connection drops, everything reloads
  when it reconnects.

## Regenerating

The generated files were made from the prototype's sources with:

```bash
node scripts/convert-template.mjs <nashonuma-code>/source/template.html   # AppView + hover CSS
node scripts/extract-domain-data.mjs <nashonuma-code>/source               # domain + mock JSON
node scripts/port-modules.mjs <nashonuma-code>/source                      # module views + audio
```

Running `port-modules.mjs` again overwrites the files in `features/morbas`, `features/parent`,
`features/admin/sdqAdmin.ts` and `features/exercises`. Do not run it once you have edited those
files by hand.

## Known gaps

- The ported module views (MORBAS, parent, SRQ-20, SDQ admin, exercises) still start with
  `// @ts-nocheck`. Their markup is exactly the prototype's `h(...)` code. Type each one, or convert
  it to JSX, when you next change it.
- Visual parity has been checked by tests: every page renders in all three languages, and the
  data, scoring and flows are covered. It has not been checked side by side in a browser yet. Go
  through every page at desktop width and at 390px against `working/nashonuma.html`, including the
  canvas and audio exercises on a real phone.
- The SRQ-20 and Ten Questions translations in `i18n/questionnaires.json` are working
  translations. Replace them with the official ones before the pilot.
- SDQ item wording is copyright, so it is not included. Paste the licensed text from
  Admin > Instruments > SDQ.
- `10-legacy-mobile-app.js` from the prototype was not ported, because it was not used.
- `npm run extract-audio` points to `scripts/extract-audio.mjs`, which is not in the repo. Audio is
  produced by `port-modules.mjs`.
