export interface PortfolioPhoneDto {
  id: string;
  number: string;
}

export interface PortfolioContactDto {
  email: string;
  phone: string;
  phones?: PortfolioPhoneDto[];
  whatsapp?: string;
  telegram?: string;
  address?: string;
  mapLink?: string;
}

export interface PortfolioSocialMediaItemDto {
  id: string;
  type: string;
  url: string;
}

export interface PortfolioHoursDto {
  id: string;
  day: string;
  openTime?: string;
  closeTime?: string;
}

export interface PortfolioGalleryItemDto {
  id: string;
  url: string;
  title?: string;
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
  id: string;
  label: string;
  value: string;
}

export interface PortfolioFeatureDto {
  id: string;
  name: string;
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
  contact: PortfolioContactDto;
  socialMedia?: PortfolioSocialMediaDto;
  businessHours?: PortfolioHoursDto[];
  gallery?: PortfolioGalleryItemDto[];
  services?: PortfolioServiceItemDto[];
  team?: PortfolioTeamMemberDto[];
  features?: PortfolioFeatureDto[];
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
  wouldRecommend?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioPhoneRequest {
  id?: string;
  number: string;
}

export interface PortfolioSocialMediaRequest {
  id?: string;
  type: string;
  url: string;
}

export interface PortfolioHoursRequest {
  id?: string;
  day: string;
  openTime?: string;
  closeTime?: string;
}

export interface PortfolioGalleryItemRequest {
  id?: string;
  url: string;
  title?: string;
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
  id?: string;
  label: string;
  value: string;
}

export interface PortfolioFeatureRequest {
  id?: string;
  name: string;
}

export interface PortfolioProfileSaveRequest {
  slug: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  contactEmail: string;
  contactPhone: string;
  contactPhones?: PortfolioPhoneRequest[];
  contactWhatsapp?: string;
  contactTelegram?: string;
  address?: string;
  mapLink?: string;
  socialMedia?: PortfolioSocialMediaRequest[];
  features?: PortfolioFeatureRequest[];
  yearsInBusiness?: number;
  customersServed?: number;
  customStats?: PortfolioCustomStatRequest[];
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
}
