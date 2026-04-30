import dynamic from "next/dynamic";

export const FooterLazy = dynamic(
  () => import("./footer").then((mod) => ({ default: mod.Footer })),
  {
    loading: () => null,
  }
);
