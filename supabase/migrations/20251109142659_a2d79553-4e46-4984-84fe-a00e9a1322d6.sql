-- Fix 1: Add anonymous access for public programs
CREATE POLICY "Anonymous users can view public programs"
  ON public.saved_programs FOR SELECT
  TO anon
  USING (is_public = true AND public_link_token IS NOT NULL);

-- Fix 2: Add server-side content validation
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
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Apply validation triggers to relevant tables
CREATE TRIGGER validate_assignment_content
  BEFORE INSERT OR UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_content();

CREATE TRIGGER validate_custom_exercise_content
  BEFORE INSERT OR UPDATE ON public.custom_exercises
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_content();

CREATE TRIGGER validate_submission_content
  BEFORE INSERT OR UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_content();

CREATE TRIGGER validate_saved_program_content
  BEFORE INSERT OR UPDATE ON public.saved_programs
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_content();