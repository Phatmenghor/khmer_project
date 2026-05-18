import { axiosClientWithAuth } from "@/utils/axios";
import { createApiThunk } from "@/utils/axios/api-wrapper";
import {
  AddToWishlistRequest,
  RemoveFromWishlistRequest,
} from "../models/request/wishlist-request";
import { WishlistResponseModel } from "../models/response/wishlist-response";

export const fetchWishlist = createApiThunk<WishlistResponseModel, void>(
  "wishlist/fetchWishlist",
  async () => {
    const response = await axiosClientWithAuth.get("/api/v1/wishlist");
    return response.data.data;
  }
);

export const addToWishlist = createApiThunk<void, AddToWishlistRequest>(
  "wishlist/addToWishlist",
  async (data) => {
    await axiosClientWithAuth.post("/api/v1/wishlist/add", data);
  }
);

export const removeFromWishlist = createApiThunk<
  void,
  RemoveFromWishlistRequest
>("wishlist/removeFromWishlist", async (data) => {
  await axiosClientWithAuth.delete(
    `/api/v1/wishlist/remove/${data.productId}`
  );
});
