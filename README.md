# Portfolio

React + Vite portfolio site. Dynamic project, experience, and achievement content is read from Supabase. The `/admin` route requires a Supabase Auth account explicitly allowlisted as an administrator; public sign-up is not part of the app.

## Local setup

1. Install a Node.js version supported by the Vite version in `package-lock.json`.
2. Copy `.env.example` to `.env.local` and set the Supabase Project URL and public anon/publishable key.
3. Create a new Supabase project and apply the migration described in [Supabase setup](./docs/supabase-setup.md).
4. Add the first administrator through the Supabase Dashboard and allowlist that user's Auth UUID as documented in the setup guide.
5. Run `npm install`, then `npm run dev`.

Only public portfolio data is available to anonymous visitors. Content writes require a signed-in user whose UUID is in `public.admin_users`; the database enforces this with RLS. Never put a service-role key in a `VITE_*` variable.

See [Supabase setup](./docs/supabase-setup.md) for the complete database, Auth, and troubleshooting instructions and [the migration plan](./docs/supabase-migration-plan.md) for the audit and implementation record.

## Scripts

- `npm run dev` — start the Vite development server.
- `npm run build` — create the production bundle in `dist/`.
- `npm run preview` — preview the production bundle locally.
- `npm run lint` — run ESLint.

There is no spreadsheet import. The `20261023120000_seed_portfolio_content.sql` migration inserts the 11 experience and 3 achievement records formerly stored in `src/data/content.js`; Supabase is the source of truth for those collections.

## Experience documentation

The `/detail/:id` route shows experience details, activities, and uploaded documentation images. The `/achievement/:id` route shows full achievement details, thumbnails, and documentation. Admin uploads accept JPG, PNG, WebP, and GIF up to 5 MB per image. Experience images are stored in the public `experience-documentation` bucket and achievement images in `achievement-documentation`; upload and delete access is restricted to allowlisted admins. Legacy experience documentation links continue to be displayed until removed from an activity.
