/**
 * Navbar Component
 * Features:
 * - Responsive design (mobile, tablet, desktop)
 * - Mobile search overlay with expandable input
 * - Dynamic business logo and name from Redux
 * - Shopping cart and favorites with badge counters
 * - User authentication dropdown menu
 * - Real-time search with debouncing
 * - URL parameter synchronization
 * - Smooth animations and transitions
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  ShoppingCart,
  X,
  User,
  LogOut,
  UserCircle,
  Package,
  Heart,
  MapPin,
  CarTaxiFront,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "../shared/button/custom-button";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useFavoriteState } from "@/redux/features/main/store/state/favorite-state";
import { clearProducts } from "@/redux/features/main/store/slice/public-product-slice";
import { selectBusinessName, selectBusinessLogo } from "@/redux/features/business/store/selectors/business-settings-selector";
import { businessSettingsStorage } from "@/utils/storage/business-settings-storage";
import { showToast } from "@/components/shared/common/show-toast";
import { useLogout } from "@/redux/store/use-logout";
import { useDebounce } from "@/utils/debounce/debounce";
import { LoginModal } from "../shared/modal/login-modal";
import { RegisterModal } from "../shared/modal/register-modal";
import { CustomDropdownMenu } from "../shared/common/custom-dropdown-menu";
import { PageContainer } from "../shared/common/page-container";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/app-routes/routes";

/** Main navigation links */
const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Promotions", href: "/promotions" },
  { name: "Categories", href: "/categories" },
  { name: "Brands", href: "/brands" },
];

export function Navbar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const navigatingRef = useRef(false);

  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const { isAuthenticated, profile, fullName, email, profileImage } =
    useAuthState();
  const { totalItems: cartItemCount } = useCartState();
  const { totalItems: favoriteItemCount } = useFavoriteState();
  const { logout: handleLogout } = useLogout();

  const businessName = useSelector(selectBusinessName);
  const businessLogoUrl = useSelector(selectBusinessLogo);

  // Get business settings from cache for primary color
  const cachedSettings = businessSettingsStorage.getCached();
  const primaryColor = cachedSettings?.data?.primaryColor || "#3b82f6";

  const [favoriteAnimating, setFavoriteAnimating] = useState(false);
  const prevFavoriteCount = useRef(favoriteItemCount);

  /**
   * Animate heart icon when favorite count changes
   * Shows slide-down animation for 300ms
   */
  useEffect(() => {
    if (
      prevFavoriteCount.current !== favoriteItemCount &&
      favoriteItemCount > 0
    ) {
      setFavoriteAnimating(true);
      const timer = setTimeout(() => setFavoriteAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    prevFavoriteCount.current = favoriteItemCount;
  }, [favoriteItemCount]);

  /**
   * Auto-focus mobile search input when search overlay opens
   * Improves mobile UX for quick search
   */
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchRef.current?.focus(), 50);
    }
  }, [mobileSearchOpen]);

  /**
   * Clear search when navigating to home page
   * Happens AFTER navigation completes to avoid API calls
   */
  useEffect(() => {
    if (pathname === "/") {
      setSearchQuery("");
    }
  }, [pathname]);


  /**
   * Navigate to home and clear products cache
   * Don't clear search here - it triggers API calls
   * Search will be cleared by pathname change effect
   */
  const handleNavigateToHome = () => {
    navigatingRef.current = true; // Flag that we're navigating
    setMobileSearchOpen(false); // Close mobile search overlay
    dispatch(clearProducts()); // Clear product search results
    router.push("/"); // Navigate to home (search cleared in effect below)
  };

  /**
   * Switch from login modal to register modal
   * Close login and open register
   */
  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  /**
   * Switch from register modal to login modal
   * Close register and open login
   */
  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  /**
   * Navigate to another page and clear search
   * Used for Products, Promotions, Categories, Brands links
   */
  const handleNavigateToPage = (href: string) => {
    navigatingRef.current = true; // Flag that we're navigating (prevent search effect interference)
    setMobileSearchOpen(false); // Close mobile search overlay
    setSearchQuery(""); // Clear search input immediately
    dispatch(clearProducts()); // Clear product search results
    router.push(href); // Navigate to page
  };

  // Debounce search query to reduce URL updates (500ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  /**
   * Restore search query from URL on mount
   * Allows users to refresh with search query intact
   */
  useEffect(() => {
    const urlSearchQuery = new URLSearchParams(window.location.search).get("q");
    if (urlSearchQuery) setSearchQuery(urlSearchQuery);
  }, []);

  /**
   * Sync search query to URL as user types (with debounce)
   * - Empty query: removes from URL
   * - Search on home page: redirect to /products with search
   * - Search on other page: search within current page
   * - Skip if user is navigating (to prevent interference)
   */
  useEffect(() => {
    // Skip if we're in the middle of navigation
    if (navigatingRef.current) {
      navigatingRef.current = false; // Reset flag
      return;
    }

    if (!debouncedSearchQuery.trim()) {
      // Clear search from URL (only if not on home page)
      if (pathname !== "/") {
        const currentParams = new URLSearchParams(window.location.search);
        if (currentParams.has("q")) {
          currentParams.delete("q");
          const newUrl = currentParams.toString()
            ? `${pathname}?${currentParams.toString()}`
            : pathname;
          router.push(newUrl);
        }
      }
      return;
    }

    // Don't redirect if user just cleared search (searchQuery is empty but debouncedSearchQuery still has value)
    // This prevents redirect loop when clicking Home from products with search
    if (pathname === "/" && searchQuery === "") {
      return;
    }

    // Add/update search in URL
    const params = new URLSearchParams(window.location.search);
    const searchRoute = pathname === "/" ? "/products" : pathname;
    params.set("q", debouncedSearchQuery.trim());
    router.push(`${searchRoute}?${params.toString()}`);
  }, [debouncedSearchQuery, pathname, searchQuery, router]);

  /**
   * Handle search form submission
   * - Triggered by Enter key
   * - Closes mobile search overlay after search
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams(window.location.search);
      const searchRoute = pathname === "/" ? "/products" : pathname;
      params.set("q", searchQuery.trim());
      router.push(`${searchRoute}?${params.toString()}`);
      setMobileSearchOpen(false);
    }
  };

  const dropdownSections = [
    {
      items: [
        {
          label: "My Profile",
          icon: <UserCircle className="h-4 w-4" />,
          onClick: () => router.push("/profile"),
        },
        {
          label: "Location",
          icon: <MapPin className="h-4 w-4" />,
          onClick: () => router.push(ROUTES.LOCATION),
        },
      ],
    },
    {
      label: "Shopping",
      items: [
        {
          label: "Cart",
          icon: <CarTaxiFront className="h-4 w-4" />,
          onClick: () => router.push("/cart"),
        },
        {
          label: "Favorites",
          icon: <Heart className="h-4 w-4" />,
          onClick: () => router.push("/favorites"),
        },
        {
          label: "My Orders",
          icon: <Package className="h-4 w-4" />,
          onClick: () => router.push("/orders"),
        },
      ],
    },
    {
      items: [
        {
          label: "Logout",
          icon: <LogOut className="h-4 w-4" />,
          onClick: handleLogout,
          variant: "destructive" as const,
        },
      ],
    },
  ];

  const dropdownHeader = (
    <div className="flex items-center gap-3">
      <CustomAvatar
        imageUrl={profileImage || profile?.profileImageUrl}
        name={fullName || profile?.fullName || "User"}
        size="lg"
      />
      <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
        <p className="text-sm font-semibold line-clamp-1">
          {fullName || profile?.fullName || "User"}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {email || profile?.email || ""}
        </p>
      </div>
    </div>
  );

  const searchPlaceholder =
    pathname === "/products"
      ? "Search products..."
      : pathname === "/categories"
        ? "Search categories..."
        : pathname === "/brands"
          ? "Search brands..."
          : "Search...";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm flex items-center">
        <PageContainer className="max-w-8xl w-full">
          {/* ── Mobile: expanded search overlay ── */}
          {mobileSearchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="sm:hidden flex items-center gap-2 w-full h-14"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={mobileSearchRef}
                  type="search"
                  placeholder={searchPlaceholder}
                  className="pl-10 w-full h-10 bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setMobileSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </form>
          ) : (
            /* ── Mobile: compact top bar ── */
            <div className="sm:hidden flex items-center justify-between w-full h-14 gap-2">
              <button onClick={handleNavigateToHome} className="flex items-center gap-2 shrink-0">
                <div
                  className="relative w-8 h-8 rounded-lg flex items-center justify-center shadow-sm overflow-hidden"
                  style={{ backgroundColor: primaryColor }}
                >
                  {businessLogoUrl ? (
                    <img
                      src={businessLogoUrl}
                      alt={businessName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/no-image.png";
                      }}
                    />
                  ) : (
                    <Image
                      src="/assets/favicon.ico"
                      alt="Logo"
                      width={20}
                      height={20}
                      className="rounded object-contain"
                      priority
                    />
                  )}
                </div>
                <span className="font-bold text-sm text-foreground">
                  {businessName}
                </span>
              </button>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setMobileSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10"
                  onClick={() => router.push("/favorites")}
                >
                  <Heart className="h-7 w-7" />
                  {favoriteItemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className={cn(
                        "absolute -top-1 -right-1 h-5 min-w-[20px] max-w-[28px] px-1 flex items-center justify-center text-[11px] font-semibold leading-none transition-transform duration-300",
                        favoriteAnimating && "animate-slide-down",
                      )}
                    >
                      {favoriteItemCount}
                    </Badge>
                  )}
                </Button>
                {isAuthenticated ? (
                  <CustomDropdownMenu
                    trigger={
                      <div className="h-9 w-9 flex items-center justify-center rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
                        <CustomAvatar
                          imageUrl={profileImage || profile?.profileImageUrl}
                          name={fullName || profile?.fullName || "User"}
                          size="sm"
                        />
                      </div>
                    }
                    header={dropdownHeader}
                    sections={dropdownSections}
                    align="right"
                    openOnHover={false}
                    hoverDelay={200}
                  />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ── Desktop top bar ── */}
          <div className="hidden sm:flex h-full w-full items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <button onClick={handleNavigateToHome} className="flex items-center gap-2 group">
                <div
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
                  style={{ backgroundColor: primaryColor }}
                >
                  {businessLogoUrl ? (
                    <img
                      src={businessLogoUrl}
                      alt={businessName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/no-image.png";
                      }}
                    />
                  ) : (
                    <Image
                      src="/assets/favicon.ico"
                      alt="Logo"
                      width={24}
                      height={24}
                      className="rounded object-contain"
                      priority
                    />
                  )}
                </div>
                <div className="hidden md:flex flex-col">
                  <span
                    className="font-bold text-sm leading-tight"
                    style={{ color: primaryColor }}
                  >
                    {businessName}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium">
                    Shop Online
                  </span>
                </div>
              </button>

              <div className="hidden lg:flex items-center gap-1">
                {navigationLinks.map((link) => {
                  const active =
                    pathname === link.href ||
                    (link.href === "/products" &&
                      pathname.startsWith("/products"));

                  // Special handler for Home link
                  if (link.name === "Home") {
                    return (
                      <Button
                        key={link.name}
                        variant="ghost"
                        className={cn(
                          "text-foreground hover:text-primary hover:bg-primary/10 relative",
                          active &&
                            "text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-0.5 after:bg-primary after:rounded-full",
                        )}
                        onClick={handleNavigateToHome}
                      >
                        {link.name}
                      </Button>
                    );
                  }

                  // Special handler for other navigation links to clear search
                  return (
                    <Button
                      key={link.name}
                      variant="ghost"
                      className={cn(
                        "text-foreground hover:text-primary hover:bg-primary/10 relative",
                        active &&
                          "text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-0.5 after:bg-primary after:rounded-full",
                      )}
                      onClick={() => handleNavigateToPage(link.href)}
                    >
                      {link.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-1 max-w-xl"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="pl-10 w-full bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <CustomButton
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 hover:text-primary flex items-center justify-center"
                onClick={() => router.push("/favorites")}
              >
                <Heart className="h-7 w-7" />
                {favoriteItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      "absolute -top-1 -right-1 h-5 min-w-[20px] max-w-[28px] px-1 flex items-center justify-center text-xs font-semibold leading-none transition-transform duration-300",
                      favoriteAnimating && "animate-slide-down",
                    )}
                  >
                    {favoriteItemCount}
                  </Badge>
                )}
              </CustomButton>

              <CustomButton
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 hover:text-primary flex items-center justify-center"
                onClick={() => router.push("/cart")}
              >
                <ShoppingCart className="h-7 w-7" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 min-w-[20px] max-w-[28px] h-5 px-1 flex items-center justify-center text-xs font-semibold leading-none"
                  >
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </Badge>
                )}
              </CustomButton>

              {isAuthenticated ? (
                <CustomDropdownMenu
                  trigger={
                    <div className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
                      <CustomAvatar
                        imageUrl={profileImage || profile?.profileImageUrl}
                        name={fullName || profile?.fullName || "User"}
                        size="md"
                      />
                    </div>
                  }
                  header={dropdownHeader}
                  sections={dropdownSections}
                  align="right"
                  openOnHover={true}
                  hoverDelay={200}
                />
              ) : (
                <CustomButton
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <User className="h-5 w-5" />
                </CustomButton>
              )}
            </div>
          </div>
        </PageContainer>
      </nav>

      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        onRegisterClick={handleSwitchToRegister}
      />
      <RegisterModal
        open={isRegisterModalOpen}
        onOpenChange={setIsRegisterModalOpen}
        onLoginClick={handleSwitchToLogin}
      />
    </>
  );
}
