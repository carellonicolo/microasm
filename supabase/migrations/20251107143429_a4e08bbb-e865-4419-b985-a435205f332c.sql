-- FASE 2: Sistema di co-insegnanti per le classi

-- 2.1 Creazione tabella class_teachers
CREATE TABLE IF NOT EXISTS public.class_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, teacher_id)
);

-- Enable RLS
ALTER TABLE public.class_teachers ENABLE ROW LEVEL SECURITY;

-- RLS policies for class_teachers
CREATE POLICY "Class teachers visible to class members"
ON public.class_teachers FOR SELECT
USING (
  is_class_teacher(auth.uid(), class_id) OR 
  is_student_in_class(auth.uid(), class_id)
);

CREATE POLICY "Class teachers can add co-teachers"
ON public.class_teachers FOR INSERT
WITH CHECK (
  is_class_teacher(auth.uid(), class_id) AND 
  has_role(auth.uid(), 'teacher'::app_role)
);

CREATE POLICY "Class teachers can remove co-teachers"
ON public.class_teachers FOR DELETE
USING (is_class_teacher(auth.uid(), class_id));

-- 2.2 Aggiornare la funzione is_class_teacher()
CREATE OR REPLACE FUNCTION public.is_class_teacher(_user_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes 
    WHERE id = _class_id AND teacher_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.class_teachers
    WHERE class_id = _class_id AND teacher_id = _user_id
  );
$$;

-- 2.3 Trigger per auto-aggiungere il creator come co-teacher
CREATE OR REPLACE FUNCTION public.handle_new_class()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.class_teachers (class_id, teacher_id, added_by)
  VALUES (NEW.id, NEW.teacher_id, NEW.teacher_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_class_created
  AFTER INSERT ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_class();