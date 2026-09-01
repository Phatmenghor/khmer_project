import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { autoFetchProfileMiddleware } from "@/store/middleware";
import { reducers } from "@/store/reducers";

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["users/fetchAll/pending"],
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        ignoredPaths: [
          "users.data",
          "home.banners",
          "home.categories",
          "home.promotionProducts",
          "home.featuredProducts",
        ],
        warnAfter: 128,
      },
    }).concat(autoFetchProfileMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = () =>
  useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { store };
