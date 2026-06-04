


"use client";

import { Heart } from "lucide-react";

export function AdminFooter() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-3 py-4">
        {}
        <div className="flex items-center gap-1 text-xs text-muted-foreground justify-center">
          <span>Made with</span>
          <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          <span>by the Menu Scanner Team</span>
        </div>
      </div>
    </footer>
  );
}
