import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useSavedPrograms } from '@/hooks/useSavedPrograms';
import { useClasses } from '@/hooks/useClasses';
import { useAssignments } from '@/hooks/useAssignments';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  BookOpen, 
  Users, 
  FileText, 
  Plus, 
  Play,
  GraduationCap,
  ClipboardList,
  UserCog
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { PromoteToTeacherDialog } from '@/components/dialogs/PromoteToTeacherDialog';

const Dashboard = () => {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { userPrograms, loading: programsLoading } = useSavedPrograms();
  const { classes, loading: classesLoading } = useClasses();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const navigate = useNavigate();
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);

  if (roleLoading || programsLoading || classesLoading || assignmentsLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const recentPrograms = userPrograms.slice(0, 5);
  const upcomingAssignments = assignments
    .filter(a => a.due_date && new Date(a.due_date) > new Date())
    .slice(0, 3);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">
                Benvenuto, {user?.user_metadata?.first_name || 'Utente'}
              </h1>
              {role && <RoleBadge role={role} />}
            </div>
            <p className="text-muted-foreground">
              {role === 'teacher' 
                ? 'Gestisci le tue classi ed esercitazioni' 
                : 'Continua il tuo percorso di apprendimento'}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Programmi Salvati"
            value={userPrograms.length}
            icon={Code}
            description="I tuoi programmi"
          />
          <StatCard
            title={role === 'teacher' ? 'Classi Gestite' : 'Classi Iscritte'}
            value={classes.length}
            icon={Users}
            description={role === 'teacher' ? 'Classi attive' : 'Classi seguite'}
          />
          <StatCard
            title={role === 'teacher' ? 'Assegnazioni Create' : 'Assegnazioni'}
            value={assignments.length}
            icon={FileText}
            description={role === 'teacher' ? 'Totale assegnazioni' : 'Da completare'}
          />
          <StatCard
            title="Esercizi Disponibili"
            value="100"
            icon={BookOpen}
            description="Nel repository"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Azioni Rapide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Nuovo Programma"
              description="Inizia a scrivere codice assembly"
              icon={Plus}
              href="/"
              buttonText="Apri Editor"
            />
            <QuickActionCard
              title="Esercizi"
              description="Esplora 100+ esercizi didattici"
              icon={BookOpen}
              href="/dashboard/exercises"
              buttonText="Vedi Esercizi"
            />
            {role === 'teacher' ? (
              <>
                <QuickActionCard
                  title="Crea Classe"
                  description="Aggiungi una nuova classe"
                  icon={GraduationCap}
                  href="/dashboard/classes"
                  buttonText="Crea Classe"
                />
                <QuickActionCard
                  title="Promuovi Studente"
                  description="Promuovi uno studente a insegnante"
                  icon={UserCog}
                  onClick={() => setPromoteDialogOpen(true)}
                  buttonText="Promuovi"
                  variant="secondary"
                />
              </>
            ) : (
              <QuickActionCard
                title="Assegnazioni"
                description="Vedi i compiti assegnati"
                icon={ClipboardList}
                href="/dashboard/assignments"
                buttonText="Vedi Assegnazioni"
              />
            )}
          </div>
        </div>

        {/* Recent Programs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Programmi Recenti</CardTitle>
              <CardDescription>I tuoi ultimi programmi salvati</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/programs')}
            >
              Vedi Tutti
            </Button>
          </CardHeader>
          <CardContent>
            {recentPrograms.length === 0 ? (
              <div className="text-center py-8">
                <Code className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nessun programma salvato</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => navigate('/')}
                >
                  Inizia a Programmare
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => {
                      localStorage.setItem('editorCode', program.code);
                      navigate('/');
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Code className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{program.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(program.updated_at), {
                            addSuffix: true,
                            locale: it,
                          })}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Assignments (for students) or Recent Assignments (for teachers) */}
        {assignments.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {role === 'teacher' ? 'Assegnazioni Recenti' : 'Prossime Scadenze'}
                </CardTitle>
                <CardDescription>
                  {role === 'teacher' 
                    ? 'Le tue ultime assegnazioni create' 
                    : 'Assegnazioni da completare'}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard/assignments')}
              >
                Vedi Tutte
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(role === 'teacher' ? assignments.slice(0, 3) : upcomingAssignments).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/assignments/${assignment.id}`)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.class_name}
                          {assignment.due_date && ` • Scadenza: ${formatDistanceToNow(new Date(assignment.due_date), {
                            addSuffix: true,
                            locale: it,
                          })}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Promote Dialog */}
        {role === 'teacher' && (
          <PromoteToTeacherDialog
            open={promoteDialogOpen}
            onOpenChange={setPromoteDialogOpen}
            onStudentPromoted={() => {
              // Optionally refresh something
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
