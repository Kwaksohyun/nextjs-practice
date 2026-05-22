-- ============================================================
-- 개발 블로그 — Supabase SQL Editor에 붙여넣어 실행하세요
-- ============================================================

-- 1. 테이블
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null default '',
  excerpt text,
  category_id uuid references public.categories (id) on delete set null,
  published boolean not null default true,
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_name text not null default '익명',
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  unique (post_id, visitor_id)
);

-- 2. updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row
  execute function public.set_updated_at();

-- 3. 인덱스
create index if not exists posts_category_id_idx on public.posts (category_id);
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists likes_post_id_idx on public.likes (post_id);
create index if not exists categories_sort_order_idx on public.categories (sort_order);

-- 4. RLS
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- categories
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  using (true);

drop policy if exists "categories_auth_insert" on public.categories;
create policy "categories_auth_insert"
  on public.categories for insert
  to authenticated
  with check (true);

drop policy if exists "categories_auth_update" on public.categories;
create policy "categories_auth_update"
  on public.categories for update
  to authenticated
  using (true);

drop policy if exists "categories_auth_delete" on public.categories;
create policy "categories_auth_delete"
  on public.categories for delete
  to authenticated
  using (true);

-- posts: 공개는 published만, 로그인 사용자는 전체
drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read"
  on public.posts for select
  using (published = true);

drop policy if exists "posts_auth_read" on public.posts;
create policy "posts_auth_read"
  on public.posts for select
  to authenticated
  using (true);

drop policy if exists "posts_auth_insert" on public.posts;
create policy "posts_auth_insert"
  on public.posts for insert
  to authenticated
  with check (true);

drop policy if exists "posts_auth_update" on public.posts;
create policy "posts_auth_update"
  on public.posts for update
  to authenticated
  using (true);

drop policy if exists "posts_auth_delete" on public.posts;
create policy "posts_auth_delete"
  on public.posts for delete
  to authenticated
  using (true);

-- comments
drop policy if exists "comments_public_read" on public.comments;
create policy "comments_public_read"
  on public.comments for select
  using (true);

drop policy if exists "comments_public_insert" on public.comments;
create policy "comments_public_insert"
  on public.comments for insert
  with check (true);

-- likes
drop policy if exists "likes_public_read" on public.likes;
create policy "likes_public_read"
  on public.likes for select
  using (true);

drop policy if exists "likes_public_insert" on public.likes;
create policy "likes_public_insert"
  on public.likes for insert
  with check (true);

drop policy if exists "likes_public_delete" on public.likes;
create policy "likes_public_delete"
  on public.likes for delete
  using (true);

-- 5. (선택) 시드 카테고리
insert into public.categories (name, slug, sort_order)
values
  ('전체', 'all', 0),
  ('Next.js', 'nextjs', 1),
  ('일상', 'daily', 2)
on conflict (slug) do nothing;
