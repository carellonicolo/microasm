import { useEffect, useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/hooks/useTranslation';
import { Loader2 } from 'lucide-react';

interface DocumentationContentProps {
  activeSection: string;
  className?: string;
}

// Map section IDs to markdown file names
const SECTION_TO_FILE: Record<string, string> = {
  'reference': '01-reference.md',
  'tutorial': '02-tutorial.md',
  'opcodes': '03-opcodes.md',
  'architecture': '04-architecture.md',
};

// Import all markdown files using Vite's glob import
const markdownModules = import.meta.glob<{ default: string }>(
  '/src/data/documentation/**/*.md',
  { query: '?raw', import: 'default', eager: true }
);

export function DocumentationContent({ activeSection, className = '' }: DocumentationContentProps) {
  const { language } = useLanguage();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);

      try {
        // Extract main section ID (before the dash)
        const mainSection = activeSection.split('-')[0];
        const fileName = SECTION_TO_FILE[mainSection];

        if (!fileName) {
          setError(`Section not found: ${activeSection}`);
          setLoading(false);
          return;
        }

        // Construct file path based on language
        const filePath = `/src/data/documentation/${language}/${fileName}`;

        // Get markdown content from imported modules
        const text = markdownModules[filePath];

        if (!text) {
          throw new Error(`File not found: ${filePath}`);
        }

        // If there's a subsection (e.g., 'reference-intro'), scroll to anchor
        const subsectionId = activeSection.split('-').slice(1).join('-');
        if (subsectionId) {
          // We'll handle anchor scrolling after rendering
          // Store the anchor ID for later use
          setTimeout(() => {
            const element = document.getElementById(subsectionId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }

        setContent(text);
      } catch (err) {
        console.error('Error loading documentation:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [activeSection, language]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <div className="text-4xl">📄</div>
          <h3 className="text-lg font-semibold">Documentation Not Found</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            This section is still being written. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className={`h-full ${className}`}>
      <div className="p-6 md:p-8">
        <MarkdownRenderer content={content} />
      </div>
    </ScrollArea>
  );
}
