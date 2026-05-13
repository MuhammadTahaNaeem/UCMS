import { createSlice } from "@reduxjs/toolkit";
import { loadAuthState } from "./authStorage";

const initialState = loadAuthState() ?? {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role ?? user?.role ?? "User";
      state.isAuthenticated = true;
    },
    logout: () => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
    }),
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;