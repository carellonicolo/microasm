import { useState, useEffect } from "react";
import { Code, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EXAMPLES_METADATA } from "@/data/examples";

interface ExamplesDialogProps {
  onLoadExample: (code: string) => void;
}

interface ExampleProgress {
  loaded: number[];
  lastLoaded?: number;
}

const useExampleProgress = () => {
  const [progress, setProgress] = useState<ExampleProgress>(() => {
    const saved = localStorage.getItem('microasm_example_progress');
    return saved ? JSON.parse(saved) : { loaded: [] };
  });

  const markLoaded = (exampleId: number) => {
    const updated = {
      ...progress,
      loaded: [...new Set([...progress.loaded, exampleId])],
      lastLoaded: exampleId
    };
    setProgress(updated);
    localStorage.setItem('microasm_example_progress', JSON.stringify(updated));
  };

  return { progress, markLoaded };
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'principiante':
      return 'text-green-500';
    case 'intermedio':
      return 'text-yellow-500';
    case 'avanzato':
      return 'text-orange-500';
    default:
      return 'text-muted-foreground';
  }
};

export function ExamplesDialog({ onLoadExample }: ExamplesDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(1);
  const { progress, markLoaded } = useExampleProgress();

  const selectedExample = EXAMPLES_METADATA.find(ex => ex.id === selectedId) || EXAMPLES_METADATA[0];
  const currentIndex = EXAMPLES_METADATA.findIndex(ex => ex.id === selectedId);

  const handleLoadExample = () => {
    if (selectedExample) {
      onLoadExample(selectedExample.code);
      markLoaded(selectedExample.id);
      setOpen(false);
      toast.success(`Esempio "${selectedExample.title}" caricato`);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : EXAMPLES_METADATA.length - 1;
    setSelectedId(EXAMPLES_METADATA[prevIndex].id);
  };

  const handleNext = () => {
    const nextIndex = currentIndex < EXAMPLES_METADATA.length - 1 ? currentIndex + 1 : 0;
    setSelectedId(EXAMPLES_METADATA[nextIndex].id);
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleLoadExample();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 sm:gap-2" aria-label="Apri esempi di codice">
          <Code className="w-4 h-4" />
          <span className="hidden sm:inline">Esempi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Code className="w-6 h-6 text-primary" />
            Esempi di Codice
            <Badge variant="secondary" className="ml-2 relative font-mono text-xs">
              {EXAMPLES_METADATA.length}
            </Badge>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 text-base">
            <span>
              {EXAMPLES_METADATA.length} esempi per imparare le basi del MicroASM
            </span>
            {progress.loaded.length > 0 && (
              <Badge variant="outline" className="font-mono gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Caricati: {progress.loaded.length}/{EXAMPLES_METADATA.length}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Sidebar - Lista esempi */}
          <ScrollArea className="h-[500px] md:col-span-1">
            <div className="space-y-2 pr-4">
              {EXAMPLES_METADATA.map((example) => {
                const isSelected = example.id === selectedId;
                const isLoaded = progress.loaded.includes(example.id);

                return (
                  <Card
                    key={example.id}
                    className={cn(
                      "p-3 cursor-pointer transition-all hover:border-primary/50 hover:scale-[1.02]",
                      isSelected && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedId(example.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">
                            {example.title}
                          </h4>
                          {isLoaded && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {example.category}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getDifficultyColor(example.difficulty))}
                          >
                            {example.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          {/* Main Content - Dettagli esempio */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{selectedExample.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">
                      {selectedExample.category}
                    </Badge>
                    <Badge 
                      variant="secondary"
                      className={getDifficultyColor(selectedExample.difficulty)}
                    >
                      {selectedExample.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedExample.description}
                  </p>
                </div>
              </div>

              {/* Anteprima codice */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Anteprima Codice
                </h4>
                <ScrollArea className="h-[280px] rounded-md border bg-muted/30">
                  <pre className="p-4 text-xs font-mono">
                    <code>{selectedExample.code}</code>
                  </pre>
                </ScrollArea>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <Button onClick={handleLoadExample} className="gap-2">
                <Code className="w-4 h-4" />
                Carica nel Simulatore
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Usa le frecce ← → per navigare • Premi Invio per caricare
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
