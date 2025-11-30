import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AutoGradeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  exerciseCount: number;
  exercisesWithoutOutput: number;
}

export const AutoGradeToggle = ({
  enabled,
  onToggle,
  exerciseCount,
  exercisesWithoutOutput
}: AutoGradeToggleProps) => {
  const canAutoGrade = exercisesWithoutOutput === 0 && exerciseCount > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
        <div className="flex items-center gap-2">
          <Label htmlFor="auto_grade" className="cursor-pointer font-semibold">
            Correzione Automatica
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">
                  Se abilitata, l'esercitazione verrà corretta automaticamente alla scadenza.
                  Il sistema eseguirà il codice degli studenti e confronterà l'output con quello atteso,
                  assegnando automaticamente i voti.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch
          id="auto_grade"
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={!canAutoGrade}
        />
      </div>

      {enabled && canAutoGrade && (
        <Alert className="border-blue-500/20 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm">
            ✅ Correzione automatica abilitata. Il sistema correggerà automaticamente le consegne 
            <strong> entro 5 minuti dalla scadenza</strong>. Gli studenti riceveranno feedback dettagliato 
            con il confronto tra output atteso e ottenuto.
          </AlertDescription>
        </Alert>
      )}

      {exercisesWithoutOutput > 0 && (
        <Alert className="border-orange-500/20 bg-orange-500/5">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-sm">
            ⚠️ <strong>{exercisesWithoutOutput} esercizio/i</strong> senza output atteso.
            La correzione automatica non può essere abilitata finché tutti gli esercizi 
            non hanno un output definito. Contatta il supporto per aggiungere output agli esercizi.
          </AlertDescription>
        </Alert>
      )}

      {exerciseCount === 0 && (
        <Alert className="border-red-500/20 bg-red-500/5">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-sm">
            ❌ Aggiungi almeno un esercizio per abilitare la correzione automatica.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
