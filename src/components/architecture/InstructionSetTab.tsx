import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CPU_INSTRUCTIONS } from "@/data/cpuArchitecture";
import { Search } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function InstructionSetTab() {
  const [search, setSearch] = useState("");

  const filteredInstructions = CPU_INSTRUCTIONS.map(category => ({
    ...category,
    instructions: category.instructions.filter(instr =>
      instr.opcode.toLowerCase().includes(search.toLowerCase()) ||
      instr.description.toLowerCase().includes(search.toLowerCase()) ||
      instr.syntax.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(category => category.instructions.length > 0);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca istruzione (es: MOV, ADD, PUSH)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
      </Card>

      {filteredInstructions.map((category) => (
        <div key={category.category} className="space-y-3">
          <h3 className="text-lg font-semibold">{category.category}</h3>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Opcode</TableHead>
                  <TableHead className="w-40">Sintassi</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead className="w-24">Flag</TableHead>
                  <TableHead className="w-20">Cicli</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.instructions.map((instr) => (
                  <HoverCard key={instr.opcode} openDelay={200}>
                    <HoverCardTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-mono font-bold">{instr.opcode}</TableCell>
                        <TableCell className="font-mono text-xs">{instr.syntax}</TableCell>
                        <TableCell className="text-sm">{instr.description}</TableCell>
                        <TableCell>
                          {instr.flags === 'Nessuno' ? (
                            <Badge variant="outline" className="text-xs">-</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">{instr.flags}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={instr.cycles === 1 ? "default" : "secondary"}>
                            {instr.cycles}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-96" side="left">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Esempio</h4>
                          <code className="text-xs bg-secondary p-2 rounded block">
                            {instr.example}
                          </code>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Flusso Dati</h4>
                          <div className="space-y-1">
                            {instr.dataFlow.map((step, idx) => (
                              <div key={idx} className="text-xs flex gap-2">
                                <span className="text-muted-foreground">{idx + 1}.</span>
                                <span className="font-mono">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {instr.flags !== 'Nessuno' && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              <strong>Flag modificati:</strong> {instr.flags}
                            </p>
                          </div>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      {filteredInstructions.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nessuna istruzione trovata per "{search}"</p>
        </Card>
      )}

      <Card className="p-4 bg-muted">
        <h4 className="font-semibold text-sm mb-2">Legenda</h4>
        <div className="grid gap-2 text-xs">
          <div><strong>Cicli:</strong> Numero approssimativo di cicli di clock per eseguire l'istruzione</div>
          <div><strong>Flag ZF:</strong> Zero Flag - 1 se risultato = 0</div>
          <div><strong>Flag SF:</strong> Sign Flag - 1 se risultato &lt; 0</div>
          <div><strong>Hover:</strong> Passa il mouse su un'istruzione per vedere esempio e dettagli</div>
        </div>
      </Card>
    </div>
  );
}
