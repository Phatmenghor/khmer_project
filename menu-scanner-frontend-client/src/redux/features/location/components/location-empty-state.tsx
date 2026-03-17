"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Map, Plus } from "lucide-react";

interface LocationEmptyStateProps {
  onAdd: () => void;
}

export function LocationEmptyState({ onAdd }: LocationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <Map className="h-12 w-12 text-primary/60" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center">
          <Plus className="h-4 w-4 text-primary" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No saved locations
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-8 leading-relaxed">
        Save your favourite delivery spots — use the interactive map or select
        from our location hierarchy.
      </p>
      <Button onClick={onAdd} size="lg" className="shadow-md">
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Location
      </Button>
    </div>
  );
}
