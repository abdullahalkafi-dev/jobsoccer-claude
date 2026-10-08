"use client";

import { store } from "@/redux/store";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-right" richColors />
    </Provider>
  );
}

export default Providers;
