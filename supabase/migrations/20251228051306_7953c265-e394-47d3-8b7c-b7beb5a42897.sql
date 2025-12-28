-- Create function to update player stats when game completes
CREATE OR REPLACE FUNCTION public.update_player_stats_on_game_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rating_change INTEGER := 16;
BEGIN
  -- Only run when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Update white player stats
    IF NEW.white_player_id IS NOT NULL THEN
      IF NEW.winner_id = NEW.white_player_id THEN
        -- White won
        UPDATE profiles SET 
          games_played = games_played + 1,
          games_won = games_won + 1,
          rating = rating + rating_change
        WHERE user_id = NEW.white_player_id;
      ELSIF NEW.winner_id = NEW.black_player_id THEN
        -- White lost
        UPDATE profiles SET 
          games_played = games_played + 1,
          games_lost = games_lost + 1,
          rating = GREATEST(0, rating - rating_change)
        WHERE user_id = NEW.white_player_id;
      ELSE
        -- Draw
        UPDATE profiles SET 
          games_played = games_played + 1,
          games_drawn = games_drawn + 1
        WHERE user_id = NEW.white_player_id;
      END IF;
    END IF;
    
    -- Update black player stats
    IF NEW.black_player_id IS NOT NULL THEN
      IF NEW.winner_id = NEW.black_player_id THEN
        -- Black won
        UPDATE profiles SET 
          games_played = games_played + 1,
          games_won = games_won + 1,
          rating = rating + rating_change
        WHERE user_id = NEW.black_player_id;
      ELSIF NEW.winner_id = NEW.white_player_id THEN
        -- Black lost
        UPDATE profiles SET 
          games_played = games_played + 1,
          games_lost = games_lost + 1,
          rating = GREATEST(0, rating - rating_change)
        WHERE user_id = NEW.black_player_id;
      ELSE
        -- Draw
        UPDATE profiles SET 
          games_played = games_played + 1,
          games_drawn = games_drawn + 1
        WHERE user_id = NEW.black_player_id;
      END IF;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on online_games table
DROP TRIGGER IF EXISTS on_game_complete ON public.online_games;
CREATE TRIGGER on_game_complete
  AFTER UPDATE ON public.online_games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_player_stats_on_game_complete();