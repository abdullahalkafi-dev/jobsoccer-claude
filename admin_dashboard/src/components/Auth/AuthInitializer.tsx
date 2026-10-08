"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { loadUserFromStorage, setUser } from "@/redux/features/auth/authSlice";
import { useGetMeQuery } from "@/redux/api/baseApi";

export function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load token from localStorage on app initialization
    const token = localStorage.getItem("accessToken");
    if (token) {
      dispatch(loadUserFromStorage(token));
    }
  }, [dispatch]);

  // Fetch user data if authenticated
  const { data: userData, isSuccess } = useGetMeQuery(undefined, {
    skip: typeof window === "undefined" || !localStorage.getItem("accessToken"),
  });

  useEffect(() => {
    if (isSuccess && userData?.data) {
      dispatch(setUser(userData.data));
    }
  }, [isSuccess, userData, dispatch]);

  return null;
}
