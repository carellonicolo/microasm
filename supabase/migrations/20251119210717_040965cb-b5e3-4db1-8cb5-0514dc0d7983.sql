-- Allow teachers to view all other teachers in the system
-- This extends the existing policies to enable complete user management functionality

CREATE POLICY "Teachers can view all other teachers"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND has_role(id, 'teacher'::app_role)
);