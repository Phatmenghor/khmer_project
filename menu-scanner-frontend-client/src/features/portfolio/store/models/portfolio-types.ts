import { ImageUrls } from "@/features/auth/store/models/request/users-request";

export interface PortfolioPhoneDto {
  id: string;
  number: string;
}

export interface PortfolioContactDto {
  email?: string;
  phone?: string;
  phones?: PortfolioPhoneDto[];
  telegram?: string;
  address?: string;
  mapLink?: string;
}

export interface PortfolioSocialMediaItemDto {
  id: string;
  name: string;
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
  image?: ImageUrls;
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
  photo?: ImageUrls;
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


export interface ReviewStatsDto {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export interface PortfolioPublicProfile {
  id: string;
  businessName: string;
  description: string;
  tagline?: string;
  logo?: ImageUrls;
  coverImage?: ImageUrls;
  contact: PortfolioContactDto;
  socialMedia?: PortfolioSocialMediaItemDto[];
  businessHours?: PortfolioHoursDto[];
  gallery?: PortfolioGalleryItemDto[];
  services?: PortfolioServiceItemDto[];
  team?: PortfolioTeamMemberDto[];
  features?: PortfolioFeatureDto[];
  stats?: PortfolioCustomStatDto[];
  reviewStats?: ReviewStatsDto;
  createdAt?: string;
  updatedAt?: string;
}

export type PortfolioAdminProfile = PortfolioPublicProfile;

export interface PortfolioReviewAdmin {
  id: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioReviewPublic {
  id: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface PortfolioPhoneRequest {
  id?: string;
  number: string;
}

export interface PortfolioSocialMediaRequest {
  id?: string;
  name: string;
  url: string;
}

export interface PortfolioHoursRequest {
  id?: string;
  day: string;
  openTime?: string | null;
  closeTime?: string | null;
}

export interface PortfolioGalleryItemRequest {
  id?: string;
  image?: ImageUrls;
  title?: string;
}

export interface PortfolioServiceItemRequest {
  id?: string;
  name: string;
  description?: string;
}

export interface PortfolioTeamMemberRequest {
  id?: string;
  name: string;
  position: string;
  bio?: string;
  photo?: ImageUrls;
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

export interface PortfolioContactRequest {
  email?: string;
  phone?: string;
  phones?: PortfolioPhoneRequest[];
  telegram?: string;
  address?: string;
  mapLink?: string;
}

export interface PortfolioProfileSaveRequest {
  description: string;
  coverImage?: ImageUrls;
  contact?: PortfolioContactRequest;
  socialMedia?: PortfolioSocialMediaRequest[];
  businessHours?: PortfolioHoursRequest[];
  gallery?: PortfolioGalleryItemRequest[];
  services?: PortfolioServiceItemRequest[];
  team?: PortfolioTeamMemberRequest[];
  features?: PortfolioFeatureRequest[];
  customStats?: PortfolioCustomStatRequest[];
}

export interface PortfolioReviewSubmitRequest {
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment: string;
}

export interface PortfolioReviewFilterRequest {
  pageNo: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: string;
}
