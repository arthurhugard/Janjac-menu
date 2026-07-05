-- ============================================================
-- Schéma Supabase pour le menu de restaurant (FR / EN)
-- À copier-coller dans Supabase > SQL Editor > New query > Run
-- ============================================================

create extension if not exists "pgcrypto";

-- Réglages généraux (nom du restaurant en FR et EN)
create table if not exists restaurant_settings (
  id int primary key default 1,
  name_fr text not null default 'Votre Restaurant',
  name_en text not null default 'Your Restaurant',
  updated_at timestamptz not null default now()
);
insert into restaurant_settings (id) values (1) on conflict (id) do nothing;

-- Catégories (Entrées / Starters, etc.)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name_fr text not null,
  name_en text default '',
  created_at timestamptz not null default now()
);

-- Plats
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  name_fr text not null default '',
  name_en text default '',
  desc_fr text default '',
  desc_en text default '',
  price text default '',
  out_of_stock boolean not null default false,
  created_at timestamptz not null default now()
);

-- Sécurité (RLS) : tout le monde peut LIRE (clients),
-- seul un utilisateur connecté (le gérant) peut ÉCRIRE.
alter table restaurant_settings enable row level security;
alter table categories enable row level security;
alter table items enable row level security;

create policy "public read settings" on restaurant_settings for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read items" on items for select using (true);

create policy "auth write settings" on restaurant_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write categories" on categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write items" on items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Mises à jour en direct (pour que le client voie les changements sans recharger)
alter publication supabase_realtime add table categories;
alter publication supabase_realtime add table items;
alter publication supabase_realtime add table restaurant_settings;

-- Catégories de départ (vous pourrez les renommer/supprimer depuis l'espace gérant)
insert into categories (name_fr, name_en)
select v.name_fr, v.name_en
from (values
  ('Entrées', 'Starters'),
  ('Plats', 'Main Courses'),
  ('Desserts', 'Desserts'),
  ('Boissons', 'Drinks')
) as v(name_fr, name_en)
where not exists (select 1 from categories);
