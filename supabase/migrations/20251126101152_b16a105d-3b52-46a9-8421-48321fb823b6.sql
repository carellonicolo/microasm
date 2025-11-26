-- Estendere la funzione validate_user_content per validare anche i profili
CREATE OR REPLACE FUNCTION public.validate_user_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate saved_programs
  IF TG_TABLE_NAME = 'saved_programs' THEN
    IF NEW.name IS NOT NULL THEN
      NEW.name = trim(NEW.name);
      IF length(NEW.name) = 0 THEN
        RAISE EXCEPTION 'Program name cannot be empty';
      END IF;
      IF length(NEW.name) > 100 THEN
        RAISE EXCEPTION 'Program name exceeds maximum length of 100 characters';
      END IF;
    END IF;
    IF NEW.description IS NOT NULL THEN
      NEW.description = trim(NEW.description);
      IF length(NEW.description) > 500 THEN
        RAISE EXCEPTION 'Program description exceeds maximum length of 500 characters';
      END IF;
    END IF;
    IF NEW.code IS NOT NULL THEN
      NEW.code = trim(NEW.code);
      IF length(NEW.code) = 0 THEN
        RAISE EXCEPTION 'Program code cannot be empty';
      END IF;
      IF length(NEW.code) > 50000 THEN
        RAISE EXCEPTION 'Program code exceeds maximum length of 50000 characters';
      END IF;
    END IF;
  END IF;
  
  -- Validate assignments
  IF TG_TABLE_NAME = 'assignments' THEN
    IF NEW.description IS NOT NULL THEN
      NEW.description = trim(NEW.description);
    END IF;
    IF NEW.title IS NOT NULL THEN
      NEW.title = trim(NEW.title);
      IF length(NEW.title) > 200 THEN
        RAISE EXCEPTION 'Assignment title exceeds maximum length of 200 characters';
      END IF;
    END IF;
  END IF;
  
  -- Validate custom_exercises
  IF TG_TABLE_NAME = 'custom_exercises' THEN
    IF NEW.description IS NOT NULL THEN
      NEW.description = trim(NEW.description);
    END IF;
    IF NEW.title IS NOT NULL THEN
      NEW.title = trim(NEW.title);
      IF length(NEW.title) > 200 THEN
        RAISE EXCEPTION 'Exercise title exceeds maximum length of 200 characters';
      END IF;
    END IF;
  END IF;
  
  -- Validate submissions
  IF TG_TABLE_NAME = 'submissions' THEN
    IF NEW.feedback IS NOT NULL THEN
      NEW.feedback = trim(NEW.feedback);
    END IF;
  END IF;
  
  -- Validate profiles (NEW)
  IF TG_TABLE_NAME = 'profiles' THEN
    IF NEW.first_name IS NOT NULL THEN
      NEW.first_name = trim(NEW.first_name);
      IF length(NEW.first_name) < 2 THEN
        RAISE EXCEPTION 'Il nome deve contenere almeno 2 caratteri';
      END IF;
      IF length(NEW.first_name) > 100 THEN
        RAISE EXCEPTION 'Il nome non può superare i 100 caratteri';
      END IF;
    END IF;
    IF NEW.last_name IS NOT NULL THEN
      NEW.last_name = trim(NEW.last_name);
      IF length(NEW.last_name) < 2 THEN
        RAISE EXCEPTION 'Il cognome deve contenere almeno 2 caratteri';
      END IF;
      IF length(NEW.last_name) > 100 THEN
        RAISE EXCEPTION 'Il cognome non può superare i 100 caratteri';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Creare trigger per profiles
DROP TRIGGER IF EXISTS validate_profile_content ON public.profiles;

CREATE TRIGGER validate_profile_content
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_content();