"use client";

import { Provider } from "react-redux";
import store from "./store";
import { ApplicationUserContextProvider } from "@/context/ApplicationUser";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ApplicationUserContextProvider>
        {children}
      </ApplicationUserContextProvider>
    </Provider>
  );
}

export default Providers;
