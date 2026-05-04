/**
 * Business Profile Static Data Templates
 * Use these templates until API is ready
 */

import {
  BusinessProfile,
  BusinessType,
  DayOfWeek,
} from "@/types/business-profile";

/**
 * Default/Demo Business Profile
 * This is a complete example showing all features
 */
export const demoBusinessProfile: BusinessProfile = {
  id: "demo-business-1",
  slug: "my-amazing-cafe",
  businessName: "The Amazing Café",
  tagline: "Where Every Sip Tells a Story",
  description:
    "Welcome to The Amazing Café, your neighborhood's favorite spot for artisanal coffee and homemade pastries. We've been serving our community for over 5 years with passion, quality, and a warm smile. Our beans are ethically sourced, expertly roasted, and brewed to perfection. Whether you're here for a quick espresso or a leisurely brunch, we promise an experience that delights all your senses.",
  logo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop",
  coverImage:
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=400&fit=crop",

  businessType: BusinessType.CAFE,
  industry: "Food & Beverage",

  contact: {
    email: "hello@amazingcafe.com",
    phone: "+1 (555) 123-4567",
    whatsapp: "+15551234567",
    address: {
      street: "123 Coffee Street, Suite 100",
      city: "San Francisco",
      state: "California",
      country: "United States",
      postalCode: "94102",
    },
    mapLink: "https://maps.google.com/?q=San+Francisco+CA",
  },

  socialMedia: {
    facebook: "https://facebook.com/amazingcafe",
    instagram: "https://instagram.com/amazingcafe",
    twitter: "https://twitter.com/amazingcafe",
    website: "https://amazingcafe.com",
  },

  businessHours: [
    {
      day: DayOfWeek.MONDAY,
      isOpen: true,
      openTime: "07:00",
      closeTime: "20:00",
    },
    {
      day: DayOfWeek.TUESDAY,
      isOpen: true,
      openTime: "07:00",
      closeTime: "20:00",
    },
    {
      day: DayOfWeek.WEDNESDAY,
      isOpen: true,
      openTime: "07:00",
      closeTime: "20:00",
    },
    {
      day: DayOfWeek.THURSDAY,
      isOpen: true,
      openTime: "07:00",
      closeTime: "20:00",
    },
    {
      day: DayOfWeek.FRIDAY,
      isOpen: true,
      openTime: "07:00",
      closeTime: "22:00",
    },
    {
      day: DayOfWeek.SATURDAY,
      isOpen: true,
      openTime: "08:00",
      closeTime: "22:00",
    },
    {
      day: DayOfWeek.SUNDAY,
      isOpen: true,
      openTime: "08:00",
      closeTime: "18:00",
    },
  ],

  gallery: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
      title: "Cozy Interior",
      description: "Our warm and inviting space",
      order: 1,
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop",
      title: "Fresh Coffee",
      description: "Expertly brewed every time",
      order: 2,
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop",
      title: "Artisan Pastries",
      description: "Made fresh daily",
      order: 3,
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
      title: "Outdoor Seating",
      description: "Perfect for sunny days",
      order: 4,
    },
  ],

  features: [
    "Free Wi-Fi",
    "Outdoor Seating",
    "Pet Friendly",
    "Vegan Options",
    "Gluten-Free Options",
    "Takeaway Available",
  ],

  services: [
    {
      id: "1",
      name: "Specialty Coffee",
      description:
        "Premium coffee beans from around the world, expertly roasted and brewed",
      icon: "☕",
      price: 4.5,
      currency: "USD",
    },
    {
      id: "2",
      name: "Fresh Pastries",
      description: "Homemade pastries and baked goods made fresh daily",
      icon: "🥐",
      price: 3.5,
      currency: "USD",
    },
    {
      id: "3",
      name: "Brunch Menu",
      description: "Delicious brunch options available on weekends",
      icon: "🍳",
      price: 12.0,
      currency: "USD",
    },
    {
      id: "4",
      name: "Catering Services",
      description: "Perfect for events, meetings, and special occasions",
      icon: "🎉",
    },
  ],

  team: [
    {
      id: "1",
      name: "Sarah Johnson",
      position: "Owner & Head Barista",
      bio: "Passionate about coffee and community, Sarah founded The Amazing Café in 2018.",
      photo:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    },
    {
      id: "2",
      name: "Mike Chen",
      position: "Head Pastry Chef",
      bio: "With 10 years of experience, Mike creates our delicious pastries daily.",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    },
    {
      id: "3",
      name: "Emma Davis",
      position: "Manager",
      bio: "Emma ensures everything runs smoothly and every customer leaves happy.",
      photo:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
    },
  ],

  reviews: [
    {
      id: "1",
      customerName: "John Smith",
      customerEmail: "john.smith@example.com",
      customerPhoto:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      rating: 5,
      title: "Best coffee in town!",
      comment:
        "I've been coming to The Amazing Café for over a year now, and I'm never disappointed. The atmosphere is perfect for working or catching up with friends. The baristas know their craft, and the coffee is consistently excellent. The outdoor seating is a huge plus during nice weather. Highly recommend the signature blend!",
      visitDate: "2024-01-10",
      serviceUsed: "Specialty Coffee",
      wouldRecommend: true,
      isVerified: true,
      isApproved: true,
      createdAt: "2024-01-15T10:30:00Z",
      helpfulCount: 24,
      businessResponse: {
        message:
          "Thank you so much, John! We're thrilled to have you as a regular. Your support means the world to us! ☕",
        respondedAt: "2024-01-15T14:20:00Z",
        respondedBy: "Sarah Johnson",
      },
    },
    {
      id: "2",
      customerName: "Lisa Anderson",
      customerEmail: "lisa.anderson@example.com",
      customerPhoto:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      rating: 5,
      title: "Absolutely divine pastries!",
      comment:
        "I'm a pastry lover, and these are hands down the best I've had in the city. Everything is made fresh daily, and you can really taste the difference. The croissants are buttery perfection, and don't even get me started on the chocolate danish. I come here every morning before work - it's become my favorite part of my routine!",
      visitDate: "2024-01-08",
      serviceUsed: "Fresh Pastries",
      wouldRecommend: true,
      isVerified: true,
      isApproved: true,
      createdAt: "2024-01-10T08:15:00Z",
      helpfulCount: 18,
      photos: [
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop",
      ],
    },
    {
      id: "3",
      customerName: "David Kim",
      customerEmail: "david.kim@example.com",
      rating: 5,
      title: "Perfect spot for a weekend brunch",
      comment:
        "Great service, amazing coffee, and the outdoor seating is perfect on sunny days. We brought our dog, and they were so welcoming - even brought out a water bowl without us asking. The staff is friendly and attentive. Will definitely be back!",
      visitDate: "2024-01-03",
      serviceUsed: "Brunch Menu",
      wouldRecommend: true,
      isVerified: false,
      isApproved: true,
      createdAt: "2024-01-05T16:45:00Z",
      helpfulCount: 12,
    },
    {
      id: "4",
      customerName: "Emily Chen",
      customerEmail: "emily.chen@example.com",
      rating: 4,
      title: "Great atmosphere, could use more vegan options",
      comment:
        "I love the vibe of this place - it's cozy and welcoming. The coffee is excellent, and the staff is super friendly. My only suggestion would be to add more vegan pastry options. Currently there's only one, and it would be great to have more variety. But overall, a wonderful spot!",
      visitDate: "2024-01-12",
      serviceUsed: "Specialty Coffee",
      wouldRecommend: true,
      isVerified: true,
      isApproved: true,
      createdAt: "2024-01-14T11:20:00Z",
      helpfulCount: 8,
      businessResponse: {
        message:
          "Thank you for the feedback, Emily! We're actually working on expanding our vegan options - stay tuned! 🌱",
        respondedAt: "2024-01-14T15:30:00Z",
        respondedBy: "Mike Chen",
      },
    },
    {
      id: "5",
      customerName: "Marcus Johnson",
      customerEmail: "marcus.j@example.com",
      rating: 5,
      title: "My go-to workspace",
      comment:
        "Fast WiFi, plenty of outlets, and great coffee - what more could you ask for? I work remotely and this has become my favorite spot to get work done. The background music is at the perfect level, and there's always a good mix of people. Plus, the coffee keeps me productive all day!",
      visitDate: "2024-01-11",
      wouldRecommend: true,
      isVerified: false,
      isApproved: true,
      createdAt: "2024-01-13T09:00:00Z",
      helpfulCount: 15,
    },
  ],

  stats: {
    yearsInBusiness: 5,
    customersServed: 50000,
    productsAvailable: 50,
    customStats: [
      { label: "5-Star Reviews", value: "500+", icon: "⭐" },
      { label: "Daily Cups Served", value: "200+", icon: "☕" },
    ],
  },

  theme: {
    primaryColor: "#57823D",    // Green - brand color
    fontFamily: "Inter",
    layout: "modern",
  },

  isPublished: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-19T00:00:00Z",
};

/**
 * Empty template for new businesses
 */
export const emptyBusinessProfile: Partial<BusinessProfile> = {
  businessName: "",
  tagline: "",
  description: "",
  businessType: BusinessType.OTHER,
  industry: "",
  contact: {
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      country: "",
    },
  },
  socialMedia: {},
  businessHours: [
    { day: DayOfWeek.MONDAY, isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: DayOfWeek.TUESDAY, isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: DayOfWeek.WEDNESDAY, isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: DayOfWeek.THURSDAY, isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: DayOfWeek.FRIDAY, isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: DayOfWeek.SATURDAY, isOpen: false },
    { day: DayOfWeek.SUNDAY, isOpen: false },
  ],
  features: [],
  services: [],
  team: [],
  testimonials: [],
  gallery: [],
  isPublished: false,
};

/**
 * Restaurant Template
 */
export const restaurantTemplate: Partial<BusinessProfile> = {
  businessType: BusinessType.RESTAURANT,
  features: [
    "Dine-in",
    "Takeaway",
    "Delivery",
    "Private Events",
    "Outdoor Seating",
    "Free Wi-Fi",
  ],
};

/**
 * Retail/eCommerce Template
 */
export const retailTemplate: Partial<BusinessProfile> = {
  businessType: BusinessType.RETAIL,
  features: [
    "Online Shopping",
    "In-Store Pickup",
    "Free Shipping",
    "Gift Wrapping",
    "Returns & Exchanges",
  ],
};

/**
 * Service Business Template
 */
export const serviceTemplate: Partial<BusinessProfile> = {
  businessType: BusinessType.SERVICE,
  features: [
    "Free Consultation",
    "24/7 Support",
    "Custom Solutions",
    "Money-Back Guarantee",
  ],
};
