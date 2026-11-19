-- =========================================================
-- Acta Members – Calculadora de Honorários
-- Rode este script UMA vez no Supabase: Dashboard > SQL Editor > New query > Run
-- Cria 2 tabelas, cada aluno só enxerga e altera os próprios dados (RLS).
-- =========================================================

-- 1) Perfil da calculadora (custos, horas, margem, catálogo de serviços, marca)
create table if not exists public.calc_perfis (
  user_id    uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  dados      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) Orçamentos salvos
create table if not exists public.calc_orcamentos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  cliente    text not null default '',
  total      numeric(14,2) not null default 0,
  dados      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists calc_orcamentos_user_idx on public.calc_orcamentos (user_id, updated_at desc);

-- Segurança: Row Level Security
alter table public.calc_perfis     enable row level security;
alter table public.calc_orcamentos enable row level security;

drop policy if exists "calc_perfis_own"     on public.calc_perfis;
drop policy if exists "calc_orcamentos_own" on public.calc_orcamentos;

create policy "calc_perfis_own" on public.calc_perfis
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "calc_orcamentos_own" on public.calc_orcamentos
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3) Logos dos alunos (Storage)
-- Bucket público para leitura (o logo aparece no PDF da proposta);
-- cada aluno só grava/apaga dentro da própria pasta: <user_id>/logo.png
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('calc-logos', 'calc-logos', true, 2097152, array['image/png'])
on conflict (id) do nothing;

drop policy if exists "calc_logos_select_own" on storage.objects;
drop policy if exists "calc_logos_insert_own" on storage.objects;
drop policy if exists "calc_logos_update_own" on storage.objects;
drop policy if exists "calc_logos_delete_own" on storage.objects;

create policy "calc_logos_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'calc-logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "calc_logos_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'calc-logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "calc_logos_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'calc-logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "calc_logos_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'calc-logos' and (storage.foldername(name))[1] = auth.uid()::text);
