"use client";

import NextTopLoader from "nextjs-toploader";

export default function PageProgressBar() {
  return (
    <NextTopLoader
      color="hsl(var(--primary))"
      height={3}
      showSpinner={false}
      speed={200}
      crawlSpeed={200}
      easing="ease"
      shadow={false}
    />
  );
}
