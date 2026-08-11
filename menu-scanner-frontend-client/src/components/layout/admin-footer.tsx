"use client";

import { Heart, Zap } from "lucide-react";

export function AdminFooter() {
  return (
    <footer className="mt-auto border-t border-primary/10 bg-gradient-to-r from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-3 py-3.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
          <Zap className="h-3 w-3 text-primary fill-primary" />
          <span>Powered by</span>
          <span className="font-bold text-primary">Menu Scanner</span>
          <span>· Made with</span>
          <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          <span>by the Menu Scanner Team</span>
        </div>
      </div>
    </footer>
  );
}
