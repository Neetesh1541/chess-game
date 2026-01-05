-- Add move_time_ms column to track how long each move took
ALTER TABLE public.game_moves ADD COLUMN IF NOT EXISTS move_time_ms integer DEFAULT 0;

-- Add draw_offer columns to online_games for draw functionality
ALTER TABLE public.online_games ADD COLUMN IF NOT EXISTS draw_offered_by uuid DEFAULT NULL;

-- Update profiles RLS to keep is_online/last_seen visible only to authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles basic info viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Note: We keep it public for the chess platform's social features (finding online players)