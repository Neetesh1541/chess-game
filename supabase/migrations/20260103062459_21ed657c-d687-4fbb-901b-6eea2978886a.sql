-- Create chat_messages table for in-game chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.online_games(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Players in the game can view messages
CREATE POLICY "Players can view game messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.online_games 
    WHERE online_games.id = chat_messages.game_id 
    AND (online_games.white_player_id = auth.uid() OR online_games.black_player_id = auth.uid())
  )
);

-- Players can send messages in their games
CREATE POLICY "Players can send messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.online_games 
    WHERE online_games.id = chat_messages.game_id 
    AND (online_games.white_player_id = auth.uid() OR online_games.black_player_id = auth.uid())
  )
);

-- Enable realtime for chat messages
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Also ensure online_games has replica identity for proper realtime
ALTER TABLE public.online_games REPLICA IDENTITY FULL;