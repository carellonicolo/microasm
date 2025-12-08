import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Play, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useEditor } from '@/contexts/EditorContext';
import { useTranslation } from '@/hooks/useTranslation';

interface ViewCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  studentName?: string;
  submissionNumber?: number;
  submittedAt?: string;
}

export const ViewCodeDialog = ({
  open,
  onOpenChange,
  code,
  studentName,
  submissionNumber,
  submittedAt
}: ViewCodeDialogProps) => {
  const t = useTranslation();
  const navigate = useNavigate();
  const { setCode, closeProgram } = useEditor();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success(t.dialogs.codeCopied);
  };

  const handleOpenInSimulator = () => {
    closeProgram();
    setCode(code);
    onOpenChange(false);
    navigate('/');
    toast.success(t.dialogs.codeLoadedInSimulator);
  };

  const lines = code.split('\n');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                {t.dialogs.viewCodeTitle}
              </DialogTitle>
              {studentName && (
                <p className="text-sm text-muted-foreground mt-1">
                  {studentName} - {t.dialogs.submission} #{submissionNumber}
                  {submittedAt && ` • ${new Date(submittedAt).toLocaleString()}`}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleCopyCode}>
            <Copy className="w-4 h-4 mr-2" />
            {t.dialogs.copyCode}
          </Button>
          <Button size="sm" onClick={handleOpenInSimulator}>
            <Play className="w-4 h-4 mr-2" />
            {t.dialogs.openInSimulator}
          </Button>
        </div>

        <ScrollArea className="h-[60vh] rounded-lg border bg-code-bg">
          <div className="flex font-mono text-sm p-4">
            <div className="bg-gradient-to-r from-code-bg to-transparent mr-4 pr-3 select-none text-right flex-shrink-0 border-r border-code-text/20">
              {lines.map((_, idx) => (
                <div key={idx} className="leading-6 px-2 text-code-text/50">
                  {idx + 1}
                </div>
              ))}
            </div>
            <pre className="flex-1 text-code-text leading-6 whitespace-pre-wrap break-words">
              {code}
            </pre>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};