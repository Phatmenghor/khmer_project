"use client";

declare global {
  interface Window {
    __cachedBusinessData?: {
      businessName?: string;
      logoBusinessUrl?: string;
      primaryColor?: string;
      taxPercentage?: number;
    };
  }
}

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useCartState } from "@/features/main/store/state/cart-state";
import { useFavoriteState } from "@/features/main/store/state/favorite-state";
import { clearProducts } from "@/features/main/store/slice/public-product-slice";
import { selectBusinessName, selectBusinessLogo, selectBusinessSettingsLoading } from "@/features/business/store/selectors/business-settings-selector";
import { useLogout } from "@/hooks/use-logout";
import { useDebounce } from "@/utils/debounce/debounce";
import { LoginModal } from "../shared/modal/login-modal";
import { RegisterModal } from "../shared/modal/register-modal";
import { PageContainer } from "../shared/common/page-container";

import { NavbarSearch } from "./navbar-search";
import { NavbarAuth } from "./navbar-auth";
import { NavbarCart } from "./navbar-cart";
import { NavbarLinks } from "./navbar-links";
import { NavbarMenu } from "./navbar-menu";

const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Promotions", href: "/promotions" },
  { name: "Categories", href: "/categories" },
  { name: "Brands", href: "/brands" },
];

export function Navbar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const reduxBusinessName = useSelector(selectBusinessName);
  const reduxBusinessLogoUrl = useSelector(selectBusinessLogo);
  const isBusinessLoading = useSelector(selectBusinessSettingsLoading);

  const [cachedBusinessName, setCachedBusinessName] = useState<string | undefined>();
  const [cachedLogoUrl, setCachedLogoUrl] = useState<string | undefined>();

  // Read window cache on mount, on route change, and on bfcache restoration
  useEffect(() => {
    const readWindowCache = () => {
      if (typeof window !== "undefined" && window.__cachedBusinessData) {
        setCachedBusinessName(window.__cachedBusinessData.businessName);
        setCachedLogoUrl(window.__cachedBusinessData.logoBusinessUrl);
      }
    };
    readWindowCache();
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) readWindowCache();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [pathname]);

  const businessName = isBusinessLoading ? "" : (reduxBusinessName || cachedBusinessName || "");
  const businessLogoUrl = isBusinessLoading ? "" : (reduxBusinessLogoUrl || cachedLogoUrl || "");

  const [favoriteAnimating, setFavoriteAnimating] = useState(false);
  const prevFavoriteCount = useRef(favoriteItemCount);

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

  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchRef.current?.focus(), 50);
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigateToHome = () => {
    navigatingRef.current = true;
    setMobileSearchOpen(false);
    dispatch(clearProducts());
    router.push("/");
  };

  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleNavigateToPage = (href: string) => {
    navigatingRef.current = true;
    setMobileSearchOpen(false);
    setSearchQuery("");
    dispatch(clearProducts());
    router.push(href);
  };

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const urlSearchQuery = new URLSearchParams(window.location.search).get("q");
    if (urlSearchQuery) setSearchQuery(urlSearchQuery);
  }, []);

  useEffect(() => {
    if (navigatingRef.current) {
      navigatingRef.current = false;
      return;
    }

    if (!debouncedSearchQuery.trim()) {
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

    if (pathname === "/" && searchQuery === "") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const searchRoute = pathname === "/" ? "/products" : pathname;
    params.set("q", debouncedSearchQuery.trim());
    router.push(`${searchRoute}?${params.toString()}`);
  }, [debouncedSearchQuery, pathname, searchQuery, router]);

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

  const searchPlaceholder =
    pathname === "/products"
      ? "Search products..."
      : pathname === "/categories"
        ? "Search categories..."
        : pathname === "/brands"
          ? "Search brands..."
          : pathname === "/cart"
            ? "Search cart..."
            : "Search...";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm flex items-center">
        <PageContainer className="max-w-8xl w-full">
          {/* Mobile: Search or Navigation */}
          {mobileSearchOpen ? (
            <NavbarSearch
              mobileSearchOpen={mobileSearchOpen}
              onMobileSearchOpen={setMobileSearchOpen}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              searchPlaceholder={searchPlaceholder}
              onSearchSubmit={handleSearchSubmit}
              mobileSearchRef={mobileSearchRef}
            />
          ) : (
            <div className="lg:hidden flex items-center justify-between w-full h-14 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <NavbarMenu
                  open={menuOpen}
                  onOpenChange={setMenuOpen}
                  businessName={businessName}
                  businessLogoUrl={businessLogoUrl}
                  navigationLinks={navigationLinks}
                  pathname={pathname}
                  isAuthenticated={isAuthenticated}
                  fullName={fullName}
                  email={email}
                  profileImage={profileImage}
                  profile={profile}
                  onNavigateHome={handleNavigateToHome}
                  onNavigate={handleNavigateToPage}
                  onLogin={() => setIsLoginModalOpen(true)}
                  onRegister={() => setIsRegisterModalOpen(true)}
                  onLogout={handleLogout}
                />

                {businessName && (
                  <button onClick={handleNavigateToHome} className="flex flex-col gap-0.5 group min-w-0">
                    <span className="text-foreground font-bold text-sm leading-tight line-clamp-1">
                      {businessName}
                    </span>
                    <span className="text-muted-foreground text-xs font-medium">
                      Shop Online
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMobileSearchOpen(true)}
                  className="lg:hidden h-9 w-9 hover:text-primary"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                <NavbarCart
                  cartItemCount={cartItemCount}
                  favoriteItemCount={favoriteItemCount}
                  favoriteAnimating={favoriteAnimating}
                  onFavoritesClick={() => router.push("/favorites")}
                  onCartClick={() => router.push("/cart")}
                  isMobile={true}
                />

                <NavbarAuth
                  isAuthenticated={isAuthenticated}
                  fullName={fullName}
                  email={email}
                  profileImage={profileImage}
                  profile={profile}
                  onLoginClick={() => setIsLoginModalOpen(true)}
                  onLogout={handleLogout}
                  openOnHover={false}
                />
              </div>
            </div>
          )}

          {/* Desktop View */}
          <div className="hidden lg:flex h-full w-full items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              {businessName && (
                <button onClick={handleNavigateToHome} className="flex items-center gap-2 group">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
                      {businessLogoUrl && (
                        <img
                          key={businessLogoUrl}
                          src={businessLogoUrl}
                          alt={businessName}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/image/no-image.png";
                          }}
                        />
                      )}
                    </div>
                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary/20 to-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-foreground font-bold text-sm leading-tight">
                      {businessName}
                    </span>
                    <span className="text-muted-foreground text-xs font-medium">
                      Shop Online
                    </span>
                  </div>
                </button>
              )}

              <NavbarLinks
                navigationLinks={navigationLinks}
                pathname={pathname}
                onNavigateHome={handleNavigateToHome}
                onNavigate={handleNavigateToPage}
              />
            </div>

            <NavbarSearch
              mobileSearchOpen={mobileSearchOpen}
              onMobileSearchOpen={setMobileSearchOpen}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              searchPlaceholder={searchPlaceholder}
              onSearchSubmit={handleSearchSubmit}
              mobileSearchRef={mobileSearchRef}
            />

            <div className="hidden lg:flex items-center gap-2">
              <NavbarCart
                cartItemCount={cartItemCount}
                favoriteItemCount={favoriteItemCount}
                favoriteAnimating={favoriteAnimating}
                onFavoritesClick={() => router.push("/favorites")}
                onCartClick={() => router.push("/cart")}
              />

              <NavbarAuth
                isAuthenticated={isAuthenticated}
                fullName={fullName}
                email={email}
                profileImage={profileImage}
                profile={profile}
                onLoginClick={() => setIsLoginModalOpen(true)}
                onLogout={handleLogout}
                openOnHover={true}
              />
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
