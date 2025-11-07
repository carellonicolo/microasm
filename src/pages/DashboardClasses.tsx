import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { Users } from 'lucide-react';

const DashboardClasses = () => {
  const { isTeacher } = useUserRole();

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Le Mie Classi</h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher ? 'Gestisci le tue classi e studenti' : 'Visualizza le classi a cui appartieni'}
            </p>
          </div>
        </div>

        <div className="text-center py-12 glass-card rounded-xl">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Feature in costruzione</h3>
          <p className="text-muted-foreground">
            La gestione delle classi sarà disponibile a breve
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardClasses;
