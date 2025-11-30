-- Fase 1: Auto-Grading System - Database Schema Updates

-- 1.1 Aggiungere colonne alla tabella assignments per auto-grading
ALTER TABLE public.assignments 
ADD COLUMN auto_grade_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN auto_graded BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN auto_graded_at TIMESTAMPTZ;

COMMENT ON COLUMN public.assignments.auto_grade_enabled IS 'Se true, l''esercitazione verrà corretta automaticamente alla scadenza';
COMMENT ON COLUMN public.assignments.auto_graded IS 'Se true, l''esercitazione è già stata corretta automaticamente';
COMMENT ON COLUMN public.assignments.auto_graded_at IS 'Timestamp della correzione automatica';

-- 1.2 Aggiungere colonna a submission_answers per tracciare voti automatici
ALTER TABLE public.submission_answers 
ADD COLUMN is_auto_graded BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.submission_answers.is_auto_graded IS 'Se true, il voto è stato assegnato automaticamente';

-- 1.3 Creare tabella per i log delle correzioni automatiche
CREATE TABLE public.auto_grading_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  submission_answer_id UUID REFERENCES public.submission_answers(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial', 'skipped')),
  student_output TEXT,
  expected_output TEXT,
  grade_assigned NUMERIC,
  max_grade NUMERIC,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.auto_grading_logs IS 'Log delle correzioni automatiche per tracciabilità e debugging';
COMMENT ON COLUMN public.auto_grading_logs.status IS 'Risultato correzione: success=pieno successo, partial=parziale, error=errore esecuzione, skipped=saltato';

-- Indici per performance
CREATE INDEX idx_auto_grading_logs_assignment ON public.auto_grading_logs(assignment_id);
CREATE INDEX idx_auto_grading_logs_submission ON public.auto_grading_logs(submission_id);
CREATE INDEX idx_auto_grading_logs_created_at ON public.auto_grading_logs(created_at DESC);

-- 1.4 Abilitare Row Level Security su auto_grading_logs
ALTER TABLE public.auto_grading_logs ENABLE ROW LEVEL SECURITY;

-- 1.5 RLS Policy: Solo i teacher possono vedere i log delle loro esercitazioni
CREATE POLICY "Teachers can view auto grading logs for their assignments"
  ON public.auto_grading_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.assignments a
      WHERE a.id = auto_grading_logs.assignment_id 
        AND a.teacher_id = auth.uid()
    )
  );

-- 1.6 RLS Policy: Solo i super admin possono vedere tutti i log (per debugging)
CREATE POLICY "Super admins can view all auto grading logs"
  ON public.auto_grading_logs
  FOR SELECT
  USING (is_super_admin(auth.uid()));