insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'experience-documentation',
  'experience-documentation',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view experience documentation images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'experience-documentation');

create policy "Admins can upload experience documentation images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'experience-documentation'
  and (select public.is_admin())
);

create policy "Admins can update experience documentation images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'experience-documentation'
  and (select public.is_admin())
)
with check (
  bucket_id = 'experience-documentation'
  and (select public.is_admin())
);

create policy "Admins can delete experience documentation images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'experience-documentation'
  and (select public.is_admin())
);
