# Come Creare un Super Admin

Gli utenti Super Admin hanno privilegi estesi per gestire la piattaforma, inclusa la capacità di:
- Promuovere studenti a insegnanti
- Revocare il ruolo insegnante agli utenti
- Eliminare utenti dal sistema

## ⚠️ IMPORTANTE: Assegnazione Solo da Backend

Il flag `is_super_admin` **NON può essere assegnato tramite l'interfaccia utente**. Deve essere impostato manualmente tramite query SQL diretta al database Supabase.

## Metodo 1: SQL Editor in Supabase Dashboard

1. Accedi alla Supabase Dashboard del progetto
2. Vai su **SQL Editor**
3. Esegui la seguente query sostituendo `USER_EMAIL` con l'email dell'utente da promuovere:

```sql
-- Step 1: Trova l'ID dell'utente dall'email
SELECT id, email FROM auth.users WHERE email = 'USER_EMAIL';

-- Step 2: Assicurati che l'utente abbia il ruolo 'teacher'
-- Se non ce l'ha, aggiungilo prima:
INSERT INTO public.user_roles (user_id, role, is_super_admin)
VALUES ('USER_ID_FROM_STEP_1', 'teacher', false)
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Imposta il flag super_admin a true
UPDATE public.user_roles
SET is_super_admin = true
WHERE user_id = 'USER_ID_FROM_STEP_1'
  AND role = 'teacher';
```

## Metodo 2: Query Singola (Shortcut)

Se l'utente è già un insegnante, usa questa query diretta:

```sql
UPDATE public.user_roles
SET is_super_admin = true
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
)
AND role = 'teacher';
```

## Metodo 3: Creazione Completa (Nuovo Utente)

Per creare un nuovo Super Admin da zero:

```sql
-- Inserisci profilo (se non esiste già tramite signup)
INSERT INTO public.profiles (id, first_name, last_name, email)
SELECT 
  id, 
  'Admin', 
  'Super', 
  email
FROM auth.users 
WHERE email = 'superadmin@example.com';

-- Aggiungi ruolo teacher con flag super_admin
INSERT INTO public.user_roles (user_id, role, is_super_admin)
SELECT id, 'teacher'::app_role, true
FROM auth.users
WHERE email = 'superadmin@example.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET is_super_admin = true;
```

## Verifica

Dopo aver eseguito la query, verifica che l'operazione sia andata a buon fine:

```sql
SELECT 
  p.email,
  p.first_name,
  p.last_name,
  ur.role,
  ur.is_super_admin
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.is_super_admin = true;
```

## Note Importanti

- **Sicurezza**: Solo gli amministratori con accesso diretto al database possono creare Super Admin
- **Constraint**: Un utente può essere Super Admin SOLO se ha il ruolo 'teacher'
- **Unicità**: Un utente può avere entrambi i ruoli (student + teacher) ma il flag `is_super_admin` è unico
- **RLS**: Le policy RLS impediscono la modifica di questo flag tramite API client

## Revoca Privilegi Super Admin

Per rimuovere i privilegi Super Admin:

```sql
UPDATE public.user_roles
SET is_super_admin = false
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com')
  AND role = 'teacher';
```

## Troubleshooting

### Errore: "violates check constraint super_admin_must_be_teacher"

L'utente non ha il ruolo 'teacher'. Prima aggiungi il ruolo teacher:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID', 'teacher')
ON CONFLICT DO NOTHING;
```

### Errore: "permission denied for table user_roles"

Assicurati di eseguire la query con privilegi admin (service_role) in Supabase SQL Editor, non tramite client JavaScript.
