-- Run this in the Supabase SQL editor to add unique constraint on conversations.session_id.
-- Required for saveConversation upsert (onConflict: 'session_id').
ALTER TABLE conversations
  ADD CONSTRAINT conversations_session_id_unique UNIQUE (session_id);
