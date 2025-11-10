-- Add is_public column to exercise_repository
ALTER TABLE public.exercise_repository 
ADD COLUMN is_public BOOLEAN DEFAULT false NOT NULL;

-- Mark first 20 exercises as public
UPDATE public.exercise_repository 
SET is_public = true 
WHERE id <= 20;

-- Create index for performance
CREATE INDEX idx_exercise_repository_is_public 
ON public.exercise_repository(is_public);

-- Drop existing RLS policy
DROP POLICY IF EXISTS "All authenticated users can view exercises" 
ON public.exercise_repository;

-- Policy 1: Anonymous users can view public exercises only
CREATE POLICY "Anonymous users can view public exercises"
  ON public.exercise_repository FOR SELECT
  TO anon
  USING (is_public = true);

-- Policy 2: Students can view public exercises only
CREATE POLICY "Students can view public exercises"
  ON public.exercise_repository FOR SELECT
  TO authenticated
  USING (
    is_public = true 
    AND NOT public.has_role(auth.uid(), 'teacher')
  );

-- Policy 3: Teachers can view all exercises
CREATE POLICY "Teachers can view all exercises"
  ON public.exercise_repository FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'));