import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DOCUMENTATION_NAV, NavigationNode } from '@/data/documentation/metadata';
import { useLanguage } from '@/hooks/useTranslation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface DocumentationSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  className?: string;
}

export function DocumentationSidebar({
  activeSection,
  onSectionChange,
  className = ''
}: DocumentationSidebarProps) {
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['reference', 'tutorial', 'opcodes', 'architecture'])
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const isExpanded = (sectionId: string) => expandedSections.has(sectionId);

  const getNodeTitle = (node: NavigationNode) => {
    return language === 'it' ? node.titleIt : node.titleEn;
  };

  const getSectionTitle = (section: { titleIt: string; titleEn: string }) => {
    return language === 'it' ? section.titleIt : section.titleEn;
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-1">
          {DOCUMENTATION_NAV.map((node) => {
            const expanded = isExpanded(node.id);
            const hasActiveChild = node.children?.some(
              (child) => `${node.id}-${child.id}` === activeSection
            );
            const isSectionActive = activeSection === node.id || hasActiveChild;

            return (
              <div key={node.id} className="space-y-1">
                {/* Main Section */}
                <Button
                  variant={isSectionActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start px-3 py-2 h-auto font-medium ${
                    isSectionActive ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => {
                    toggleSection(node.id);
                    onSectionChange(node.id);
                  }}
                >
                  {expanded ? (
                    <ChevronDown className="mr-2 h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-left flex-1 text-sm">
                    {getNodeTitle(node)}
                  </span>
                </Button>

                {/* Subsections */}
                {expanded && node.children && (
                  <div className="ml-6 space-y-0.5 border-l-2 border-primary/20 pl-2">
                    {node.children.map((section) => {
                      const sectionKey = `${node.id}-${section.id}`;
                      const isActive = activeSection === sectionKey;

                      return (
                        <Button
                          key={sectionKey}
                          variant={isActive ? 'secondary' : 'ghost'}
                          className={`w-full justify-start px-3 py-1.5 h-auto text-sm font-normal ${
                            isActive ? 'bg-primary/20 font-medium' : ''
                          }`}
                          onClick={() => onSectionChange(sectionKey)}
                        >
                          {getSectionTitle(section)}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
