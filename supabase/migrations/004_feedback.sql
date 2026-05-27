-- ============================================================
-- HydroSource — Founder Feedback Table
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

create table public.feedback (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete set null,
  user_email  text,
  message     text        not null,
  category    text        default 'general' check (category in ('bug','feature','ux','pricing','general')),
  page_url    text,
  app_version text        default 'web',
  status      text        default 'new' check (status in ('new','reviewed','actioned','closed')),
  founder_note text,
  created_at  timestamptz default now()
);

alter table public.feedback enable row level security;

-- Users can insert their own feedback
create policy "feedback: anyone can insert"
  on public.feedback for insert
  with check (true);

-- Users can read their own feedback
create policy "feedback: owner can read own"
  on public.feedback for select
  using (auth.uid() = user_id);

-- Service role (used by founder dashboard API) can read all
-- No RLS select policy needed — admin client bypasses RLS

create index feedback_created_at_idx on public.feedback (created_at desc);
create index feedback_status_idx     on public.feedback (status);
