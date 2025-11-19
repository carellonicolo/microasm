import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { UserRolesBadges } from '@/components/shared/UserRolesBadges';
import { useAllUsers } from '@/hooks/useAllUsers';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, GraduationCap, BookOpen, UserCog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

type RoleFilter = 'all' | 'students' | 'teachers' | 'dual';
type SortBy = 'name' | 'email' | 'date';

export default function DashboardUsers() {
  const { users, loading } = useAllUsers();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [promoting, setPromoting] = useState<string | null>(null);

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

  const handlePromoteUser = async (userId: string, firstName: string, lastName: string) => {
    if (!session?.user?.id) {
      toast.error('Sessione non valida');
      return;
    }

    setPromoting(userId);

    try {
      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: 'teacher',
        assigned_by: session.user.id,
      });

      if (error) {
        console.error('Error promoting user:', error);
        toast.error('Errore durante la promozione');
        return;
      }

      toast.success(`${firstName} ${lastName} promosso a insegnante!`);
      
      // Refresh immediato (l'hook si aggiornerà automaticamente)
      window.location.reload();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Errore imprevisto');
    } finally {
      setPromoting(null);
    }
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
                  filteredUsers.map((user) => {
                    const isOnlyStudent = user.roles.includes('student') && !user.roles.includes('teacher');
                    const canPromote = isOnlyStudent;

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <UserRolesBadges roles={user.roles} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(user.created_at), {
                            addSuffix: true,
                            locale: it,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {canPromote && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePromoteUser(user.id, user.first_name, user.last_name)}
                              disabled={promoting === user.id}
                            >
                              {promoting === user.id ? 'Promozione...' : 'Promuovi'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </DashboardLayout>
  );
}
