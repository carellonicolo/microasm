-- ============================================
-- ENUMS
-- ============================================

-- Enum per ruoli utente
CREATE TYPE public.app_role AS ENUM ('student', 'teacher');

-- Enum per difficoltà esercizi
CREATE TYPE public.exercise_difficulty AS ENUM (
  'principiante',
  'intermedio',
  'avanzato',
  'esperto',
  'impossibile'
);

-- Enum per stato consegne
CREATE TYPE public.submission_status AS ENUM (
  'not_submitted',
  'submitted',
  'graded'
);

-- ============================================
-- TABELLA PROFILES (Profili Utenti)
-- ============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_name_length CHECK (
    LENGTH(first_name) >= 2 AND LENGTH(first_name) <= 50 AND
    LENGTH(last_name) >= 2 AND LENGTH(last_name) <= 50
  )
);

CREATE INDEX idx_profiles_email ON public.profiles(email);

-- ============================================
-- TABELLA USER_ROLES (Ruoli Utenti)
-- ============================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- ============================================
-- TABELLA SAVED_PROGRAMS (Programmi Salvati)
-- ============================================

CREATE TABLE public.saved_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  folder_path TEXT DEFAULT '/' NOT NULL,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  public_link_token UUID UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_program_name CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 100),
  CONSTRAINT valid_code_length CHECK (LENGTH(code) <= 50000)
);

CREATE INDEX idx_saved_programs_user_id ON public.saved_programs(user_id);
CREATE INDEX idx_saved_programs_folder ON public.saved_programs(user_id, folder_path);
CREATE INDEX idx_saved_programs_public_link ON public.saved_programs(public_link_token) WHERE public_link_token IS NOT NULL;

-- ============================================
-- TABELLA EXERCISE_REPOSITORY (100 Esercizi)
-- ============================================

CREATE TABLE public.exercise_repository (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  difficulty public.exercise_difficulty NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL,
  expected_output TEXT,
  solution_code TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_title_length CHECK (LENGTH(title) >= 3 AND LENGTH(title) <= 200)
);

CREATE INDEX idx_exercise_repository_difficulty ON public.exercise_repository(difficulty);
CREATE INDEX idx_exercise_repository_category ON public.exercise_repository(category);
CREATE INDEX idx_exercise_repository_tags ON public.exercise_repository USING GIN(tags);

-- ============================================
-- TABELLA CUSTOM_EXERCISES (Esercizi Custom)
-- ============================================

CREATE TABLE public.custom_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  difficulty public.exercise_difficulty NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB NOT NULL,
  expected_output TEXT,
  solution_code TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_custom_title CHECK (LENGTH(title) >= 3 AND LENGTH(title) <= 200)
);

CREATE INDEX idx_custom_exercises_teacher ON public.custom_exercises(teacher_id);
CREATE INDEX idx_custom_exercises_difficulty ON public.custom_exercises(difficulty);

-- ============================================
-- TABELLA CLASSES (Classi)
-- ============================================

CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  academic_year TEXT NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_class_name CHECK (LENGTH(name) >= 3 AND LENGTH(name) <= 100),
  CONSTRAINT valid_academic_year CHECK (academic_year ~ '^\d{4}/\d{4}$')
);

CREATE INDEX idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX idx_classes_academic_year ON public.classes(academic_year);
CREATE INDEX idx_classes_active ON public.classes(teacher_id, is_archived) WHERE is_archived = FALSE;

-- ============================================
-- TABELLA CLASS_STUDENTS (Studenti nelle Classi)
-- ============================================

CREATE TABLE public.class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(class_id, student_id)
);

CREATE INDEX idx_class_students_class ON public.class_students(class_id);
CREATE INDEX idx_class_students_student ON public.class_students(student_id);

-- ============================================
-- TABELLA ASSIGNMENTS (Esercitazioni Assegnate)
-- ============================================

CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('repository', 'custom')),
  repository_exercise_id INT REFERENCES public.exercise_repository(id) ON DELETE SET NULL,
  custom_exercise_id UUID REFERENCES public.custom_exercises(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  allow_late_submission BOOLEAN DEFAULT TRUE NOT NULL,
  show_solution_after_deadline BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_assignment_title CHECK (LENGTH(title) >= 3 AND LENGTH(title) <= 200),
  CONSTRAINT valid_exercise_reference CHECK (
    (exercise_type = 'repository' AND repository_exercise_id IS NOT NULL AND custom_exercise_id IS NULL) OR
    (exercise_type = 'custom' AND custom_exercise_id IS NOT NULL AND repository_exercise_id IS NULL)
  )
);

CREATE INDEX idx_assignments_class ON public.assignments(class_id);
CREATE INDEX idx_assignments_teacher ON public.assignments(teacher_id);
CREATE INDEX idx_assignments_due_date ON public.assignments(due_date);

-- ============================================
-- TABELLA SUBMISSIONS (Consegne Studenti)
-- ============================================

CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  submitted_code TEXT NOT NULL,
  saved_program_id UUID REFERENCES public.saved_programs(id) ON DELETE SET NULL,
  status public.submission_status DEFAULT 'submitted' NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  grade NUMERIC(5,2),
  max_grade NUMERIC(5,2) DEFAULT 100.00,
  feedback TEXT,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(assignment_id, student_id),
  CONSTRAINT valid_code_length CHECK (LENGTH(submitted_code) <= 50000),
  CONSTRAINT valid_grade CHECK (grade IS NULL OR (grade >= 0 AND grade <= max_grade)),
  CONSTRAINT valid_feedback CHECK (feedback IS NULL OR LENGTH(feedback) <= 5000)
);

CREATE INDEX idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_student ON public.submissions(student_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_graded ON public.submissions(graded_at) WHERE graded_at IS NOT NULL;

-- ============================================
-- TRIGGERS PER UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_programs_updated_at BEFORE UPDATE ON public.saved_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_exercises_updated_at BEFORE UPDATE ON public.custom_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Auto-creazione profilo su signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Utente'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Sconosciuto'),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNZIONI SECURITY DEFINER (per RLS)
-- ============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'teacher' THEN 1
    WHEN 'student' THEN 2
  END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_student_in_class(_user_id UUID, _class_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_students
    WHERE class_id = _class_id AND student_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_class_teacher(_user_id UUID, _class_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classes
    WHERE id = _class_id AND teacher_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_student_classes(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT class_id
  FROM public.class_students
  WHERE student_id = _user_id;
$$;

-- ============================================
-- ENABLE RLS SU TUTTE LE TABELLE
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_repository ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: PROFILES
-- ============================================

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- POLICIES: USER_ROLES
-- ============================================

CREATE POLICY "User roles are viewable by authenticated"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can assign teacher role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    role = 'teacher' AND
    public.has_role(auth.uid(), 'teacher')
  );

-- ============================================
-- POLICIES: SAVED_PROGRAMS
-- ============================================

CREATE POLICY "Users can view own programs or public ones"
  ON public.saved_programs FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    is_public = true
  );

CREATE POLICY "Users can insert own programs"
  ON public.saved_programs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own programs"
  ON public.saved_programs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own programs"
  ON public.saved_programs FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- POLICIES: EXERCISE_REPOSITORY
-- ============================================

CREATE POLICY "All authenticated users can view exercises"
  ON public.exercise_repository FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- POLICIES: CUSTOM_EXERCISES
-- ============================================

CREATE POLICY "Teachers can view own custom exercises"
  ON public.custom_exercises FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') AND
    teacher_id = auth.uid()
  );

CREATE POLICY "Teachers can insert custom exercises"
  ON public.custom_exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'teacher') AND
    teacher_id = auth.uid()
  );

CREATE POLICY "Teachers can update own custom exercises"
  ON public.custom_exercises FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own custom exercises"
  ON public.custom_exercises FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid());

-- ============================================
-- POLICIES: CLASSES
-- ============================================

CREATE POLICY "Users can view relevant classes"
  ON public.classes FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    id IN (SELECT public.get_student_classes(auth.uid()))
  );

CREATE POLICY "Teachers can create classes"
  ON public.classes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'teacher') AND
    teacher_id = auth.uid()
  );

CREATE POLICY "Teachers can update own classes"
  ON public.classes FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own classes"
  ON public.classes FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid());

-- ============================================
-- POLICIES: CLASS_STUDENTS
-- ============================================

CREATE POLICY "Class members and teacher can view class_students"
  ON public.class_students FOR SELECT
  TO authenticated
  USING (
    public.is_class_teacher(auth.uid(), class_id) OR
    student_id = auth.uid()
  );

CREATE POLICY "Teachers can add students to own classes"
  ON public.class_students FOR INSERT
  TO authenticated
  WITH CHECK (public.is_class_teacher(auth.uid(), class_id));

CREATE POLICY "Teachers can remove students from own classes"
  ON public.class_students FOR DELETE
  TO authenticated
  USING (public.is_class_teacher(auth.uid(), class_id));

-- ============================================
-- POLICIES: ASSIGNMENTS
-- ============================================

CREATE POLICY "Assignments visible to class members"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    public.is_student_in_class(auth.uid(), class_id)
  );

CREATE POLICY "Teachers can create assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'teacher') AND
    teacher_id = auth.uid() AND
    public.is_class_teacher(auth.uid(), class_id)
  );

CREATE POLICY "Teachers can update own assignments"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own assignments"
  ON public.assignments FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid());

-- ============================================
-- POLICIES: SUBMISSIONS
-- ============================================

CREATE POLICY "Submissions visible to student and teacher"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_id AND a.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can submit assignments"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.class_students cs ON cs.class_id = a.class_id
      WHERE a.id = assignment_id AND cs.student_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ============================================
-- VIEW: Soluzioni visibili solo agli insegnanti
-- ============================================

CREATE VIEW public.exercise_repository_with_solutions AS
SELECT 
  er.*
FROM public.exercise_repository er
WHERE public.has_role(auth.uid(), 'teacher');

ALTER VIEW public.exercise_repository_with_solutions SET (security_invoker = true);