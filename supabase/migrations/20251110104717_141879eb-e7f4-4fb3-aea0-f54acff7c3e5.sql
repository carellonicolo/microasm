-- Fix SECURITY INVOKER inconsistency in validate_user_content function
-- Change to SECURITY DEFINER for consistency with other security functions
CREATE OR REPLACE FUNCTION public.validate_user_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate and sanitize description fields
  IF TG_TABLE_NAME = 'assignments' THEN
    IF NEW.description IS NOT NULL THEN
      NEW.description = trim(NEW.description);
    END IF;
    IF NEW.title IS NOT NULL THEN
      NEW.title = trim(NEW.title);
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'custom_exercises' THEN
    IF NEW.description IS NOT NULL THEN
      NEW.description = trim(NEW.description);
    END IF;
    IF NEW.title IS NOT NULL THEN
      NEW.title = trim(NEW.title);
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'submissions' THEN
    IF NEW.feedback IS NOT NULL THEN
      NEW.feedback = trim(NEW.feedback);
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'saved_programs' THEN
    IF NEW.description IS NOT NULL THEN
      NEW.description = trim(NEW.description);
    END IF;
    IF NEW.name IS NOT NULL THEN
      NEW.name = trim(NEW.name);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;