"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";

export default function HRRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.ADMIN.HR_ATTENDANCE);
  }, [router]);

  return (
    <div className="flex h-64 w-full items-center justify-center text-xs text-muted-foreground font-medium">
      Redirecting to Attendance Logs...
    </div>
  );
}
