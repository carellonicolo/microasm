import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { BookOpen } from 'lucide-react';

const DashboardExercises = () => {
  const { isTeacher, loading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isTeacher) {
      navigate('/dashboard');
    }
  }, [isTeacher, loading, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Repository Esercizi</h1>
            <p className="text-muted-foreground mt-1">
              100 esercizi didattici progressivi
            </p>
          </div>
        </div>

        <div className="text-center py-12 glass-card rounded-xl">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Repository in costruzione</h3>
          <p className="text-muted-foreground">
            Il repository con 100 esercizi sarà disponibile a breve
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardExercises;
