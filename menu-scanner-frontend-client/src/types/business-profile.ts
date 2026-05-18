


export interface BusinessProfile {

  id: string;
  slug: string;
  businessName: string;
  tagline?: string;
  description: string;
  logo?: string;
  coverImage?: string;


  businessType: BusinessType;
  industry: string;


  contact: ContactInfo;


  socialMedia?: SocialMediaLinks;


  businessHours?: BusinessHours[];


  gallery?: GalleryItem[];


  features?: string[];
  services?: Service[];


  team?: TeamMember[];


  reviews?: CustomerReview[];


  stats?: BusinessStats;


  theme?: ThemeSettings;


  isPublished: boolean;
  customDomain?: string;


  createdAt: string;
  updatedAt: string;
}

export enum BusinessType {
  RESTAURANT = "RESTAURANT",
  CAFE = "CAFE",
  RETAIL = "RETAIL",
  ECOMMERCE = "ECOMMERCE",
  SERVICE = "SERVICE",
  POS = "POS",
  OTHER = "OTHER",
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp?: string;
  address: Address;
  mapLink?: string;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export interface BusinessHours {
  day: DayOfWeek;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  is24Hours?: boolean;
}

export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export interface GalleryItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
  order: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string;
  price?: number;
  currency?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio?: string;
  photo?: string;
  email?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
  };
}


export interface CustomerReview {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerPhoto?: string;
  rating: number;
  comment: string;
  title?: string;


  visitDate?: string;
  serviceUsed?: string;
  wouldRecommend?: boolean;


  isVerified?: boolean;
  isApproved: boolean;
  createdAt: string;


  businessResponse?: {
    message: string;
    respondedAt: string;
    respondedBy?: string;
  };


  helpfulCount?: number;


  photos?: string[];
}

export interface BusinessStats {
  yearsInBusiness?: number;
  customersServed?: number;
  projectsCompleted?: number;
  productsAvailable?: number;
  customStats?: CustomStat[];
}

export interface CustomStat {
  label: string;
  value: string | number;
  icon?: string;
}

export interface ThemeSettings {
  primaryColor: string;
  fontFamily?: string;
  layout?: "modern" | "classic" | "minimal" | "bold";
}


export interface ProfileSectionSettings {
  showHero: boolean;
  showAbout: boolean;
  showServices: boolean;
  showProducts: boolean;
  showGallery: boolean;
  showTeam: boolean;
  showTestimonials: boolean;
  showStats: boolean;
  showContact: boolean;
  showBusinessHours: boolean;
}


export interface BusinessProfileFormData {
  businessName: string;
  tagline: string;
  description: string;
  businessType: BusinessType;
  industry: string;
  email: string;
  phone: string;
  whatsapp: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  website: string;
}
