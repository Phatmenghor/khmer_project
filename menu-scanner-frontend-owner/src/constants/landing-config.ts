// Landing Page Configuration - Easy to Update
export const LANDING_CONFIG = {
  // Navigation
  nav: {
    logo: "EMenu Platform",
    logoUrl: "/logo.png",
  },

  // Hero Section
  hero: {
    tag: "Professional SaaS for Global Food & Hospitality",
    headline: "Transform Your Restaurant Into a Digital Powerhouse",
    subheadline: "Enterprise-grade platform with QR menus, integrated POS, real-time order management, customer loyalty programs, advanced analytics, multi-language support, and global payment processing. Everything restaurant owners need to compete globally and scale their business.",
    primaryCTA: "Start Your Free Trial",
    secondaryCTA: "Schedule Demo",
    features: [
      "30-day free trial - Full access",
      "No credit card needed",
      "All features included",
      "24/7 global support",
      "Auto-scaling infrastructure",
      "GDPR & compliance ready"
    ],
  },

  // Features Section
  features: {
    subtitle: "Powerful features designed for modern food businesses",
    items: [
      {
        icon: "QrCode",
        title: "QR Code Digital Menu System",
        description: "Generate unique QR codes for every table, location, and marketing material. Customers scan instantly to access your full menu with photos, descriptions, and prices. Update items and prices in real-time without reprinting. Mobile-responsive design works perfectly on all devices. No app download required."
      },
      {
        icon: "ShoppingCart",
        title: "Integrated POS & Order Management",
        description: "Professional point-of-sale system handles dine-in, takeout, and delivery orders seamlessly. Real-time order tracking, kitchen display system integration, table management, and staff coordination. Complete inventory management with stock tracking. Order status notifications keep customers informed. Supports unlimited staff accounts with role-based permissions."
      },
      {
        icon: "CreditCard",
        title: "Multiple Payment Methods & Processing",
        description: "Accept payments via credit cards, mobile wallets, bank transfers, and cash. Secure payment processing with PCI compliance. Instant payment confirmation and automated invoicing. Integration with major payment gateways worldwide. Fraud detection and chargeback protection. Settlement reports and financial reconciliation."
      },
      {
        icon: "Users",
        title: "Staff & Team Management System",
        description: "Create unlimited staff accounts with granular role-based permissions. Control who can access menus, orders, analytics, and settings. Track staff performance, login history, and action audit logs for complete transparency. Schedule management and shift planning features. Commission tracking for delivery staff and managers."
      },
      {
        icon: "Trophy",
        title: "Advanced Customer Loyalty & Rewards",
        description: "Build repeat business with automated loyalty program. Customers earn points with every purchase. Automatic tier upgrades (Bronze to VIP) unlock exclusive benefits and discounts. Drive customer retention and increase lifetime value. Redemption management with flexible reward options. Loyalty analytics showing program ROI."
      },
      {
        icon: "Zap",
        title: "Real-Time Notifications & Communication",
        description: "Instant notifications via email, SMS, and Telegram. Customers receive order confirmations and status updates. Staff gets real-time alerts for new orders, kitchen items, and customer requests. Integrated messaging system for customer support. Bulk messaging for promotions and announcements. Notification scheduling and personalization."
      },
      {
        icon: "BarChart3",
        title: "Advanced Analytics & Business Intelligence",
        description: "Comprehensive dashboards showing sales trends, popular items, peak hours, and revenue by category. Customer insights including repeat rates and lifetime value. Export reports in multiple formats (PDF, Excel, CSV). Predictive analytics for demand forecasting. Competitive benchmarking against industry averages. Real-time dashboards with drill-down capabilities."
      },
      {
        icon: "Lock",
        title: "Enterprise-Grade Security & Compliance",
        description: "Bank-level encryption for all data in transit and at rest. Two-factor authentication, password policies, and session management. Complete audit logs of every action with IP tracking. GDPR, CCPA, and data privacy compliance. Regular security audits and penetration testing. DDoS protection and bot mitigation. 99.99% uptime guarantee with redundant infrastructure."
      }
    ]
  },

  // Stats Section
  stats: {
    subtitle: "Real results from real businesses using EMenu Platform",
    items: [
      { number: "500+", label: "Businesses Active", description: "Growing daily across all continents" },
      { number: "50,000+", label: "Orders Processed", description: "Successfully delivered monthly" },
      { number: "99.9%", label: "Uptime Guarantee", description: "Reliable service you can depend on" },
      { number: "< 1hr", label: "Average Setup Time", description: "Get started almost instantly" }
    ]
  },

  // Founder Section
  founder: {
    name: "Phat Menghor",
    title: "Founder & Chief Technology Officer",
    image: "/images/founder.jpg", // Add your photo here
    bio: "Full-stack software engineer and architect with 10+ years of expertise in enterprise SaaS platforms, distributed systems, and restaurant technology. Created EMenu Platform to solve the critical need for affordable, professional digital infrastructure for food businesses worldwide.",
    vision: "Our mission is to empower food businesses of all sizes across the globe to compete digitally, streamline operations, and grow their customer base through modern technology that's affordable and easy to use.",
    expertise: [
      "Enterprise Spring Boot & Java Architecture",
      "React/Next.js & TypeScript Frontend Development",
      "PostgreSQL & Advanced Database Optimization",
      "Docker, Kubernetes & Cloud Infrastructure",
      "JWT, OAuth & Enterprise Security",
      "Real-time Systems & WebSocket Technology",
      "Payment Gateway Integration & Processing",
      "Multi-tenant SaaS Architecture",
      "API Design & REST/GraphQL",
      "DevOps & CI/CD Pipelines"
    ],
    contact: {
      email: "support@emenu-platform.com",
      location: "Global 🌍"
    }
  },

  // Pricing Section
  pricing: {
    subtitle: "Pay only for what you need. Upgrade anytime as your business grows.",
    plans: [
      {
        name: "Free Trial",
        price: "$0",
        period: "30 days full access",
        description: "Perfect to test all features with no commitment",
        features: [
          "1 staff member account",
          "10 menu items",
          "2 table management",
          "Basic analytics dashboard",
          "Email notifications",
          "QR code menu",
          "Order management",
          "Email support",
          "Mobile responsive"
        ]
      },
      {
        name: "Basic",
        price: "$29.99",
        period: "/month",
        description: "Ideal for small cafes and restaurants",
        features: [
          "3 staff member accounts",
          "50 menu items",
          "10 table management",
          "Advanced analytics & reports",
          "Customer loyalty program",
          "Telegram bot notifications",
          "Priority email support",
          "Order status tracking",
          "Payment processing",
          "Custom branding options"
        ],
        highlighted: true
      },
      {
        name: "Professional",
        price: "$79.99",
        period: "/month",
        description: "Best for growing restaurants",
        features: [
          "10 staff member accounts",
          "200 menu items",
          "25 table management",
          "Complete analytics suite with exports",
          "Advanced loyalty features",
          "Telegram & email integration",
          "24/7 priority email & phone support",
          "API access for integrations",
          "Delivery partner integration",
          "Custom branded mobile app",
          "Advanced reporting & forecasting",
          "Daily automatic backups"
        ]
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "tailored pricing",
        description: "For large chains and franchises",
        features: [
          "Unlimited staff accounts",
          "Unlimited menu items",
          "Unlimited table management",
          "Dedicated account manager",
          "Custom feature development",
          "White-label solutions",
          "Multi-location management",
          "Advanced integrations",
          "24/7 dedicated support",
          "Training for entire team",
          "SLA guarantee",
          "Custom API endpoints"
        ]
      }
    ]
  },

  // Business Types
  businessTypes: {
    subtitle: "From small cafes to large restaurant chains",
    types: [
      { name: "Fine Dining Restaurants", icon: "🍽️" },
      { name: "Casual Restaurants", icon: "🥘" },
      { name: "Fast Casual & QSR", icon: "🌮" },
      { name: "Cafes & Espresso Bars", icon: "☕" },
      { name: "Bakeries & Pastry Shops", icon: "🍰" },
      { name: "Pizza & Sandwich Shops", icon: "🍕" },
      { name: "Food Courts & Malls", icon: "🍲" },
      { name: "Bars, Lounges & Clubs", icon: "🍹" },
      { name: "Cloud Kitchens & Delivery", icon: "🛵" },
      { name: "Food Trucks & Carts", icon: "🚚" },
      { name: "Catering & Event Services", icon: "🍴" },
      { name: "Juice & Smoothie Bars", icon: "🥤" }
    ]
  },

  // Security Section
  security: {
    subtitle: "Your business data and customer information protected with bank-level security",
    features: [
      {
        icon: "Shield",
        title: "End-to-End Encryption",
        description: "All data encrypted in transit using TLS 1.3 and at rest using AES-256 encryption"
      },
      {
        icon: "Lock",
        title: "Advanced Authentication",
        description: "JWT token-based authentication with optional 2FA, RBAC, and automatic session timeout"
      },
      {
        icon: "Clock",
        title: "Complete Audit Logging",
        description: "Every action logged with timestamp, user ID, IP address for full transparency"
      },
      {
        icon: "TrendingUp",
        title: "Compliance & Privacy",
        description: "GDPR and CCPA compliant with data processing agreements and privacy controls"
      }
    ],
    certifications: [
      "ISO 27001 Information Security Management",
      "GDPR & CCPA Compliant",
      "SOC 2 Type II Certified",
      "PCI DSS Compliant",
      "Regular Third-Party Security Audits",
      "DDoS & Bot Protection",
      "24/7 Security Monitoring",
      "Automated Threat Detection"
    ]
  },

  // Support Section
  support: {
    subtitle: "We're committed to your success",
    features: [
      {
        title: "24/7 Multilingual Support",
        description: "Email, phone, chat, and Telegram support available 24/7/365 in multiple languages"
      },
      {
        title: "Onboarding & Setup",
        description: "Dedicated specialist helps set up your menu, staff, and configuration with video training"
      },
      {
        title: "Comprehensive Documentation",
        description: "Detailed guides, FAQ, troubleshooting articles, and best practices knowledge base"
      },
      {
        title: "Live Training Sessions",
        description: "Scheduled group training and one-on-one sessions with recordings for future reference"
      },
      {
        title: "Integration Support",
        description: "Integrations with payment gateways, delivery platforms, and accounting software"
      },
      {
        title: "Mobile Apps",
        description: "Native iOS and Android apps with full feature parity and offline menu viewing"
      },
      {
        title: "Continuous Updates",
        description: "Regular updates with bug fixes, features, and improvements - always included"
      },
      {
        title: "Data Security & Backups",
        description: "Automatic daily backups, data redundancy, disaster recovery, and 99.99% uptime SLA"
      }
    ]
  },

  // CTA Section
  cta: {
    subtitle: "Join thousands of restaurants, cafes, and food businesses worldwide using EMenu Platform to increase efficiency, boost sales, and delight customers.",
    primaryCTA: "Start Your Free 30-Day Trial",
    secondaryCTA: "Schedule a Personalized Demo",
    disclaimer: "✓ No credit card required  •  ✓ Full access to all features  •  ✓ Cancel anytime  •  ✓ 24/7 support"
  },

  // Footer
  footer: {
    company: "EMenu Platform",
    tagline: "Professional digital menu and POS solution for modern food businesses worldwide",
    description: "Trusted by restaurants, cafes, delivery services, and food enterprises. Simple, affordable, powerful.",
    contact: {
      email: "support@emenu-platform.com",
      phone: "+1-800-EMENU-99",
      location: "Available Globally 🌍"
    },
    links: {
      Product: ["Features", "Pricing", "Security", "API Docs"],
      Company: ["About Us", "Blog", "Careers", "Contact"],
      Resources: ["Help Center", "Community", "Status Page"],
      Legal: ["Privacy Policy", "Terms of Service", "Compliance", "Cookie Policy"]
    },
    social: "Follow us on social media for updates, tips, and success stories"
  }
};

export type LandingConfig = typeof LANDING_CONFIG;
