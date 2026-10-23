# Supabase Migration Plan

## Audit findings

### Architecture

- The application is a React 19 + Vite 8 JavaScript SPA using React Router.
- The Vite project, npm scripts, lockfile, and installed dependencies are under `portfolio/`. There is no backend application or test script.
- Portfolio content is rendered on public routes. `/admin` is a client-side route with project, experience, and achievement CRUD.
- No Supabase client, environment configuration, authentication, route guard, or runtime `localStorage` usage was found.
- `portfolio/gas/Code.gs` contains Git command examples, not Google Apps Script source. It cannot be used to verify the deployed Apps Script implementation or database column definitions.

### Google Sheets / Apps Script access inventory

| File | Access | Data and behavior |
| --- | --- | --- |
| `portfolio/src/data/projectsApi.js` | Reads a hard-coded Apps Script Web App endpoint | Lists projects; validates the response is an array. |
| `portfolio/src/components/AdminDashboard.jsx` | Posts directly to the same endpoint | Creates, updates, and deletes projects. |
| `portfolio/src/data/experienceApi.js` | Reads `?type=experiences`; posts action payloads to the endpoint | Previously merged remote experiences with the built-in `EXPERIENCE` list; saved/deleted experiences and tracked hidden built-in IDs. |
| `portfolio/src/data/achievementsApi.js` | Reads `?type=achievements`; posts action payloads to the endpoint | Previously merged remote achievements with built-in `ACHIEVEMENTS`; saved/deleted achievements and tracked hidden built-in IDs. |
| `portfolio/src/components/AdminDashboard.jsx` | Calls the three data APIs | Admin lists and CRUD forms for all three content types. |
| `portfolio/src/components/Projects.jsx` | Calls `fetchProjects()` | Public project list. |
| `portfolio/src/components/Experience.jsx` | Calls `fetchExperiences()` | Public experience list. |
| `portfolio/src/components/detail.jsx` | Calls `fetchExperiences()` | Public experience detail, including activities and documentation URLs. |
| `portfolio/src/components/Achievements.jsx` | Calls `fetchAchievements()` | Public achievement list. |
| `portfolio/README.md` | Describes the legacy integration | Mentions `Projects`, `SubKegiatan`, and `Achievement` sheets; the `SubKegiatan` fields; Apps Script actions; thumbnail support; and the prior localStorage behavior. |

The Google Docs/Drive links in `detail.jsx` are presentation/preview URLs, not database API access, and are not migration targets.

### Data entities and observed fields

- **Project:** `id`, `title`, `category`, `description`, `status`, `thumbnail`, `githubLink`, `demoLink`. Project data is initially empty in `content.js`.
- **Experience:** records formerly embedded in `content.js` have `id`, `organization`, `role`, `date`, `description`, `contributions`, and `link`. The admin also stores `detail` and `activities`; each activity has `id`, `title`, `description`, and one or more documentation image references.
- **Achievement:** records formerly embedded in `content.js` have `id`, `title`, `date`, and `description`; admin storage also supports detail, thumbnail, and documentation images.
- At audit time, existing code merged remote experience/achievement records over built-in records and used remote deleted-ID lists to suppress deleted built-ins. This fallback has now been replaced by explicit SQL seed records; all list reads come from Supabase.

The README describes legacy sheet names and some columns, but the actual Apps Script source and a schema export are absent. Spreadsheet rows must not be imported under the selected fresh-database strategy.

### Authentication, access, and security observations

- The site presents projects, experiences, and achievements publicly, so public reads are an evidenced requirement.
- At audit time, `/admin` was not protected by authentication or a route guard. Its write/delete actions were available in browser code, and the Apps Script endpoint was embedded in frontend source.
- No user, admin, or role model is present in the repository. Allowing anonymous Supabase writes would preserve the current unsafe admin behavior; allowing all authenticated users would also be unsafe if public sign-ups are enabled.
- Therefore, at audit time RLS rules for administrative writes could not be selected safely without a product/access decision. No remote project, credentials, deployment target, or Supabase CLI link is configured or confirmed.
- No `.env*` files were present in `portfolio/` by filename during the audit. The original `.gitignore` ignored `*.local` but not `.env`; it now excludes `.env` and `.env.*` while allowing `.env.example`.
- No secret value is reproduced in this document. The Apps Script file at `portfolio/gas/Code.gs` is not deployable Apps Script and needs separate verification before any legacy endpoint is retired.

## Supabase data mapping

| Existing content | Supabase model | Notes |
| --- | --- | --- |
| Projects | `projects` | Store observed fields with a text primary key; public `SELECT`, writes restricted to allowlisted admins. |
| Experiences | `experiences` and `experience_activities` | Store the 11 former source records and activity details in PostgreSQL; documentation image references are arrays. Activities reference their experience with `ON DELETE CASCADE` and retain explicit display order. Uploaded images use a public Supabase Storage bucket with admin-only writes. |
| Achievements | `achievements` | Store the 3 former source records with detail/image fields; top-level additions are ordered by creation time. |
| Built-in experience/achievement suppression | `hidden_default_content` | Retained in schema for compatibility; the app now reads all records from Supabase and no longer uses source-code fallbacks. |
| Admin authorization | `admin_users` | Map explicitly approved Supabase Auth user UUIDs; no public API access. |

No historical spreadsheet rows will be imported. The user explicitly requested moving the 11 supplied experience records and 3 achievement records from `src/data/content.js` into an idempotent SQL migration. The corresponding JavaScript constants have been removed, so the database is now the source of truth for both collections.

## Implemented locally

The user selected Supabase Auth with an explicit admin allowlist, retaining browser-based `/admin` management. The local implementation now:

1. Uses one centralized Supabase client and only public Vite environment variables, with a clear missing-configuration error.
2. Adds migrations for the observed entities, constraints, indexes, RLS, allowlist-based authorization, transactional nested-content RPCs, and admin-only image uploads to public Storage.
3. Replaces runtime Apps Script CRUD with Supabase services and loads experiences/achievements from Supabase only.
4. Protects `/admin` with password sign-in and an `is_admin` database check. Sign-up is not provided.
5. Replaces activity documentation link entry with image uploads to Supabase Storage. The public bucket allows only image formats up to 5 MB; reads are public and writes require an allowlisted admin. Existing legacy documentation links remain viewable until removed.
6. Adds `.env.example`, ignores local environment files, and documents fresh-project setup. The spreadsheet and Apps Script deployment have not been changed.
7. Adds an idempotent content migration for the former 11 experience and 3 achievement entries. Leaves applying migrations and testing Storage upload/CRUD/RLS against a disposable Supabase project as manual, unverified steps.

### Files added or updated

- Added `portfolio/src/lib/supabaseClient.js` and updated all three data APIs and `AdminDashboard.jsx`.
- Added `portfolio/supabase/migrations/20261022233300_initial_portfolio_schema.sql`.
- Added `portfolio/supabase/migrations/20261023050000_experience_documentation_storage.sql` for the public documentation image bucket and admin-only writes.
- Added `portfolio/supabase/migrations/20261023120000_seed_portfolio_content.sql` for the 11 experience and 3 achievement records removed from `content.js`.
- Added `portfolio/.env.example` and `portfolio/docs/supabase-setup.md`; updated `portfolio/.gitignore`, `portfolio/README.md`, `portfolio/package.json`, and `portfolio/package-lock.json`.
- Updated this migration plan with audit results and implementation status.

## Plan and validation criteria

- Project scope is `portfolio/`; its existing build and lint scripts are the available automated checks.
- Keep the three public content views and existing detail/documentation behavior functional.
- Keep all create/update/delete actions unavailable to anonymous users; grant them only to explicitly authorized admins.
- Ensure a clean Supabase database can be set up from reviewed local migrations, with no spreadsheet import or secret in frontend code.
- Search application source and production assets for remaining runtime Apps Script requests and privileged keys.
- Report remote database application and external configuration as pending unless explicitly configured and verified.

## Access decision

The user confirmed Supabase Auth with an explicit admin allowlist. The setup guide provisions the first user manually and recommends disabling public sign-up. No account UUID or credential was requested or embedded in the repository.

## Baseline validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm run build` (from `portfolio/`) | Passed | Vite production build completed. |
| `npm run lint` (from `portfolio/`) | Passed | ESLint completed without reported issues. |
| `npm run build` and `npm run lint` (from repository root) | Not applicable / command failed | The repository root has no `package.json`; run commands from `portfolio/`. |

## Post-implementation validation

| Command / scenario | Result | Notes |
| --- | --- | --- |
| `npm run build` (from `portfolio/`) | Passed | Production bundle completed after migration changes. |
| `npm run lint` (from `portfolio/`) | Passed | ESLint completed without reported issues. |
| Build bundle-size warning | Warning | Vite reports a minified JS chunk over 500 kB; build succeeds. |
| `npm run` | Passed / no test script | Available scripts are dev, build, preview, and lint. |
| Browser: `/admin` with no local Supabase environment | Passed | Login UI renders an explicit missing-configuration alert; credentials were not entered. |
| Browser: `/` with no local Supabase environment | Passed with expected external setup pending | Public portfolio UI renders; content areas display the Supabase configuration error instead of crashing. |
| Source and production bundle search for Apps Script endpoint/runtime error strings | Passed | No matches in `src/` or the final `dist/` bundle. Google Drive/Docs preview handling remains separate. |
| Source and production bundle search for `service_role`, `SUPABASE_SERVICE_ROLE`, and secret-named Vite variables | Passed | No matches found. This is a string scan, not a Supabase-side verification. |
| `.gitignore` check for `.env`, `.env.local`, `.env.production`, `.env.example` | Passed | Local environment files are ignored; `.env.example` remains unignored. |
| Upload source checks | Passed | Admin UI now offers image upload only; client and bucket restrict formats to JPG, PNG, WebP, GIF and 5 MB. |
| SQL migration apply / CRUD / RLS tests | Not run | No Supabase CLI, `psql`, local Supabase configuration, project URL, or approved remote target is available. |
| Authenticated admin workflow and public UI with populated Supabase data | Not run | Requires the user's Supabase project, configured local public variables, and a provisioned allowlisted account. |
