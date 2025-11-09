import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useExercises, generateExerciseTemplate, Exercise } from '@/hooks/useExercises';
import { ExerciseCard } from '@/components/dashboard/ExerciseCard';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const DashboardExercises = () => {
  const { exercises, loading } = useExercises();
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(exercises.map(ex => ex.category));
    return Array.from(cats).sort();
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchesSearch = searchQuery === '' || 
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDifficulty = difficultyFilter === 'all' || ex.difficulty === difficultyFilter;
      const matchesCategory = categoryFilter === 'all' || ex.category === categoryFilter;
      
      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [exercises, searchQuery, difficultyFilter, categoryFilter]);

  const handleLoadExercise = (exercise: Exercise) => {
    const template = generateExerciseTemplate(exercise);
    localStorage.setItem('microasm_loaded_code', template);
    toast.success(`Esercizio "${exercise.title}" caricato nell'editor`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              Repository Esercizi
            </h1>
            <p className="text-muted-foreground mt-1">
              {exercises.length} esercizi didattici progressivi
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca esercizi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Difficoltà" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le difficoltà</SelectItem>
              <SelectItem value="principiante">Principiante</SelectItem>
              <SelectItem value="intermedio">Intermedio</SelectItem>
              <SelectItem value="avanzato">Avanzato</SelectItem>
              <SelectItem value="esperto">Esperto</SelectItem>
              <SelectItem value="impossibile">Impossibile</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le categorie</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredExercises.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun esercizio trovato</h3>
            <p className="text-muted-foreground">
              Prova a modificare i filtri di ricerca
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onLoadExercise={handleLoadExercise}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardExercises;
