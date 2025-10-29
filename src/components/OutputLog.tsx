import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OutputLogProps {
  output: string[];
  errors: string[];
}

export function OutputLog({ output, errors }: OutputLogProps) {
  return (
    <Card className="p-4 flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4">Log Output</h2>
      
      <ScrollArea className="flex-1">
        <div className="space-y-2 font-mono text-sm">
          {output.map((line, idx) => (
            <div key={`out-${idx}`} className="text-code-text">
              <span className="text-success mr-2">&gt;</span>
              {line}
            </div>
          ))}
          {errors.map((error, idx) => (
            <div key={`err-${idx}`} className="text-error">
              <span className="font-bold mr-2">ERROR:</span>
              {error}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
