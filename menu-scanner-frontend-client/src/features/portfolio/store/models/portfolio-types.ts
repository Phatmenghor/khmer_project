export interface PortfolioAddressDto {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface PortfolioContactDto {
  email: string;
  phone: string;
  phones?: string[];
  whatsapp?: string;
  telegram?: string;
  address: PortfolioAddressDto;
  mapLink?: string;
}

export interface PortfolioSocialMediaDto {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export interface PortfolioHoursDto {
  day: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  is24Hours?: boolean;
}

export interface PortfolioGalleryItemDto {
  id: string;
  url: string;
  title?: string;
  description?: string;
  displayOrder?: number;
}

export interface PortfolioServiceItemDto {
  id: string;
  name: string;
  description: string;
}

export interface PortfolioTeamMemberDto {
  id: string;
  name: string;
  position: string;
  bio?: string;
  photoUrl?: string;
}

export interface PortfolioCustomStatDto {
  label: string;
  value: string;
}

export interface PortfolioStatsDto {
  yearsInBusiness?: number;
  customersServed?: number;
  customStats?: PortfolioCustomStatDto[];
}

export interface ReviewStatsDto {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export interface PortfolioPublicProfile {
  id: string;
  slug: string;
  businessName: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  industry?: string;
  isPublished?: boolean;
  contact: PortfolioContactDto;
  socialMedia?: PortfolioSocialMediaDto;
  businessHours?: PortfolioHoursDto[];
  gallery?: PortfolioGalleryItemDto[];
  services?: PortfolioServiceItemDto[];
  team?: PortfolioTeamMemberDto[];
  features?: string[];
  stats?: PortfolioStatsDto;
  reviewStats?: ReviewStatsDto;
  createdAt?: string;
  updatedAt?: string;
}

export type PortfolioAdminProfile = PortfolioPublicProfile;

export interface PortfolioReviewAdmin {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  rating: number;
  title?: string;
  comment: string;
  isApproved?: boolean;
  wouldRecommend?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioHoursRequest {
  day: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  is24Hours?: boolean;
}

export interface PortfolioGalleryItemRequest {
  url: string;
  title?: string;
  description?: string;
  displayOrder?: number;
}

export interface PortfolioServiceItemRequest {
  name: string;
  description: string;
}

export interface PortfolioTeamMemberRequest {
  name: string;
  position: string;
  bio?: string;
  photoUrl?: string;
}

export interface PortfolioCustomStatRequest {
  label: string;
  value: string;
}

export interface PortfolioProfileSaveRequest {
  slug: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  industry?: string;
  contactEmail: string;
  contactPhone: string;
  contactPhones?: string[];
  contactWhatsapp?: string;
  contactTelegram?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressCountry?: string;
  addressPostalCode?: string;
  mapLink?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  socialYoutube?: string;
  socialTiktok?: string;
  socialWebsite?: string;
  features?: string[];
  yearsInBusiness?: number;
  customersServed?: number;
  customStats?: PortfolioCustomStatRequest[];
  isPublished?: boolean;
  businessHours?: PortfolioHoursRequest[];
  gallery?: PortfolioGalleryItemRequest[];
  services?: PortfolioServiceItemRequest[];
  team?: PortfolioTeamMemberRequest[];
}

export interface PortfolioReviewSubmitRequest {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  rating: number;
  title?: string;
  comment: string;
  wouldRecommend?: boolean;
}

export interface PortfolioReviewFilterRequest {
  pageNo: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: string;
  isApproved?: boolean | null;
}
