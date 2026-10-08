import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  userType: string;
  isVerified: boolean;
  stripeCustomerId?: string;
  activeSubscriptionId?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      // Store token in localStorage and cookies
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", action.payload.accessToken);
        // Set cookie with token
        document.cookie = `accessToken=${action.payload.accessToken}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      // Remove token from localStorage and cookies
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        // Remove cookie
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    },
    loadUserFromStorage: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
});

export const { setCredentials, logout, loadUserFromStorage, setUser } =
  authSlice.actions;
export default authSlice.reducer;
