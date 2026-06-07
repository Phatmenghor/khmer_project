// Landing Page Configuration — describes the actual Emenu Cambodia
// platform features. Pricing plans all share the same feature list
// because every plan unlocks every feature; the only thing that
// changes between plans is the subscription duration.

// All plans grant access to the same feature set. Keep this list in
// sync with what the product actually ships — no fictional features.
const ALL_PLATFORM_FEATURES = [
  "QR code digital menu — public storefront for products & promotions",
  "Real-time order management with status workflow",
  "Stock management — products, sizes, low-stock alerts",
  "Sales analytics dashboard — revenue, top products, hourly sales",
  "Business profile page — hours, services, team, gallery, reviews",
  "Promotions & discounts — single product or bulk",
  "Brand & category management",
  "Multiple branches / locations supported",
  "Staff accounts with role-based permissions",
  "Telegram login + order/stock notifications",
  "Customer loyalty (returning customer tracking)",
  "Multi-currency support with exchange rates",
  "Branded business settings — logo, primary color, contact info",
  "Real-time updates via WebSocket",
  "Mobile-responsive — works on any device, no app to install",
];

export const LANDING_CONFIG = {
  // Navigation
  nav: {
    logo: "Emenu Cambodia",
    logoUrl: "/logo.png",
  },

  // Hero Section
  hero: {
    tag: "All-in-one digital menu + storefront + POS",
    headline: "Run your whole business from one dashboard",
    subheadline:
      "Emenu Cambodia is a complete platform for restaurants and retail shops: a public QR storefront for your customers, a real-time order system for your staff, stock and promotion management, branded business profiles with reviews, and a live analytics dashboard — all in a single product, with full access on every plan.",
    primaryCTA: "Start Free",
    secondaryCTA: "See How It Works",
    features: [
      "Free to start — no credit card",
      "All features on every plan",
      "Live in minutes, not weeks",
      "Real-time orders & stock",
      "Telegram + WebSocket notifications",
      "Mobile-responsive storefront",
    ],
  },

  // Features Section — what the product actually includes
  features: {
    subtitle:
      "Everything you need to run your business online — included in every plan.",
    items: [
      {
        icon: "QrCode",
        title: "Public QR Storefront",
        description:
          "Give every customer a link or QR code that opens your live product catalog with categories, brands, prices, sale tags, and your business profile. Updates are instant — no app downloads, no reprints.",
      },
      {
        icon: "ShoppingCart",
        title: "Real-Time Order Management",
        description:
          "Orders arrive in your dashboard the moment customers place them. Move them through your workflow (pending → confirmed → completed), see itemized details, and notify staff over Telegram automatically.",
      },
      {
        icon: "Package",
        title: "Stock & Product Management",
        description:
          "Manage products, sizes, brands, and categories with photos and rich descriptions. Track stock levels per size, see low-stock and out-of-stock items at a glance, and toggle availability without rebuilding your menu.",
      },
      {
        icon: "Tag",
        title: "Promotions & Discounts",
        description:
          "Run single-product or bulk promotions. Active promotions appear automatically on the public /promotions page so customers see the deal alongside the product.",
      },
      {
        icon: "Users",
        title: "Staff & Role Management",
        description:
          "Invite unlimited staff and assign roles with granular permissions. Audit who did what with login history and action logs. Every staff member sees only what their role allows.",
      },
      {
        icon: "Building2",
        title: "Branded Business Profile",
        description:
          "A dedicated profile page for each business — logo, cover, hours, services, gallery, team members, contact channels, and customer reviews. Configurable primary color brands the whole storefront.",
      },
      {
        icon: "BarChart3",
        title: "Live Analytics Dashboard",
        description:
          "Today's KPIs at a glance: total sales, total orders, average order value, return rate, low stock, system alerts. Drill into hourly sales, top products, payment methods, customer stats, and branch performance.",
      },
      {
        icon: "Zap",
        title: "Telegram & Real-Time Notifications",
        description:
          "Connect a Telegram group and the platform pushes new-order and stock alerts in real time. Built on WebSocket so the dashboard, storefront, and staff devices stay in sync without refresh.",
      },
    ],
  },

  // Stats Section
  stats: {
    subtitle:
      "Built in Cambodia for restaurants, cafés, and retail shops everywhere.",
    items: [
      {
        number: "1",
        label: "Unified Platform",
        description: "Storefront, POS, stock, and analytics in one product",
      },
      {
        number: "All",
        label: "Features On Every Plan",
        description: "No tiers, no upgrades to unlock features",
      },
      {
        number: "< 1hr",
        label: "Average Setup Time",
        description: "Sign up, add products, share your QR — done",
      },
      {
        number: "24/7",
        label: "Support",
        description: "Email + Telegram support whenever you need help",
      },
    ],
  },

  // Founder Section
  founder: {
    name: "Phat Menghor",
    title: "Founder & Full-Stack Software Engineer",
    image: "/images/hero/founder.jpg",
    bio: "A passionate software engineer from Cambodia who wanted to give local food and retail businesses the same kind of digital tools the big chains use — without the enterprise price tag.",
    story:
      "Emenu Cambodia started as a side project after watching too many restaurants struggle with paper menus, lost orders, and spreadsheets for stock. The goal was to build one platform that handled the storefront, the orders, the stock, and the analytics — and to give every customer the same complete feature set instead of locking things behind tiers.",
    vision:
      "Help every small and medium business go digital with a single tool they can actually afford and actually use. Every plan should unlock every feature — the only thing that changes is how long you subscribe.",
    highlights: [
      "Built in Cambodia 🇰🇭 for the world 🌍",
      "Full-stack platform — frontend, backend, and infrastructure",
      "Real-time order + stock sync via WebSocket",
      "Same feature set on every plan, no tiered lock-out",
    ],
    contact: {
      email: "phatmenghor7@gmail.com",
      location: "Cambodia 🇰🇭",
      telegram: "https://t.me/Hor_HOrz",
      social: "Hor_HOrz",
    },
  },

  // Pricing Section — every plan shares the same feature list.
  pricing: {
    title: "Simple Pricing",
    subtitle: "Start free, upgrade anytime as your business grows.",
    note: "Every plan unlocks every feature. You only choose how long you subscribe.",
    plans: [
      {
        name: "1 Week",
        price: "$0",
        period: "/ 7 days",
        description: "Try the full platform — every feature unlocked.",
        durationType: "WEEKLY",
        features: ALL_PLATFORM_FEATURES,
      },
      {
        name: "1 Month",
        price: "$0",
        period: "/ 30 days",
        description: "Full platform access for a month, completely free.",
        durationType: "MONTHLY",
        features: ALL_PLATFORM_FEATURES,
        highlighted: true,
      },
      {
        name: "1 Year",
        price: "$0",
        period: "/ 365 days",
        description: "Best value — same complete feature set, year-long.",
        durationType: "YEARLY",
        features: ALL_PLATFORM_FEATURES,
      },
    ],
  },

  // Business Types
  businessTypes: {
    subtitle: "Built for restaurants, cafés, and retail businesses of any size.",
    types: [
      { name: "Fine Dining Restaurants", icon: "🍽️" },
      { name: "Casual Restaurants", icon: "🥘" },
      { name: "Fast Casual & QSR", icon: "🌮" },
      { name: "Cafés & Espresso Bars", icon: "☕" },
      { name: "Bakeries & Pastry Shops", icon: "🍰" },
      { name: "Pizza & Sandwich Shops", icon: "🍕" },
      { name: "Food Courts & Malls", icon: "🍲" },
      { name: "Bars, Lounges & Clubs", icon: "🍹" },
      { name: "Cloud Kitchens & Delivery", icon: "🛵" },
      { name: "Food Trucks & Carts", icon: "🚚" },
      { name: "Retail Shops", icon: "🛒" },
      { name: "Juice & Smoothie Bars", icon: "🥤" },
    ],
  },

  // Security Section
  security: {
    subtitle:
      "Your business data and customer information stay safe and yours.",
    features: [
      {
        icon: "Shield",
        title: "Token-Based Authentication",
        description:
          "JWT access + refresh tokens with auto-rotation, separate token scopes per persona (customer, staff, platform).",
      },
      {
        icon: "Lock",
        title: "Role-Based Access Control",
        description:
          "Every staff account is bound to a role. Pages and API calls check the role before responding.",
      },
      {
        icon: "Clock",
        title: "Audit Logs",
        description:
          "Every privileged action is logged with timestamp, user, and IP so you can see who did what and when.",
      },
      {
        icon: "TrendingUp",
        title: "Encrypted in Transit",
        description:
          "All traffic over HTTPS/TLS. WebSocket connections also require an authenticated session.",
      },
    ],
    certifications: [
      "Per-business data isolation",
      "GDPR-aware design",
      "Regular backups",
      "Telegram + email security alerts",
      "Session expiry & refresh",
      "WebSocket auth on every connect",
    ],
  },

  // Support Section
  support: {
    subtitle: "Real people, fast replies, in the channels you already use.",
    features: [
      {
        title: "Email & Telegram Support",
        description:
          "Direct support on Telegram and email — usually replied to within hours, not days.",
      },
      {
        title: "Setup Help",
        description:
          "We'll help you onboard the first time — set up your products, your team, and your business profile.",
      },
      {
        title: "Documentation",
        description:
          "Step-by-step guides covering products, stock, promotions, staff roles, and dashboard.",
      },
      {
        title: "Bug Fixes & Updates",
        description:
          "Updates ship continuously and are free for everyone — no extra cost, no plan upgrade required.",
      },
    ],
  },

  // CTA Section
  cta: {
    subtitle:
      "Set up your storefront, add your products, and share your QR — your customers can order in minutes, and you'll see every order in real time from your dashboard.",
    primaryCTA: "Start Free",
    secondaryCTA: "Talk to the Founder",
    disclaimer:
      "✓ No credit card  •  ✓ All features on every plan  •  ✓ Cancel anytime",
  },

  // Footer
  footer: {
    company: "Emenu Cambodia",
    tagline:
      "Digital storefront, real-time orders, stock, and analytics — one platform for your whole business.",
    description:
      "Every plan unlocks every feature. You only choose how long you subscribe.",
    contact: {
      email: "phatmenghor7@gmail.com",
      phone: "+855 ## ### ###",
      location: "Cambodia 🇰🇭",
    },
    links: {
      Product: ["Features", "Pricing", "How It Works"],
      Company: ["About", "Founder", "Contact"],
      Resources: ["Documentation", "FAQ", "Status"],
      Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
    },
    social: "Made with ❤️ in Cambodia",
  },
};

export type LandingConfig = typeof LANDING_CONFIG;
