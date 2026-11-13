import { TUser } from "@/types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearTokenCookie, writeTokenCookie } from "@/lib/authCookie";

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
      // The route guard (middleware) reads the cookie; keep it in step with the store
      writeTokenCookie(action.payload);
    },
    setUser: (state, action: PayloadAction<TUser | null>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      clearTokenCookie();
    },
  },
});

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
