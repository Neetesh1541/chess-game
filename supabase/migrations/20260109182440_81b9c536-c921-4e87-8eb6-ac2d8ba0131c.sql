-- Update handle_new_user to use username as display_name fallback instead of "Chess Player"
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username from metadata or random
  generated_username := COALESCE(
    NEW.raw_user_meta_data ->> 'username', 
    'player_' || LEFT(NEW.id::text, 8)
  );
  
  INSERT INTO public.profiles (user_id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    generated_username,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name', 
      NEW.raw_user_meta_data ->> 'name',
      generated_username  -- Use username as fallback instead of "Chess Player"
    ),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$function$;