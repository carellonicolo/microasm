import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminOperationRequest {
  operation: 'promote' | 'revoke_teacher' | 'delete_user';
  target_user_id: string;
  force_delete?: boolean;
}

interface UserDependencies {
  classes_owned: number;
  classes_as_coteacher: number;
  assignments_created: number;
  submissions_made: number;
  students_enrolled: number;
  custom_exercises: number;
  saved_programs: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is super admin using service role client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: isSuperAdmin } = await supabaseAdmin
      .rpc('is_super_admin', { _user_id: user.id });

    if (!isSuperAdmin) {
      console.error(`User ${user.id} attempted admin operation without super_admin privilege`);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Super Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { operation, target_user_id, force_delete }: AdminOperationRequest = await req.json();

    console.log(`Super Admin ${user.id} performing operation: ${operation} on user ${target_user_id}`);

    // PROMOTE: Add teacher role to student
    if (operation === 'promote') {
      const { error: promoteError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: target_user_id,
          role: 'teacher',
          assigned_by: user.id,
          is_super_admin: false,
        });

      if (promoteError) {
        console.error('Promote error:', promoteError);
        return new Response(
          JSON.stringify({ error: `Failed to promote user: ${promoteError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'User promoted to teacher' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // REVOKE TEACHER: Remove teacher role (keep student if exists)
    if (operation === 'revoke_teacher') {
      const { error: revokeError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', target_user_id)
        .eq('role', 'teacher');

      if (revokeError) {
        console.error('Revoke error:', revokeError);
        return new Response(
          JSON.stringify({ error: `Failed to revoke teacher role: ${revokeError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Teacher role revoked' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE USER: Check dependencies first
    if (operation === 'delete_user') {
      // Check user dependencies
      const dependencies = await checkUserDependencies(supabaseAdmin, target_user_id);

      const hasCriticalDependencies = 
        dependencies.classes_owned > 0 ||
        dependencies.assignments_created > 0 ||
        dependencies.students_enrolled > 0;

      if (hasCriticalDependencies && !force_delete) {
        return new Response(
          JSON.stringify({
            error: 'User has critical dependencies',
            dependencies,
            requires_force: true,
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Proceed with deletion (CASCADE will handle related data)
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(target_user_id);

      if (deleteAuthError) {
        console.error('Delete user error:', deleteAuthError);
        return new Response(
          JSON.stringify({ error: `Failed to delete user: ${deleteAuthError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`User ${target_user_id} deleted by super admin ${user.id}`);

      return new Response(
        JSON.stringify({ success: true, message: 'User deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid operation' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Admin operation error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkUserDependencies(
  supabaseAdmin: any,
  userId: string
): Promise<UserDependencies> {
  const [
    classesOwned,
    classesAsCoteacher,
    assignmentsCreated,
    submissionsMade,
    studentsEnrolled,
    customExercises,
    savedPrograms,
  ] = await Promise.all([
    supabaseAdmin.from('classes').select('id', { count: 'exact', head: true }).eq('teacher_id', userId),
    supabaseAdmin.from('class_teachers').select('id', { count: 'exact', head: true }).eq('teacher_id', userId),
    supabaseAdmin.from('assignments').select('id', { count: 'exact', head: true }).eq('teacher_id', userId),
    supabaseAdmin.from('submissions').select('id', { count: 'exact', head: true }).eq('student_id', userId),
    supabaseAdmin.from('class_students').select('id', { count: 'exact', head: true }).eq('student_id', userId),
    supabaseAdmin.from('custom_exercises').select('id', { count: 'exact', head: true }).eq('teacher_id', userId),
    supabaseAdmin.from('saved_programs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  return {
    classes_owned: classesOwned.count ?? 0,
    classes_as_coteacher: classesAsCoteacher.count ?? 0,
    assignments_created: assignmentsCreated.count ?? 0,
    submissions_made: submissionsMade.count ?? 0,
    students_enrolled: studentsEnrolled.count ?? 0,
    custom_exercises: customExercises.count ?? 0,
    saved_programs: savedPrograms.count ?? 0,
  };
}
