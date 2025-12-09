import { useState } from 'react';
import { BookOpen, Languages, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DocumentationSidebar } from './DocumentationSidebar';
import { DocumentationContent } from './DocumentationContent';
import { useLanguage, useTranslation } from '@/hooks/useTranslation';

export function DocumentationDialog() {
  const [activeSection, setActiveSection] = useState('reference');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false); // Close mobile menu when section changes
  };

  const toggleLanguage = () => {
    setLanguage(language === 'it' ? 'en' : 'it');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label={t.documentation.title}>
          <BookOpen className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{t.documentation.guide}</DialogTitle>
              <DialogDescription>
                {language === 'it'
                  ? 'Riferimento completo al linguaggio assembly MicroASM'
                  : 'Complete reference for the MicroASM assembly language'}
              </DialogDescription>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" aria-label={t.documentation.languageSwitch}>
                    <Languages className="w-4 h-4 mr-2" />
                    {language.toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage('it')}>
                    🇮🇹 Italiano
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('en')}>
                    🇬🇧 English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <div className="py-4 px-2">
                    <h3 className="px-4 text-sm font-semibold mb-2">
                      {t.documentation.sections}
                    </h3>
                    <DocumentationSidebar
                      activeSection={activeSection}
                      onSectionChange={handleSectionChange}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content Area */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Desktop Only */}
          <div className="hidden md:block w-[280px] border-r">
            <DocumentationSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <DocumentationContent activeSection={activeSection} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
