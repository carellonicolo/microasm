-- Add is_super_admin flag to user_roles table
ALTER TABLE public.user_roles
ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- Constraint: only teachers can be super admins
ALTER TABLE public.user_roles
ADD CONSTRAINT super_admin_must_be_teacher
CHECK (
  (is_super_admin = false) OR 
  (is_super_admin = true AND role = 'teacher'::app_role)
);

-- Security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'teacher'::app_role
      AND is_super_admin = true
  );
$$;

-- Drop existing permissive policy that allowed any teacher to promote
DROP POLICY IF EXISTS "Teachers can assign teacher role" ON public.user_roles;

-- New restrictive policies: only super admins can manage roles
CREATE POLICY "Only super admins can assign teacher role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_super_admin(auth.uid()) AND role = 'teacher'::app_role
);

CREATE POLICY "Only super admins can revoke roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));