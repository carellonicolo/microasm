import { useState, useMemo, useEffect } from "react";
import {
  GraduationCap,
  Tag,
  FileText,
  CheckCircle2,
  Lightbulb,
  Target,
  Code,
  ChevronLeft,
  ChevronRight,
  Search,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EXERCISES, generateExerciseTemplate, type Exercise } from "@/data/exercises";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ExercisesDialogProps {
  onLoadExercise: (code: string) => void;
}

interface ExerciseProgress {
  completed: number[];
  lastAttempt?: number;
}

const useExerciseProgress = () => {
  const [progress, setProgress] = useState<ExerciseProgress>(() => {
    const saved = localStorage.getItem('microasm_exercise_progress');
    return saved ? JSON.parse(saved) : { completed: [] };
  });

  const markCompleted = (exerciseId: number) => {
    const updated = {
      ...progress,
      completed: [...new Set([...progress.completed, exerciseId])],
      lastAttempt: exerciseId
    };
    setProgress(updated);
    localStorage.setItem('microasm_exercise_progress', JSON.stringify(updated));
  };

  return { progress, markCompleted };
};

const getDifficultyVariant = (difficulty: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (difficulty) {
    case 'facile':
      return 'default';
    case 'medio':
      return 'secondary';
    case 'difficile':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'facile':
      return 'text-green-500';
    case 'medio':
      return 'text-yellow-500';
    case 'difficile':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
};

export function ExercisesDialog({ onLoadExercise }: ExercisesDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(1);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { progress, markCompleted } = useExerciseProgress();

  const filteredExercises = useMemo(() => {
    return EXERCISES.filter(ex => {
      const matchesDifficulty = difficultyFilter === 'all' || ex.difficulty === difficultyFilter;
      const matchesSearch = searchQuery === '' || 
        ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDifficulty && matchesSearch;
    });
  }, [difficultyFilter, searchQuery]);

  const selectedExercise = EXERCISES.find(ex => ex.id === selectedId);

  const handleLoadExercise = () => {
    if (!selectedExercise) return;
    
    const template = generateExerciseTemplate(selectedExercise);
    onLoadExercise(template);
    setOpen(false);
    
    toast.success(`Esercizio ${selectedExercise.id} caricato!`, {
      description: selectedExercise.title,
      icon: <GraduationCap className="w-4 h-4" />
    });
  };

  const handlePrevious = () => {
    if (selectedId > 1) {
      setSelectedId(selectedId - 1);
    }
  };

  const handleNext = () => {
    if (selectedId < EXERCISES.length) {
      setSelectedId(selectedId + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleLoadExercise();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedId]);

  const completionRate = Math.round((progress.completed.length / EXERCISES.length) * 100);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="group relative overflow-hidden hover:border-primary/50 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <GraduationCap className="w-4 h-4 mr-2 relative group-hover:text-primary transition-colors" />
          <span className="relative">Esercizi</span>
          <Badge 
            variant="secondary" 
            className="ml-2 relative font-mono text-xs"
          >
            20
          </Badge>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-3xl flex items-center gap-3 mb-2">
                <GraduationCap className="w-8 h-8 text-primary" />
                Esercizi MicroASM
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 text-base">
                <span>20 esercizi progressivi dal livello base all'avanzato</span>
                {progress.completed.length > 0 && (
                  <Badge variant="outline" className="font-mono gap-2">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    Completati: {progress.completed.length}/20 ({completionRate}%)
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Filtri e Ricerca */}
        <div className="flex flex-col sm:flex-row gap-4 px-6 py-4 border-b bg-muted/30">
          <ToggleGroup 
            type="single" 
            value={difficultyFilter} 
            onValueChange={(value) => value && setDifficultyFilter(value)}
            className="justify-start flex-wrap"
          >
            <ToggleGroupItem value="all" className="text-xs">
              Tutti <span className="ml-1 opacity-60">({EXERCISES.length})</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="facile" className="text-xs">
              ⭐ Facile <span className="ml-1 opacity-60">(5)</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="medio" className="text-xs">
              ⭐⭐ Medio <span className="ml-1 opacity-60">(7)</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="difficile" className="text-xs">
              ⭐⭐⭐ Difficile <span className="ml-1 opacity-60">(8)</span>
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cerca esercizio..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        </div>

        {/* Main Content: Sidebar + Detail */}
        <div className="flex-1 flex gap-0 overflow-hidden">
          {/* Sidebar: Lista Esercizi */}
          <ScrollArea className="w-[320px] border-r">
            <div className="p-4 space-y-2">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Nessun esercizio trovato
                  </p>
                </div>
              ) : (
                filteredExercises.map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => setSelectedId(ex.id)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent",
                      "hover:bg-primary/10 hover:border-primary/30",
                      selectedId === ex.id && "bg-gradient-to-r from-primary/20 to-accent/10 border-primary/50 shadow-lg"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground font-semibold">#{ex.id}</span>
                        {progress.completed.includes(ex.id) && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <Badge variant={getDifficultyVariant(ex.difficulty)} className="text-[10px] px-1.5 py-0">
                        {ex.difficulty}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm mb-1 leading-tight">{ex.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {ex.category}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Detail Panel */}
          <ScrollArea className="flex-1">
            {selectedExercise && (
              <div className="p-6 space-y-6 animate-in fade-in-50 duration-300">
                {/* Header Esercizio */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {selectedExercise.title}
                    </h3>
                    <Badge 
                      variant={getDifficultyVariant(selectedExercise.difficulty)}
                      className="text-sm px-3 py-1.5 font-semibold"
                    >
                      {selectedExercise.difficulty.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {selectedExercise.category}
                  </p>
                </div>

                {/* Consegna */}
                <div className="glass-card p-5 rounded-xl border border-primary/20">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-base">
                    <FileText className="w-5 h-5 text-primary" />
                    Consegna
                  </h4>
                  <p className="text-sm leading-relaxed">{selectedExercise.description}</p>
                </div>

                {/* Requisiti */}
                <div className="glass-card p-5 rounded-xl border border-green-500/20">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-base">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Requisiti
                  </h4>
                  <ul className="space-y-2">
                    {selectedExercise.requirements.map((req, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggerimenti */}
                {selectedExercise.hints && selectedExercise.hints.length > 0 && (
                  <div className="glass-card p-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-base">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Suggerimenti
                    </h4>
                    <ul className="space-y-2">
                      {selectedExercise.hints.map((hint, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground italic flex items-start gap-2">
                          <span className="text-yellow-500">💡</span>
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Output Atteso */}
                {selectedExercise.expectedOutput && (
                  <div className="glass-card p-5 rounded-xl border border-accent/20">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-base">
                      <Target className="w-5 h-5 text-accent" />
                      Output Atteso
                    </h4>
                    <pre className="bg-background/50 text-foreground p-4 rounded-lg font-mono text-xs leading-relaxed whitespace-pre-wrap border">
{selectedExercise.expectedOutput}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer: Azioni */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground font-mono">
              Esercizio <span className="font-bold text-foreground">{selectedExercise?.id}</span> di <span className="font-bold">{EXERCISES.length}</span>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                disabled={selectedId === 1}
                onClick={handlePrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                disabled={selectedId === EXERCISES.length}
                onClick={handleNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} size="sm">
              Chiudi
            </Button>
            <Button 
              onClick={handleLoadExercise}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              size="sm"
            >
              <Code className="w-4 h-4 mr-2" />
              Inizia Esercizio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
