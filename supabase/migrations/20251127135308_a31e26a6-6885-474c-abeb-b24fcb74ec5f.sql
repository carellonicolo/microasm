-- Rimuovi constraint unicità per permettere multiple submissions
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_assignment_id_student_id_key;

-- Aggiungi colonne per gestione multiple submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submission_number INTEGER DEFAULT 1;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_final BOOLEAN DEFAULT false;

-- Crea indice per performance su query multiple submissions
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_student 
ON submissions(assignment_id, student_id, submission_number DESC);

-- Funzione per auto-incrementare submission_number
CREATE OR REPLACE FUNCTION public.increment_submission_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcola il prossimo numero di submission per questo assignment e studente
  NEW.submission_number := COALESCE(
    (SELECT MAX(submission_number) + 1 
     FROM public.submissions 
     WHERE assignment_id = NEW.assignment_id 
       AND student_id = NEW.student_id),
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger per auto-incrementare submission_number prima dell'insert
DROP TRIGGER IF EXISTS before_submission_insert ON submissions;
CREATE TRIGGER before_submission_insert
  BEFORE INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_submission_number();

-- Aggiorna le submissions esistenti con submission_number = 1
UPDATE submissions SET submission_number = 1 WHERE submission_number IS NULL;