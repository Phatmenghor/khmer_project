/**
 * Admin Dashboard Footer Component
 * Simple footer with copyright information for admin pages
 */

"use client";

import { Heart } from "lucide-react";

export function AdminFooter() {

  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-6">
        {/* Made with love */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          <span>by the Menu Scanner Team</span>
        </div>
      </div>
    </footer>
  );
}
