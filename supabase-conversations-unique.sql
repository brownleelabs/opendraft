-- Run once in Supabase → SQL Editor.
-- Adds unique constraint on conversations.session_id so saveConversation upsert works
-- and concurrent inserts cannot create duplicate rows for the same session.

CREATE UNIQUE INDEX IF NOT EXISTS conversations_session_id_key
  ON public.conversations (session_id);
