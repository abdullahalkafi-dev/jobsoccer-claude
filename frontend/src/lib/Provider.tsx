"use client";

import { store, persistor } from "@/redux/store";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/redux/features/auth/authSlice";
import { baseApi } from "@/redux/api/baseApi";
import { clearTokenCookie, writeTokenCookie } from "./authCookie";

const AUTH_CHANNEL = "jobsoccer-auth";

/**
 * Keeps the sign-in state consistent everywhere:
 * - after the saved login is restored from localStorage, the route-guard cookie is set to match
 *   (written when signed in, removed when not), so the guard and the app always agree;
 * - when someone signs in or out, the router's cached pages are dropped (router.refresh), so a
 *   page cached while signed out (for example "go to Sign in") is never replayed after login;
 * - signing out in one tab signs out the other open tabs of this browser too.
 */
const AuthSync = () => {
  const router = useRouter();

  useEffect(() => {
    // The page is hydrated now: restore the saved login from localStorage
    persistor.persist();
  }, []);

  useEffect(() => {
    let previous: string | null | undefined; // undefined = the saved login is not restored yet
    let fromOtherTab = false;
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(AUTH_CHANNEL) : null;

    const onStoreChange = () => {
      if (!persistor.getState().bootstrapped) return;
      const token = store.getState().auth.token;

      if (previous === undefined) {
        previous = token;
        if (token) writeTokenCookie(token);
        else clearTokenCookie();
        return;
      }
      if (token === previous) return;

      const signedOut = !!previous && !token;
      previous = token;
      router.refresh();
      if (signedOut && !fromOtherTab) channel?.postMessage({ type: "logout" });
      fromOtherTab = false;
    };

    const unsubscribeStore = store.subscribe(onStoreChange);
    const unsubscribePersistor = persistor.subscribe(onStoreChange);
    onStoreChange();

    if (channel) {
      channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
        if (event.data?.type !== "logout" || !store.getState().auth.token) return;
        fromOtherTab = true;
        store.dispatch(logout());
        store.dispatch(baseApi.util.resetApiState());
        router.replace("/signin");
      };
    }

    return () => {
      unsubscribeStore();
      unsubscribePersistor();
      channel?.close();
    };
  }, [router]);

  return null;
};

/**
 * The page renders straight away (also on the server, so visitors and search engines get real
 * content). The saved login is restored in the background; the parts that depend on it (navbar
 * account menu, profile pages) show their own loading state until it is there.
 */
const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <AuthSync />
      <Toaster position="top-center" />
      {children}
    </Provider>
  );
};

export default Providers;
