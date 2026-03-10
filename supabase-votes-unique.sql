-- Run in Supabase SQL Editor. Ensures one vote per draft per device (API returns 409 on duplicate).
CREATE UNIQUE INDEX IF NOT EXISTS votes_draft_id_device_fingerprint_key
  ON public.votes (draft_id, device_fingerprint);
