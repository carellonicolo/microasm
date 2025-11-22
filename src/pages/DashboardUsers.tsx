import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { UserRolesBadges } from '@/components/shared/UserRolesBadges';
import { UserDetailsDialog } from '@/components/dialogs/UserDetailsDialog';
import { useAllUsers } from '@/hooks/useAllUsers';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Users, GraduationCap, BookOpen, UserCog, Eye, Trash2, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

type RoleFilter = 'all' | 'students' | 'teachers' | 'dual';
type SortBy = 'name' | 'email' | 'date';

export default function DashboardUsers() {
  const { users, loading } = useAllUsers();
  const { isSuperAdmin } = useUserRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<typeof users[0] | null>(null);
  const [forceDeleteDialogOpen, setForceDeleteDialogOpen] = useState(false);
  const [dependencies, setDependencies] = useState<any>(null);
  const [operatingUserId, setOperatingUserId] = useState<string | null>(null);

  // Statistiche
  const stats = useMemo(() => {
    const totalStudents = users.filter(u => u.roles.includes('student')).length;
    const totalTeachers = users.filter(u => u.roles.includes('teacher')).length;
    const dualRoles = users.filter(u => u.roles.includes('student') && u.roles.includes('teacher')).length;
    
    return {
      totalStudents,
      totalTeachers,
      dualRoles,
      totalUsers: users.length,
    };
  }, [users]);

  // Filtri e ordinamento
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Filtro ricerca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.first_name.toLowerCase().includes(query) ||
          u.last_name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }

    // Filtro ruolo
    if (roleFilter === 'students') {
      filtered = filtered.filter(u => u.roles.includes('student'));
    } else if (roleFilter === 'teachers') {
      filtered = filtered.filter(u => u.roles.includes('teacher'));
    } else if (roleFilter === 'dual') {
      filtered = filtered.filter(u => u.roles.includes('student') && u.roles.includes('teacher'));
    }

    // Ordinamento
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
        const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'email') {
        return a.email.localeCompare(b.email);
      } else {
        // date: più recenti prima
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [users, searchQuery, roleFilter, sortBy]);

  const callAdminOperation = async (
    operation: 'promote' | 'revoke_teacher' | 'delete_user',
    targetUserId: string,
    forceDelete = false
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { operation, target_user_id: targetUserId, force_delete: forceDelete },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Admin operation error:', error);
      throw error;
    }
  };

  const handlePromoteUser = async (userId: string, firstName: string, lastName: string) => {
    setOperatingUserId(userId);
    try {
      await callAdminOperation('promote', userId);
      toast.success(`${firstName} ${lastName} promosso a insegnante!`);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Errore durante la promozione');
    } finally {
      setOperatingUserId(null);
    }
  };

  const handleRevokeTeacher = async (userId: string, firstName: string, lastName: string) => {
    setOperatingUserId(userId);
    try {
      await callAdminOperation('revoke_teacher', userId);
      toast.success(`Ruolo insegnante revocato per ${firstName} ${lastName}`);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Errore durante la revoca del ruolo');
    } finally {
      setOperatingUserId(null);
    }
  };

  const handleDeleteUser = async (forceDelete = false) => {
    if (!userToDelete) return;

    setOperatingUserId(userToDelete.id);
    try {
      const result = await callAdminOperation('delete_user', userToDelete.id, forceDelete);
      
      if (result.requires_force) {
        setDeleteDialogOpen(false);
        setDependencies(result.dependencies);
        setForceDeleteDialogOpen(true);
        setOperatingUserId(null);
        return;
      }

      toast.success(`Utente ${userToDelete.first_name} ${userToDelete.last_name} eliminato con successo`);
      setDeleteDialogOpen(false);
      setForceDeleteDialogOpen(false);
      setUserToDelete(null);
      setDependencies(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Errore durante l\'eliminazione');
      setDeleteDialogOpen(false);
      setForceDeleteDialogOpen(false);
      setUserToDelete(null);
    } finally {
      setOperatingUserId(null);
    }
  };

  const handleForceDelete = async () => {
    await handleDeleteUser(true);
  };

  const openDetailsDialog = (user: typeof users[0]) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
  };

  const openDeleteDialog = (user: typeof users[0]) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Gestione Utenti</h1>
          <p className="text-muted-foreground mt-1">
            Visualizza e gestisci tutti gli utenti registrati
          </p>
        </div>

        {/* Statistiche */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Studenti"
            value={stats.totalStudents}
            icon={GraduationCap}
            description="Utenti con ruolo studente"
          />
          <StatCard
            title="Insegnanti"
            value={stats.totalTeachers}
            icon={BookOpen}
            description="Utenti con ruolo insegnante"
          />
          <StatCard
            title="Doppio Ruolo"
            value={stats.dualRoles}
            icon={UserCog}
            description="Studenti e insegnanti"
          />
          <StatCard
            title="Totale Utenti"
            value={stats.totalUsers}
            icon={Users}
            description="Tutti gli utenti registrati"
          />
        </div>

        {/* Filtri */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Cerca per nome, cognome o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:max-w-xs"
          />

          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Filtra per ruolo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i ruoli</SelectItem>
              <SelectItem value="students">Solo Studenti</SelectItem>
              <SelectItem value="teachers">Solo Insegnanti</SelectItem>
              <SelectItem value="dual">Doppio Ruolo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Ordina per" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="date">Data Registrazione</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabella */}
        <div className="border rounded-lg">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ruoli</TableHead>
                  <TableHead>Registrato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nessun utente trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                       <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          <UserRolesBadges roles={user.roles} />
                          {user.is_super_admin && (
                            <Badge variant="destructive" className="gap-1.5 text-xs">
                              <UserCog className="w-3 h-3" />
                              SA
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(user.created_at), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openDetailsDialog(user)}
                            disabled={operatingUserId !== null}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {isSuperAdmin && (
                            <>
                              {!user.roles.includes('teacher') && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handlePromoteUser(user.id, user.first_name, user.last_name)}
                                  disabled={operatingUserId !== null}
                                >
                                  {operatingUserId === user.id ? (
                                    <UserCog className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <UserCog className="w-4 h-4 mr-2" />
                                  )}
                                  Promuovi
                                </Button>
                              )}

                              {user.roles.includes('teacher') && !user.is_super_admin && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleRevokeTeacher(user.id, user.first_name, user.last_name)}
                                  disabled={operatingUserId !== null}
                                >
                                  {operatingUserId === user.id ? (
                                    <UserX className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <UserX className="w-4 h-4 mr-2" />
                                  )}
                                  Revoca
                                </Button>
                              )}

                              {!user.is_super_admin && (
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => openDeleteDialog(user)}
                                  disabled={operatingUserId !== null}
                                >
                                  {operatingUserId === user.id ? (
                                    <Trash2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>

      <UserDetailsDialog 
        user={selectedUser} 
        open={detailsDialogOpen} 
        onOpenChange={setDetailsDialogOpen} 
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione Utente</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare <strong>{userToDelete?.first_name} {userToDelete?.last_name}</strong>?
              <br /><br />
              Questa azione è irreversibile e potrebbe comportare la perdita di dati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteUser(false)} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina Utente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={forceDeleteDialogOpen} onOpenChange={setForceDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              ⚠️ Attenzione: Dati Critici Rilevati
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                L'utente <strong>{userToDelete?.first_name} {userToDelete?.last_name}</strong> ha i seguenti dati nel sistema:
              </p>
              {dependencies && (
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {dependencies.classes_owned > 0 && (
                    <li>Classi create: <strong>{dependencies.classes_owned}</strong></li>
                  )}
                  {dependencies.assignments_created > 0 && (
                    <li>Assegnazioni create: <strong>{dependencies.assignments_created}</strong></li>
                  )}
                  {dependencies.students_enrolled > 0 && (
                    <li>Iscrizioni a classi: <strong>{dependencies.students_enrolled}</strong></li>
                  )}
                  {dependencies.submissions_made > 0 && (
                    <li>Consegne effettuate: <strong>{dependencies.submissions_made}</strong></li>
                  )}
                  {dependencies.custom_exercises > 0 && (
                    <li>Esercizi personalizzati: <strong>{dependencies.custom_exercises}</strong></li>
                  )}
                  {dependencies.saved_programs > 0 && (
                    <li>Programmi salvati: <strong>{dependencies.saved_programs}</strong></li>
                  )}
                </ul>
              )}
              <p className="text-destructive font-semibold">
                Eliminando questo utente, tutti i dati correlati verranno persi definitivamente.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setForceDeleteDialogOpen(false);
              setUserToDelete(null);
              setDependencies(null);
            }}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleForceDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Conferma Eliminazione Forzata
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
