"use client";

import { store, persistor } from "@/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";
import { useEffect } from "react";

const TokenSync = () => {
  useEffect(() => {
    // Sync token from Redux to cookie on mount
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    }
  }, []);

  return null;
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate
        loading={<div className="min-h-screen" />}
        persistor={persistor}
      >
        <TokenSync />
        <Toaster position="top-center" />
        {children}
      </PersistGate>
    </Provider>
  );
};

export default Providers;
