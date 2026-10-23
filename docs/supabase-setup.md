# Supabase Setup

This guide configures a new Supabase database for the portfolio. Migrations create the schema and load the experience and achievement content explicitly supplied from `content.js`; no Google Sheets rows are imported.

## Prerequisites

- Node.js supported by the Vite version locked in `package-lock.json`.
- A Supabase account and a new or otherwise confirmed project. Do not apply this fresh-database migration to a project containing data that must be preserved.
- The project source and dependencies installed with `npm install` from `portfolio/`.

## Create and configure the Supabase project

1. Create a new Supabase project in the Dashboard and keep its database password private.
2. In the project's API settings, copy the Project URL and the public anon/publishable key.
3. Copy `.env.example` to `.env.local` in `portfolio/` and set:

   ```dotenv
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
   ```

   `VITE_*` values are embedded in browser code. Use only the public anon/publishable key; never put a service-role key, database password, or other secret in these variables.

4. The repository's `.gitignore` excludes `.env` and `.env.*`, while allowing `.env.example`. Confirm that local environment files are not staged or committed.

## Apply the migration

Review `supabase/migrations/20261022233300_initial_portfolio_schema.sql`, confirm the target is the new project, and apply its contents using the Supabase Dashboard SQL Editor or a separately configured Supabase CLI workflow. This repository has not linked or migrated a remote project.

The initial migration creates:

- `projects`, `experiences`, `experience_activities`, and `achievements`.
- `hidden_default_content` for hiding built-in fallback experience/achievement entries.
- `admin_users`, with no API access policy.
- RLS policies, an admin-check function, and transactional RPC functions for nested experience and achievement updates.

After applying the initial schema migration, also review and apply `supabase/migrations/20261023050000_experience_documentation_storage.sql`. It creates the public image bucket with a 5 MB limit and image MIME allowlist. Anonymous visitors may read images; only allowlisted admins may upload, update, or delete them. It does not remove or alter existing image records.

Apply `supabase/migrations/20261023100000_achievement_details_and_images.sql` to add achievement image/detail fields and its Storage bucket. Then apply `supabase/migrations/20261023120000_seed_portfolio_content.sql` to insert the 11 experiences and 3 achievements formerly embedded in `src/data/content.js`. It uses stable IDs and `ON CONFLICT` updates; rerunning it restores those rows to the values in the migration. Projects start empty. Admin changes and new records are stored in Supabase.

## Provision the first administrator

1. In Supabase Authentication settings, disable public sign-ups. Create the owner's user account through the Dashboard's user management controls; do not add a sign-up form to the public app.
2. Copy the new user's Auth UUID from the Dashboard.
3. In the SQL Editor for this project, allowlist that UUID:

   ```sql
   insert into public.admin_users (user_id)
   values ('REPLACE_WITH_AUTH_USER_UUID');
   ```

   The `admin_users` table is not readable or writable through the public API. Only use the SQL Editor or another trusted administrative channel to manage this allowlist. Repeat only for additional explicitly approved administrators.

4. Configure the Auth site's allowed site URL for the deployed portfolio if needed. Email/password sign-in does not require an OAuth redirect URL. Do not enable public sign-up as a shortcut.
5. Open `/admin`, sign in with the provisioned account, and verify that an unlisted account cannot edit content.

## Run the application and checks

From `portfolio/`:

```powershell
npm install
npm run lint
npm run build
```

Start the local app separately with `npm run dev`.

The repository does not currently provide a test script or local Supabase configuration. CRUD and RLS behavior must be verified against a disposable local/test Supabase database before production use; do not run test writes against production content.

## Access model

- Anonymous and signed-in visitors may read portfolio content, which is intended to be public.
- Only Auth users whose UUID appears in `public.admin_users` may create, update, or delete portfolio content.
- Uploaded activity documentation images are publicly readable by design, while Storage writes are restricted to allowlisted admins.
- All content tables have RLS enabled. The database checks authorization; hiding the admin route or buttons is not treated as security.
- The browser uses only the public key. No service-role key or server secret is required by the frontend.
- Public sign-up should remain disabled. If sign-up is enabled elsewhere, authenticated but non-allowlisted users still cannot write.

## Troubleshooting

- **Missing Supabase configuration:** create `portfolio/.env.local` from `.env.example`, provide the Project URL and public key, then restart Vite.
- **Failed connection or invalid key:** verify the URL and public key belong to the same Supabase project. Do not paste credentials into chat or logs.
- **Permission denied in `/admin`:** confirm the user is signed in and the exact Auth UUID is present in `public.admin_users`. Do not loosen the RLS policies.
- **Migration or missing relation error:** confirm the reviewed migration was applied to the intended empty project and that the SQL Editor reported success.
- **Admin is rejected after sign-in:** check the `is_admin` RPC in the SQL Editor and verify the user UUID. Only the allowlist row should be changed through a trusted channel.
- **Experience or achievement lists are empty:** confirm `20261023120000_seed_portfolio_content.sql` was applied after the schema and achievement-detail migrations. No spreadsheet rows are imported.

## Manual actions still required

- Create/confirm the Supabase project and apply the migration.
- Create the first Auth user, disable public sign-up, and insert its UUID into `admin_users`.
- Configure the production site's URL and public environment variables in the hosting provider.
- Perform CRUD and RLS tests against a disposable database before using the migration in production.
- Keep the previous spreadsheet and Apps Script deployment unchanged until the Supabase implementation has been verified. The old deployment has not been inspected or disabled by this migration.
