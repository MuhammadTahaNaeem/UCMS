import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logout, setCredentials } from "@/features/auth/authSlice";
import { clearAuthState, persistAuthState } from "@/features/auth/authStorage";

const authPersistenceMiddleware = (storeApi) => (next) => (action) => {
  const result = next(action);

  if (setCredentials.match(action)) {
    persistAuthState(storeApi.getState().auth, action.payload?.rememberMe ?? true);
  }

  if (logout.match(action)) {
    clearAuthState();
  }

  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authPersistenceMiddleware),
});
