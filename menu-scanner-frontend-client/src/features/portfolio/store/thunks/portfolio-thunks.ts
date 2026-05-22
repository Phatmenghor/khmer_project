import { axiosClient, axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  PortfolioPublicProfile,
  PortfolioAdminProfile,
  PortfolioReviewAdmin,
  PortfolioProfileSaveRequest,
  PortfolioReviewFilterRequest,
  PortfolioReviewSubmitRequest,
} from "../models/portfolio-types";
import { PaginationResponseModel } from "@/features/master-data/store/models/response/pagination-response";

export const fetchPublicPortfolioThunk = createApiThunk<PortfolioPublicProfile, string>(
  "portfolio/fetchPublic",
  async (businessId) => {
    const response = await axiosClient.get(`/api/v1/public/portfolio/${businessId}`);
    return response.data.data;
  }
);

export const submitPublicReviewThunk = createApiThunk<
  void,
  { businessId: string; request: PortfolioReviewSubmitRequest }
>(
  "portfolio/submitReview",
  async ({ businessId, request }) => {
    await axiosClient.post(`/api/v1/public/portfolio/${businessId}/reviews`, request);
  }
);

export const fetchAdminPortfolioProfileThunk = createApiThunk<PortfolioAdminProfile, void>(
  "portfolio/fetchAdminProfile",
  async () => {
    console.log("## [portfolio/fetchAdminProfile] calling GET /api/v1/portfolio/profile");
    try {
      const response = await axiosClientWithAuth.get("/api/v1/portfolio/profile");
      console.log("## [portfolio/fetchAdminProfile] HTTP status:", response.status);
      console.log("## [portfolio/fetchAdminProfile] full response.data:", response.data);
      console.log("## [portfolio/fetchAdminProfile] response.data.data:", response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error("## [portfolio/fetchAdminProfile] ERROR:", error?.response?.status, error?.response?.data ?? error?.message);
      throw error;
    }
  }
);

export const saveAdminPortfolioProfileThunk = createApiThunk<
  PortfolioAdminProfile,
  PortfolioProfileSaveRequest
>(
  "portfolio/saveProfile",
  async (request) => {
    const response = await axiosClientWithAuth.post("/api/v1/portfolio/profile", request);
    return response.data.data;
  }
);

export const fetchPortfolioReviewsThunk = createApiThunk<
  PaginationResponseModel<PortfolioReviewAdmin>,
  PortfolioReviewFilterRequest
>(
  "portfolio/fetchReviews",
  async (filter) => {
    const response = await axiosClientWithAuth.post("/api/v1/portfolio/reviews/all", filter);
    return response.data.data;
  }
);

export const getReviewDetailThunk = createApiThunk<PortfolioReviewAdmin, string>(
  "portfolio/getReviewDetail",
  async (id) => {
    const response = await axiosClientWithAuth.get(`/api/v1/portfolio/reviews/${id}`);
    return response.data.data;
  }
);

export const deleteReviewThunk = createApiThunk<string, string>(
  "portfolio/deleteReview",
  async (id) => {
    await axiosClientWithAuth.delete(`/api/v1/portfolio/reviews/${id}`);
    return id;
  }
);
