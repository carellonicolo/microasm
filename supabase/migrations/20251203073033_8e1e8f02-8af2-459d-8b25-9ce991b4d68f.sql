-- Fix 1: RLS Policy classes - Co-insegnanti vedono le classi
DROP POLICY IF EXISTS "Users can view relevant classes" ON classes;

CREATE POLICY "Users can view relevant classes"
ON classes FOR SELECT
USING (
  teacher_id = auth.uid()
  OR is_class_teacher(auth.uid(), id)
  OR id IN (SELECT get_student_classes(auth.uid()))
);

-- Fix 2: RLS Policy class_students - Studenti vedono TUTTI i compagni
DROP POLICY IF EXISTS "Class members and teacher can view class_students" ON class_students;

CREATE POLICY "Class members and teacher can view class_students"
ON class_students FOR SELECT
USING (
  is_class_teacher(auth.uid(), class_id)
  OR is_student_in_class(auth.uid(), class_id)
);