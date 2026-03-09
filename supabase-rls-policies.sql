-- Prompt 40 — RLS policies for OpenDraft
-- Run this in Supabase → SQL Editor.
--
-- Schema has no user_id (v1 anonymous). Policies allow anon/authenticated
-- to do what the app needs. Tighten with user_id when you add auth in v1.5.
--
-- events: no policies (service-role only). Do not add any policy to events.

-- =============================================================================
-- ENABLE RLS ON ALL TABLES (required — policies do nothing until RLS is on)
-- =============================================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CONVERSATIONS
-- =============================================================================

-- Allow insert (client auto-saves by session_id)
CREATE POLICY "conversations_insert"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

-- Allow update (client upserts by session_id)
CREATE POLICY "conversations_update"
  ON public.conversations FOR UPDATE
  USING (true);

-- Allow select (client needs to find existing row by session_id for upsert)
CREATE POLICY "conversations_select"
  ON public.conversations FOR SELECT
  USING (true);

-- =============================================================================
-- DRAFTS
-- =============================================================================

-- Allow insert (publish creates a draft)
CREATE POLICY "drafts_insert"
  ON public.drafts FOR INSERT
  WITH CHECK (true);

-- Anyone can read (feed and draft detail)
CREATE POLICY "drafts_select"
  ON public.drafts FOR SELECT
  USING (true);

-- Allow update/delete (optional; app may not use from client)
CREATE POLICY "drafts_update"
  ON public.drafts FOR UPDATE
  USING (true);

CREATE POLICY "drafts_delete"
  ON public.drafts FOR DELETE
  USING (true);

-- =============================================================================
-- VOTES
-- =============================================================================

-- Allow insert (anon can vote)
CREATE POLICY "votes_insert"
  ON public.votes FOR INSERT
  WITH CHECK (true);

-- Anyone can read (vote counts)
CREATE POLICY "votes_select"
  ON public.votes FOR SELECT
  USING (true);

-- =============================================================================
-- EVENTS
-- =============================================================================
-- No policies. RLS enabled + no policies = only service role can read/write.
-- Do not add any policy to events.
