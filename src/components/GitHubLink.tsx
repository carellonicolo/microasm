import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Github } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const GITHUB_URL = "https://github.com/carellonicolo/microasm";

export function GitHubLink() {
  const t = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="relative group hover:bg-primary/10 transition-all duration-300"
        >
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.github.viewOnGithub}
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Github className="h-5 w-5 transition-colors group-hover:text-primary" />
            <span className="sr-only">{t.github.viewOnGithub}</span>
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent className="glass-card border-primary/20">
        <p className="text-xs">{t.github.repository}</p>
      </TooltipContent>
    </Tooltip>
  );
}
