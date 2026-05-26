"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  setUser,
  setAuthReady,
} from "@/redux/features/auth/store/slice/auth-slice";
import { selectAuthReady } from "@/redux/features/auth/store/selectors/auth-selectors";

const ACCESS_TOKEN_KEY = "platform-auth-token";
const USER_INFO_KEY = "platform-user-info";

function getCookieValue(name: string): string | null {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function useAuthInit() {
  const dispatch = useAppDispatch();
  const authReady = useAppSelector(selectAuthReady);

  useEffect(() => {
    if (authReady) return;

    const token = getCookieValue(ACCESS_TOKEN_KEY);
    const userInfoStr = getCookieValue(USER_INFO_KEY);

    try {
      const userInfo = userInfoStr
        ? JSON.parse(decodeURIComponent(userInfoStr))
        : null;

      if (token && userInfo) {
        dispatch(setUser({ ...userInfo, accessToken: token }));
      } else {
        dispatch(setAuthReady());
      }
    } catch {
      dispatch(setAuthReady());
    }
  }, [dispatch, authReady]);

  return { authReady };
}
