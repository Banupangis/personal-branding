create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.projects (
  id text primary key default gen_random_uuid()::text,
  title text not null check (btrim(title) <> ''),
  category text not null check (btrim(category) <> ''),
  description text not null check (btrim(description) <> ''),
  status text not null default '',
  thumbnail text not null default '',
  github_link text not null default '',
  demo_link text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_thumbnail_url check (
    thumbnail = '' or thumbnail ~* '^https?://'
  )
);

create table public.experiences (
  id text primary key default gen_random_uuid()::text,
  organization text not null check (btrim(organization) <> ''),
  role text not null check (btrim(role) <> ''),
  date text not null check (btrim(date) <> ''),
  description text not null check (btrim(description) <> ''),
  detail text not null default '',
  link text not null default '',
  contributions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experience_activities (
  id text primary key default gen_random_uuid()::text,
  experience_id text not null references public.experiences (id) on delete cascade,
  title text not null check (btrim(title) <> ''),
  description text not null default '',
  documentation text[] not null default '{}',
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.achievements (
  id text primary key default gen_random_uuid()::text,
  title text not null check (btrim(title) <> ''),
  date text not null check (btrim(date) <> ''),
  description text not null check (btrim(description) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hidden_default_content (
  entity_type text not null check (entity_type in ('experience', 'achievement')),
  content_id text not null check (btrim(content_id) <> ''),
  created_at timestamptz not null default now(),
  primary key (entity_type, content_id)
);

create index projects_created_at_idx on public.projects (created_at, id);
create index experiences_created_at_idx on public.experiences (created_at, id);
create index experience_activities_parent_order_idx
  on public.experience_activities (experience_id, sort_order);
create index achievements_created_at_idx on public.achievements (created_at, id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger experiences_set_updated_at
before update on public.experiences
for each row execute function public.set_updated_at();

create trigger experience_activities_set_updated_at
before update on public.experience_activities
for each row execute function public.set_updated_at();

create trigger achievements_set_updated_at
before update on public.achievements
for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.experiences enable row level security;
alter table public.experience_activities enable row level security;
alter table public.achievements enable row level security;
alter table public.hidden_default_content enable row level security;

revoke all on public.admin_users from public, anon, authenticated;
revoke all on public.projects, public.experiences, public.experience_activities,
  public.achievements, public.hidden_default_content from public, anon, authenticated;
grant select on public.projects, public.experiences, public.experience_activities,
  public.achievements, public.hidden_default_content to anon, authenticated;
grant insert, update, delete on public.projects, public.experiences,
  public.experience_activities, public.achievements, public.hidden_default_content
  to authenticated;

revoke all on function public.set_updated_at() from public;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users as admins
    where admins.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "Public can read projects"
on public.projects for select to anon, authenticated
using (true);

create policy "Admins can manage projects"
on public.projects for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Public can read experiences"
on public.experiences for select to anon, authenticated
using (true);

create policy "Admins can manage experiences"
on public.experiences for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Public can read experience activities"
on public.experience_activities for select to anon, authenticated
using (true);

create policy "Admins can manage experience activities"
on public.experience_activities for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Public can read achievements"
on public.achievements for select to anon, authenticated
using (true);

create policy "Admins can manage achievements"
on public.achievements for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Public can read hidden default content IDs"
on public.hidden_default_content for select to anon, authenticated
using (true);

create policy "Admins can manage hidden default content IDs"
on public.hidden_default_content for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create function public.save_experience(p_payload jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_experience_id text := p_payload ->> 'id';
  activity_payload jsonb;
  activity_order integer := 0;
begin
  if p_payload is null
    or pg_catalog.jsonb_typeof(p_payload) <> 'object'
    or v_experience_id is null
    or pg_catalog.jsonb_typeof(coalesce(p_payload -> 'contributions', '[]'::jsonb)) <> 'array'
    or pg_catalog.jsonb_typeof(coalesce(p_payload -> 'activities', '[]'::jsonb)) <> 'array'
  then
    raise exception using errcode = '22023', message = 'Invalid experience payload';
  end if;

  insert into public.experiences (
    id, organization, role, date, description, detail, link, contributions
  )
  values (
    v_experience_id,
    coalesce(p_payload ->> 'organization', ''),
    coalesce(p_payload ->> 'role', ''),
    coalesce(p_payload ->> 'date', ''),
    coalesce(p_payload ->> 'description', ''),
    coalesce(p_payload ->> 'detail', ''),
    coalesce(p_payload ->> 'link', ''),
    array(
      select pg_catalog.jsonb_array_elements_text(
        coalesce(p_payload -> 'contributions', '[]'::jsonb)
      )
    )
  )
  on conflict (id) do update set
    organization = excluded.organization,
    role = excluded.role,
    date = excluded.date,
    description = excluded.description,
    detail = excluded.detail,
    link = excluded.link,
    contributions = excluded.contributions;

  delete from public.experience_activities
  where experience_id = v_experience_id;

  for activity_payload in
    select item.value
    from pg_catalog.jsonb_array_elements(
      coalesce(p_payload -> 'activities', '[]'::jsonb)
    ) as item(value)
  loop
    insert into public.experience_activities (
      id, experience_id, title, description, documentation, sort_order
    )
    values (
      coalesce(nullif(activity_payload ->> 'id', ''), pg_catalog.gen_random_uuid()::text),
      v_experience_id,
      coalesce(activity_payload ->> 'title', ''),
      coalesce(activity_payload ->> 'description', ''),
      array(
        select pg_catalog.jsonb_array_elements_text(
          coalesce(activity_payload -> 'documentation', '[]'::jsonb)
        )
      ),
      activity_order
    );
    activity_order := activity_order + 1;
  end loop;

  delete from public.hidden_default_content
  where entity_type = 'experience' and content_id = v_experience_id;
end;
$$;

create function public.delete_experience(p_id text, p_hide_default boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_id is null or btrim(p_id) = '' then
    raise exception using errcode = '22023', message = 'Invalid experience ID';
  end if;

  delete from public.experiences where id = p_id;

  if p_hide_default then
    insert into public.hidden_default_content (entity_type, content_id)
    values ('experience', p_id)
    on conflict (entity_type, content_id) do nothing;
  else
    delete from public.hidden_default_content
    where entity_type = 'experience' and content_id = p_id;
  end if;
end;
$$;

create function public.save_achievement(
  p_id text,
  p_title text,
  p_date text,
  p_description text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.achievements (id, title, date, description)
  values (p_id, p_title, p_date, p_description)
  on conflict (id) do update set
    title = excluded.title,
    date = excluded.date,
    description = excluded.description;

  delete from public.hidden_default_content
  where entity_type = 'achievement' and content_id = p_id;
end;
$$;

create function public.delete_achievement(p_id text, p_hide_default boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_id is null or btrim(p_id) = '' then
    raise exception using errcode = '22023', message = 'Invalid achievement ID';
  end if;

  delete from public.achievements where id = p_id;

  if p_hide_default then
    insert into public.hidden_default_content (entity_type, content_id)
    values ('achievement', p_id)
    on conflict (entity_type, content_id) do nothing;
  else
    delete from public.hidden_default_content
    where entity_type = 'achievement' and content_id = p_id;
  end if;
end;
$$;

revoke all on function public.save_experience(jsonb) from public;
revoke all on function public.delete_experience(text, boolean) from public;
revoke all on function public.save_achievement(text, text, text, text) from public;
revoke all on function public.delete_achievement(text, boolean) from public;
grant execute on function public.save_experience(jsonb) to authenticated;
grant execute on function public.delete_experience(text, boolean) to authenticated;
grant execute on function public.save_achievement(text, text, text, text) to authenticated;
grant execute on function public.delete_achievement(text, boolean) to authenticated;
