-- Create assignment_exercises table (bridge table for multiple exercises per assignment)
CREATE TABLE public.assignment_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  repository_exercise_id INTEGER REFERENCES public.exercise_repository(id),
  custom_exercise_id UUID REFERENCES public.custom_exercises(id),
  display_order INTEGER NOT NULL DEFAULT 1,
  max_points NUMERIC NOT NULL DEFAULT 10,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT at_least_one_exercise CHECK (
    repository_exercise_id IS NOT NULL OR custom_exercise_id IS NOT NULL
  ),
  CONSTRAINT valid_max_points CHECK (max_points >= 0),
  UNIQUE(assignment_id, display_order)
);

-- Create submission_answers table (individual answers for each exercise)
CREATE TABLE public.submission_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  assignment_exercise_id UUID NOT NULL REFERENCES public.assignment_exercises(id) ON DELETE CASCADE,
  submitted_code TEXT NOT NULL DEFAULT '',
  grade NUMERIC,
  feedback TEXT,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_grade CHECK (grade IS NULL OR grade >= 0),
  UNIQUE(submission_id, assignment_exercise_id)
);

-- Update submissions table
ALTER TABLE public.submissions 
  ALTER COLUMN submitted_code DROP NOT NULL,
  ADD COLUMN total_grade NUMERIC;

-- Add comment to explain the change
COMMENT ON COLUMN public.submissions.submitted_code IS 'Legacy field for single-exercise assignments. For multi-exercise assignments, use submission_answers instead.';
COMMENT ON COLUMN public.submissions.total_grade IS 'Auto-calculated sum of all submission_answers grades for this submission.';

-- Create indexes for better performance
CREATE INDEX idx_assignment_exercises_assignment_id ON public.assignment_exercises(assignment_id);
CREATE INDEX idx_assignment_exercises_display_order ON public.assignment_exercises(assignment_id, display_order);
CREATE INDEX idx_submission_answers_submission_id ON public.submission_answers(submission_id);
CREATE INDEX idx_submission_answers_assignment_exercise_id ON public.submission_answers(assignment_exercise_id);

-- Enable RLS on new tables
ALTER TABLE public.assignment_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignment_exercises
-- Teachers can view exercises for their assignments
CREATE POLICY "Teachers can view assignment exercises"
  ON public.assignment_exercises
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_exercises.assignment_id
        AND a.teacher_id = auth.uid()
    )
  );

-- Students can view exercises for assignments in their classes
CREATE POLICY "Students can view assignment exercises"
  ON public.assignment_exercises
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_exercises.assignment_id
        AND is_student_in_class(auth.uid(), a.class_id)
    )
  );

-- Teachers can insert exercises for their assignments
CREATE POLICY "Teachers can insert assignment exercises"
  ON public.assignment_exercises
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_exercises.assignment_id
        AND a.teacher_id = auth.uid()
    )
  );

-- Teachers can update exercises for their assignments
CREATE POLICY "Teachers can update assignment exercises"
  ON public.assignment_exercises
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_exercises.assignment_id
        AND a.teacher_id = auth.uid()
    )
  );

-- Teachers can delete exercises for their assignments
CREATE POLICY "Teachers can delete assignment exercises"
  ON public.assignment_exercises
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_exercises.assignment_id
        AND a.teacher_id = auth.uid()
    )
  );

-- RLS Policies for submission_answers
-- Students can view their own submission answers
CREATE POLICY "Students can view own submission answers"
  ON public.submission_answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_answers.submission_id
        AND s.student_id = auth.uid()
    )
  );

-- Teachers can view submission answers for their assignments
CREATE POLICY "Teachers can view submission answers"
  ON public.submission_answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.submissions s
      JOIN public.assignments a ON a.id = s.assignment_id
      WHERE s.id = submission_answers.submission_id
        AND a.teacher_id = auth.uid()
    )
  );

-- Students can insert their own submission answers
CREATE POLICY "Students can insert own submission answers"
  ON public.submission_answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_answers.submission_id
        AND s.student_id = auth.uid()
    )
  );

-- Students can update their own submission answers
CREATE POLICY "Students can update own submission answers"
  ON public.submission_answers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_answers.submission_id
        AND s.student_id = auth.uid()
    )
  );

-- Teachers can update grades and feedback for submission answers
CREATE POLICY "Teachers can grade submission answers"
  ON public.submission_answers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM public.submissions s
      JOIN public.assignments a ON a.id = s.assignment_id
      WHERE s.id = submission_answers.submission_id
        AND a.teacher_id = auth.uid()
    )
  );

-- Add trigger to update updated_at on submission_answers
CREATE TRIGGER update_submission_answers_updated_at
  BEFORE UPDATE ON public.submission_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Drop any existing triggers on submissions that might conflict
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_submissions_updated_at' 
    AND tgrelid = 'public.submissions'::regclass
  ) THEN
    DROP TRIGGER update_submissions_updated_at ON public.submissions;
  END IF;
END $$;

-- Add trigger to auto-calculate total_grade on submissions
CREATE OR REPLACE FUNCTION public.calculate_submission_total_grade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_grade NUMERIC;
BEGIN
  -- Calculate total grade as sum of all submission_answers grades
  SELECT COALESCE(SUM(grade), 0) INTO v_total_grade
  FROM public.submission_answers
  WHERE submission_id = NEW.submission_id
    AND grade IS NOT NULL;
  
  -- Update using a direct query without triggering other triggers
  PERFORM pg_catalog.set_config('app.skip_trigger', 'true', true);
  
  UPDATE public.submissions
  SET total_grade = v_total_grade
  WHERE id = NEW.submission_id;
  
  PERFORM pg_catalog.set_config('app.skip_trigger', 'false', true);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER recalculate_total_grade_on_answer_insert
  AFTER INSERT ON public.submission_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_submission_total_grade();

CREATE TRIGGER recalculate_total_grade_on_answer_update
  AFTER UPDATE ON public.submission_answers
  FOR EACH ROW
  WHEN (OLD.grade IS DISTINCT FROM NEW.grade)
  EXECUTE FUNCTION public.calculate_submission_total_grade();

CREATE TRIGGER recalculate_total_grade_on_answer_delete
  AFTER DELETE ON public.submission_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_submission_total_grade();

-- Migration script for existing single-exercise assignments
-- Convert existing assignments to use assignment_exercises
INSERT INTO public.assignment_exercises (
  assignment_id,
  repository_exercise_id,
  custom_exercise_id,
  display_order,
  max_points,
  is_required
)
SELECT 
  id as assignment_id,
  repository_exercise_id,
  custom_exercise_id,
  1 as display_order,
  100 as max_points,
  true as is_required
FROM public.assignments
WHERE repository_exercise_id IS NOT NULL OR custom_exercise_id IS NOT NULL;

-- Migrate existing submissions to use submission_answers
INSERT INTO public.submission_answers (
  submission_id,
  assignment_exercise_id,
  submitted_code,
  grade,
  feedback,
  graded_at,
  graded_by,
  created_at,
  updated_at
)
SELECT 
  s.id as submission_id,
  ae.id as assignment_exercise_id,
  s.submitted_code,
  s.grade,
  s.feedback,
  s.graded_at,
  s.graded_by,
  s.submitted_at as created_at,
  s.last_updated_at as updated_at
FROM public.submissions s
JOIN public.assignment_exercises ae ON ae.assignment_id = s.assignment_id
WHERE s.submitted_code IS NOT NULL AND s.submitted_code != '';