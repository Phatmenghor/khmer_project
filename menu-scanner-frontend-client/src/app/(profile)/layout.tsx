"use client";

import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">
        <Suspense>{children}</Suspense>
      </main>
      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
}
