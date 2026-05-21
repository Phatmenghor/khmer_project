"use client";

import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pb-16 sm:pb-0">
        <Suspense>{children}</Suspense>
      </main>
      <div className="hidden sm:block">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
