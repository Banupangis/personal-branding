alter table public.achievements
  add column thumbnail text not null default '',
  add column detail text not null default '',
  add column documentation text[] not null default '{}';

update public.achievements
set detail = description
where detail = '';

drop function public.save_achievement(text, text, text, text);

create function public.save_achievement(
  p_id text,
  p_title text,
  p_date text,
  p_description text,
  p_thumbnail text,
  p_detail text,
  p_documentation text[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.achievements (
    id, title, date, description, thumbnail, detail, documentation
  )
  values (
    p_id, p_title, p_date, p_description, coalesce(p_thumbnail, ''),
    coalesce(p_detail, ''), coalesce(p_documentation, '{}')
  )
  on conflict (id) do update set
    title = excluded.title,
    date = excluded.date,
    description = excluded.description,
    thumbnail = excluded.thumbnail,
    detail = excluded.detail,
    documentation = excluded.documentation;

  delete from public.hidden_default_content
  where entity_type = 'achievement' and content_id = p_id;
end;
$$;

revoke all on function public.save_achievement(text, text, text, text, text, text, text[]) from public;
revoke all on function public.save_achievement(text, text, text, text, text, text, text[]) from anon;
grant execute on function public.save_achievement(text, text, text, text, text, text, text[]) to authenticated;

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'achievement-documentation',
  'achievement-documentation',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view achievement documentation images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'achievement-documentation');

create policy "Admins can upload achievement documentation images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'achievement-documentation'
  and (select public.is_admin())
);

create policy "Admins can update achievement documentation images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'achievement-documentation'
  and (select public.is_admin())
)
with check (
  bucket_id = 'achievement-documentation'
  and (select public.is_admin())
);

create policy "Admins can delete achievement documentation images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'achievement-documentation'
  and (select public.is_admin())
);
