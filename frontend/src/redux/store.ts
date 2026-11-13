import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "@/redux/features/auth/authSlice";
import savedJobsReducer from "@/redux/features/savedJobs/savedJobsSlice";
import jobApplicationReducer from "@/redux/features/jobApplication/jobApplicationSlice";
import resumeReducer from "@/redux/features/resume/resumeSlice";
import candidateShortlistReducer from "@/redux/features/candidateShortlist/candidateShortlistSlice";
import followReducer from "@/redux/features/follow/followSlice";
import agentRatingReducer from "@/redux/features/agentRating/agentRatingSlice";
import { baseApi } from "./api/baseApi";

// Persist configuration for auth slice
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token", "user"], // Only persist token and user
};

// Create persisted reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Create a single store instance for the app
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: persistedAuthReducer,
    savedJobs: savedJobsReducer,
    jobApplication: jobApplicationReducer,
    resume: resumeReducer,
    candidateShortlist: candidateShortlistReducer,
    follow: followReducer,
    agentRating: agentRatingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(baseApi.middleware),
});

// The saved login is restored only after React has taken over the server-rendered page
// (persistor.persist() in lib/Provider.tsx). Restoring it earlier would make the browser's first
// render (signed in) differ from the server's HTML (signed out): a hydration error.
// (redux-persist 6 supports manualPersist at runtime, see lib/persistStore.js; its types omit it.)
export const persistor = persistStore(store, { manualPersist: true } as unknown as Parameters<typeof persistStore>[1]);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
