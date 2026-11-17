"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useEffect, useRef } from "react";
import { initializeAuth } from "./slices/authSlice";

interface ReduxProviderProps {
  children: React.ReactNode;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      store.dispatch(initializeAuth());
    }
  }, []);

  return <>{children}</>;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
