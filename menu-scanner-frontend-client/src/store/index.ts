import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import {
  authLoggingMiddleware,
  userLoggingMiddleware,
  errorLoggingMiddleware,
  autoFetchProfileMiddleware,
} from "@/store/middleware";
import { reducers } from "@/store/reducers";

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["users/fetchAll/pending"],
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        ignoredPaths: ["users.data"],
      },
    }).concat([
      autoFetchProfileMiddleware,
      authLoggingMiddleware,
      userLoggingMiddleware,
      errorLoggingMiddleware,
    ]),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { store };
