import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OverviewTab } from "./architecture/OverviewTab";
import { ComponentsTab } from "./architecture/ComponentsTab";
import { InstructionSetTab } from "./architecture/InstructionSetTab";
import { BusDataFlowTab } from "./architecture/BusDataFlowTab";
import { FetchExecuteTab } from "./architecture/FetchExecuteTab";

interface CPUArchitectureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CPUArchitectureDialog({ open, onOpenChange }: CPUArchitectureDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">Architettura CPU - Guida Completa</DialogTitle>
          <DialogDescription>
            Documentazione dettagliata dell'architettura della CPU simulata, con schemi dei bus e flussi di dati
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Panoramica</TabsTrigger>
              <TabsTrigger value="components">Componenti</TabsTrigger>
              <TabsTrigger value="instructions">Istruzioni</TabsTrigger>
              <TabsTrigger value="bus">Bus & Flussi</TabsTrigger>
              <TabsTrigger value="cycle">Ciclo F-D-E</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            <TabsContent value="overview" className="mt-0">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="components" className="mt-0">
              <ComponentsTab />
            </TabsContent>

            <TabsContent value="instructions" className="mt-0">
              <InstructionSetTab />
            </TabsContent>

            <TabsContent value="bus" className="mt-0">
              <BusDataFlowTab />
            </TabsContent>

            <TabsContent value="cycle" className="mt-0">
              <FetchExecuteTab />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
