-- Clipping: tablas y permisos de Supabase.
-- Cómo usarlo: en supabase.com abre tu proyecto → SQL Editor → New query,
-- pega todo este archivo y presiona "Run". Se puede correr más de una vez.

-- ───────────── Perfiles ─────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  handle text unique,
  bio text,
  climbing_since int,
  max_route text,          -- grado base (francesa), ej. '7a'
  max_boulder text,        -- grado base (V), ej. 'V5'
  sectors text[] not null default '{}',
  location text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cualquier persona con cuenta puede ver perfiles (para Cordada más adelante).
drop policy if exists "Perfiles visibles con sesión" on public.profiles;
create policy "Perfiles visibles con sesión" on public.profiles
  for select to authenticated using (true);

-- Cada uno crea y edita solo el suyo.
drop policy if exists "Crear mi perfil" on public.profiles;
create policy "Crear mi perfil" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "Editar mi perfil" on public.profiles;
create policy "Editar mi perfil" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- ───────────── Ascensos (logbook) ─────────────
create table if not exists public.ascents (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  route text not null,
  sector text not null,
  type text not null,      -- Deportiva, Trad, Multilargo, Boulder
  grade text not null,     -- grado base: francesa para vías, V para boulder
  style text not null,     -- A vista, Flash, Encadene, Top rope, Proyecto
  date date not null,
  pitches int not null default 1,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists ascents_user_date on public.ascents (user_id, date desc);

alter table public.ascents enable row level security;

-- Por ahora cada uno ve y edita solo sus ascensos.
drop policy if exists "Mis ascensos" on public.ascents;
create policy "Mis ascensos" on public.ascents
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ───────────── Fotos de perfil ─────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Cada uno sube fotos solo dentro de su carpeta: avatars/<su id>/...
drop policy if exists "Subir mi foto" on storage.objects;
create policy "Subir mi foto" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "Cambiar mi foto" on storage.objects;
create policy "Cambiar mi foto" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "Borrar mi foto" on storage.objects;
create policy "Borrar mi foto" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));
