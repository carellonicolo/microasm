import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Terminal, CheckCircle, AlertCircle, Trash2, Copy } from "lucide-react";
import { useRef, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface OutputLogProps {
  output: string[];
  errors: string[];
  onClear?: () => void;
}

export function OutputLog({ output, errors, onClear }: OutputLogProps) {
  const t = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isEmpty = output.length === 0 && errors.length === 0;

  // Auto-scroll al nuovo output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [output, errors]);

  const handleCopy = () => {
    const text = [
      ...output.map((line, idx) => `[OUT ${idx + 1}] ${line}`),
      ...errors.map((err, idx) => `[ERROR ${idx + 1}] ${err}`)
    ].join('\n');
    navigator.clipboard.writeText(text);
    toast.success(t.output.logCopied);
  };

  return (
    <Card className="p-4 flex flex-col h-full card-hover rounded-2xl border-2 border-primary/10">
      {/* Header con counter e azioni */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          {t.output.logOutput}
        </h2>
        {!isEmpty && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              {output.length} {t.output.output} • {errors.length} {t.output.errors}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleCopy} title={t.output.copyLog} aria-label={t.output.copyLog}>
              <Copy className="h-4 w-4" />
            </Button>
            {onClear && (
              <Button variant="ghost" size="sm" onClick={onClear} title={t.output.clearLog} aria-label={t.output.clearLog}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1 pr-3">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
            <Terminal className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">{t.output.noOutput}</p>
            <p className="text-xs mt-1 text-center max-w-[200px]">
              {t.output.outputWillAppear}
            </p>
          </div>
        ) : (
          <div className="space-y-2 animate-in fade-in-50">
            {/* Output con numerazione e badge */}
            {output.map((line, idx) => (
              <div 
                key={`out-${idx}`} 
                className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group"
              >
                <Badge 
                  variant="outline" 
                  className="shrink-0 font-mono text-xs bg-success/10 text-success border-success/30"
                >
                  #{idx + 1}
                </Badge>
                <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="font-mono text-sm text-foreground flex-1 break-all">
                  {line}
                </span>
              </div>
            ))}
            
            {/* Separatore tra output ed errori */}
            {output.length > 0 && errors.length > 0 && (
              <Separator className="my-4" />
            )}
            
            {/* Errori con styling migliorato */}
            {errors.map((error, idx) => (
              <div 
                key={`err-${idx}`}
                className="flex items-start gap-3 p-3 rounded-md bg-destructive/10 border-2 border-destructive/30 dark:border-destructive/20 animate-in slide-in-from-left-5"
              >
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-destructive text-sm mb-1">
                    {t.output.runtimeError}
                  </p>
                  <p className="font-mono text-xs text-destructive/90 break-words">
                    {error}
                  </p>
                </div>
              </div>
            ))}
            
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}