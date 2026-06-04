"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-3">
      <div className="text-center space-y-3">
        <p className="text-base font-bold text-muted-foreground/30">404</p>
        <h1 className="text-xs font-semibold">Page Not Found</h1>
        <p className="text-xs text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="flex gap-2 justify-center pt-1.5">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1.5">
            <ArrowLeft className="h-3 w-3" /> Back
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard" className="gap-1.5 flex items-center">
              <Home className="h-3 w-3" /> Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
