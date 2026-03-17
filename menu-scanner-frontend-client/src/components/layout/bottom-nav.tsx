"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ShoppingBag,
  LayoutGrid,
  ShoppingCart,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useState } from "react";
import { LoginModal } from "../shared/modal/login-modal";

const tabs = [
  { name: "Home", href: "/", icon: Home },
  { name: "Shop", href: "/products", icon: ShoppingBag },
  { name: "Categories", href: "/categories", icon: LayoutGrid },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Profile", href: "/profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems: cartCount } = useCartState();
  const { isAuthenticated } = useAuthState();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleProtectedTab = (href: string) => {
    if ((href === "/cart" || href === "/profile") && !isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/95 backdrop-blur-lg border-t border-border/60 shadow-[0_-1px_12px_0_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch h-16">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            const Icon = tab.icon;
            const isCart = tab.href === "/cart";
            const needsAuth = tab.href === "/cart" || tab.href === "/profile";

            return (
              <button
                key={tab.name}
                type="button"
                onClick={() =>
                  needsAuth
                    ? handleProtectedTab(tab.href)
                    : router.push(tab.href)
                }
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-150 active:opacity-70",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-150",
                      active && "scale-110"
                    )}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                  {isCart && cartCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-4 min-w-[16px] px-0.5 flex items-center justify-center text-[10px] leading-none"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </Badge>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.name}
                </span>
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
        {/* Safe area spacer for devices with home indicator */}
        <div className="h-safe-bottom bg-background" />
      </nav>

      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </>
  );
}
