-- Change request #1: reference image on leads
alter table public.contact_submissions
  add column if not exists image_path text
  check (image_path is null or image_path ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$');

-- Private bucket, images only (limit raised to 15MB in the next migration)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reference-images', 'reference-images', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Anonymous visitors may only upload (no read, list, update or delete)
create policy "anon_upload_reference_images"
  on storage.objects for insert to anon
  with check (bucket_id = 'reference-images' and name ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$');
