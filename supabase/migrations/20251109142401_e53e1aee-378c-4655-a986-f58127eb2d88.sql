-- Fix 1: Update class_teachers foreign keys to reference public.profiles instead of auth.users
ALTER TABLE public.class_teachers
  DROP CONSTRAINT IF EXISTS class_teachers_teacher_id_fkey,
  ADD CONSTRAINT class_teachers_teacher_id_fkey
    FOREIGN KEY (teacher_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

ALTER TABLE public.class_teachers
  DROP CONSTRAINT IF EXISTS class_teachers_added_by_fkey,
  ADD CONSTRAINT class_teachers_added_by_fkey
    FOREIGN KEY (added_by) 
    REFERENCES public.profiles(id);

-- Fix 2: Replace overly permissive profiles RLS policy with context-specific policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Users can always view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Teachers can view profiles of students in their classes
CREATE POLICY "Teachers can view students in their classes"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      JOIN class_students cs ON cs.class_id = c.id
      WHERE (c.teacher_id = auth.uid() OR EXISTS (
        SELECT 1 FROM class_teachers ct
        WHERE ct.class_id = c.id AND ct.teacher_id = auth.uid()
      )) AND cs.student_id = profiles.id
    )
  );

-- Students can view profiles of classmates in the same class
CREATE POLICY "Students can view classmates"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_students cs1
      JOIN class_students cs2 ON cs2.class_id = cs1.class_id
      WHERE cs1.student_id = auth.uid() AND cs2.student_id = profiles.id
    )
  );

-- Teachers can view other teachers in the same classes (co-teachers)
CREATE POLICY "Teachers can view co-teachers"
  ON public.profiles FOR SELECT
  USING (
    has_role(auth.uid(), 'teacher') AND has_role(profiles.id, 'teacher') AND
    EXISTS (
      SELECT 1 FROM class_teachers ct1
      JOIN class_teachers ct2 ON ct2.class_id = ct1.class_id
      WHERE ct1.teacher_id = auth.uid() AND ct2.teacher_id = profiles.id
    )
  );