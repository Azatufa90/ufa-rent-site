-- 002_storage_policies.sql
-- Bucket `listing-photos` должен быть создан в UI Storage и быть Public (для чтения медиа)

alter table storage.objects enable row level security;

create policy "Public read listing media"
on storage.objects for select
to public
using (bucket_id = 'listing-photos');

create policy "Users can upload to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
