import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('🔍 Auto-grade scheduler started at', new Date().toISOString());

    // Find assignments that need auto-grading
    const { data: assignments, error: queryError } = await supabase
      .from('assignments')
      .select(`
        id,
        title,
        due_date,
        auto_grade_enabled,
        auto_graded
      `)
      .eq('auto_grade_enabled', true)
      .eq('auto_graded', false)
      .lte('due_date', new Date().toISOString())
      .limit(10); // Process max 10 assignments per run

    if (queryError) {
      console.error('❌ Error querying assignments:', queryError);
      throw queryError;
    }

    if (!assignments || assignments.length === 0) {
      console.log('✅ No assignments to auto-grade at this time');
      return new Response(
        JSON.stringify({ 
          message: 'No assignments to grade',
          assignments_processed: 0 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${assignments.length} assignments to auto-grade`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each assignment
    for (const assignment of assignments) {
      console.log(`\n⚙️ Processing assignment: ${assignment.title} (${assignment.id})`);

      try {
        // Call auto-grade edge function
        const { data, error } = await supabase.functions.invoke('auto-grade', {
          body: { assignment_id: assignment.id }
        });

        if (error) {
          console.error(`❌ Error grading assignment ${assignment.id}:`, error);
          errorCount++;
          results.push({
            assignment_id: assignment.id,
            title: assignment.title,
            success: false,
            error: error.message
          });
        } else {
          console.log(`✅ Successfully graded assignment ${assignment.id}`);
          successCount++;
          results.push({
            assignment_id: assignment.id,
            title: assignment.title,
            success: true,
            ...data
          });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Exception processing assignment ${assignment.id}:`, errorMsg);
        errorCount++;
        results.push({
          assignment_id: assignment.id,
          title: assignment.title,
          success: false,
          error: errorMsg
        });
      }
    }

    console.log(`\n📊 Scheduler completed: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        message: 'Scheduler completed',
        assignments_found: assignments.length,
        success_count: successCount,
        error_count: errorCount,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Fatal error in scheduler:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
