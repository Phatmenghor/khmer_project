"use client";

import { User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileTabSwitcherProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function ProfileTabSwitcher({
  activeSection,
  onSectionChange,
}: ProfileTabSwitcherProps) {
  return (
    <div className="p-1 bg-muted/40 rounded-xl border border-border/80 flex items-center gap-1 mb-4">
      <button
        type="button"
        onClick={() => onSectionChange("profile")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-extrabold transition-all duration-200",
          activeSection === "profile"
            ? "bg-background text-foreground shadow-xs border border-border/60"
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        )}
      >
        <User className="w-4 h-4 text-primary shrink-0" />
        <span>Profile Details</span>
      </button>

      <button
        type="button"
        onClick={() => onSectionChange("security")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-extrabold transition-all duration-200",
          activeSection === "security"
            ? "bg-background text-foreground shadow-xs border border-border/60"
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        )}
      >
        <Lock className="w-4 h-4 text-primary shrink-0" />
        <span>Security &amp; Accounts</span>
      </button>
    </div>
  );
}
