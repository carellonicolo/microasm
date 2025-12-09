-- Create trigger to prevent students from modifying grading columns in submission_answers
CREATE OR REPLACE FUNCTION public.prevent_student_grade_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the user is not a teacher, preserve original grading values
  IF NOT has_role(auth.uid(), 'teacher') THEN
    NEW.grade := OLD.grade;
    NEW.graded_at := OLD.graded_at;
    NEW.graded_by := OLD.graded_by;
    NEW.is_auto_graded := OLD.is_auto_graded;
    NEW.feedback := OLD.feedback;
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger on submission_answers
DROP TRIGGER IF EXISTS protect_grading_columns ON public.submission_answers;
CREATE TRIGGER protect_grading_columns
  BEFORE UPDATE ON public.submission_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_student_grade_modification();