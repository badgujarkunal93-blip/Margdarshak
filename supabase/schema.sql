create extension if not exists "pgcrypto";

create table if not exists public.students (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text not null,
  rank integer not null check (rank > 0),
  category text default null,
  region text default null,
  membership_tier text not null check (membership_tier in ('Explorer', 'Guide', 'Group')),
  created_at timestamptz not null default now()
);

create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  district text not null,
  university text not null,
  branches text[] not null default '{}',
  fees_general integer,
  fees_obc integer,
  fees_sc integer,
  fees_st integer,
  photos text[] not null default '{}',
  rating numeric(2, 1),
  reviews_count integer not null default 0,
  established_year integer,
  accreditation text,
  placement_avg numeric(10, 2),
  created_at timestamptz not null default now()
);

create table if not exists public.cutoffs (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  branch text not null,
  category text not null,
  round text not null,
  year integer not null,
  rank_cutoff integer not null check (rank_cutoff > 0),
  created_at timestamptz not null default now()
);

create index if not exists cutoffs_college_id_idx on public.cutoffs(college_id);
create index if not exists cutoffs_search_idx on public.cutoffs(branch, category, year, round);
create index if not exists colleges_district_idx on public.colleges(district);
create index if not exists colleges_university_idx on public.colleges(university);

alter table public.students enable row level security;
alter table public.colleges enable row level security;
alter table public.cutoffs enable row level security;

create policy "Students can read own profile"
  on public.students for select
  to authenticated
  using (auth.uid() = id);

create policy "Students can update own profile"
  on public.students for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Students can insert own profile"
  on public.students for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Authenticated users can read colleges"
  on public.colleges for select
  to authenticated
  using (true);

create policy "Authenticated users can read cutoffs"
  on public.cutoffs for select
  to authenticated
  using (true);

create or replace function public.handle_new_student()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.students (
    id,
    name,
    email,
    phone,
    rank,
    category,
    region,
    membership_tier
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce((new.raw_user_meta_data ->> 'rank')::integer, 1),
    nullif(new.raw_user_meta_data ->> 'category', ''),
    nullif(new.raw_user_meta_data ->> 'region', ''),
    coalesce(new.raw_user_meta_data ->> 'membership_tier', 'Explorer')
  )
  on conflict (id) do update
    set name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        rank = excluded.rank,
        category = excluded.category,
        region = excluded.region,
        membership_tier = excluded.membership_tier;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_student();
