import dynamic from "next/dynamic";

export const NavbarLazy = dynamic(
  () => import("./navbar").then((mod) => ({ default: mod.Navbar })),
  {
    loading: () => null,
  }
);
