import { RootState } from "@/store";

export const selectPublicPortfolio = (state: RootState) => state.publicPortfolio;
export const selectPublicProfile = (state: RootState) => state.publicPortfolio.profile;
export const selectPublicPortfolioLoading = (state: RootState) => state.publicPortfolio.isLoading;
export const selectPublicPortfolioError = (state: RootState) => state.publicPortfolio.error;
export const selectIsSubmittingReview = (state: RootState) => state.publicPortfolio.isSubmittingReview;

export const selectPortfolioProfile = (state: RootState) => state.portfolioProfile;
export const selectAdminProfile = (state: RootState) => state.portfolioProfile.profile;
export const selectAdminProfileLoading = (state: RootState) => state.portfolioProfile.isLoading;
export const selectAdminProfileSaving = (state: RootState) => state.portfolioProfile.isSaving;
export const selectAdminProfileError = (state: RootState) => state.portfolioProfile.error;

export const selectPortfolioReviews = (state: RootState) => state.portfolioReviews;
export const selectReviewsData = (state: RootState) => state.portfolioReviews.data;
export const selectReviewsContent = (state: RootState) => state.portfolioReviews.data?.content ?? [];
export const selectReviewsLoading = (state: RootState) => state.portfolioReviews.isLoading;
export const selectReviewsFilters = (state: RootState) => state.portfolioReviews.filters;
export const selectReviewsOperations = (state: RootState) => state.portfolioReviews.operations;
