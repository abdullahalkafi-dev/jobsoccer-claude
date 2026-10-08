import { TUser } from "@/types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TAuthState = {
  user: TUser | null;
  token: string | null;
};

const initialState: TAuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      // Store token in cookie for middleware access
      if (typeof document !== "undefined") {
        document.cookie = `token=${action.payload}; path=/; max-age=${
          60 * 60 * 24 * 7
        }`; // 7 days
      }
    },
    setUser: (state, action: PayloadAction<TUser | null>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      // Remove token cookie
      if (typeof document !== "undefined") {
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      }
    },
  },
});

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
