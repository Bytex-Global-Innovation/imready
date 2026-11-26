"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { TopLineLoader } from "@/components/ui/line-loader";

type LoadingBarContextValue = {
  startLoading: () => void;
  stopLoading: () => void;
  resetLoading: () => void;
  isLoading: boolean;
};

const LoadingBarContext = createContext<LoadingBarContextValue | null>(null);

export function LoadingBarProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const startLoading = useCallback(() => {
    setCount((n) => n + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setCount((n) => Math.max(0, n - 1));
  }, []);

  const resetLoading = useCallback(() => {
    setCount(0);
  }, []);

  const value = useMemo(
    () => ({
      startLoading,
      stopLoading,
      resetLoading,
      isLoading: count > 0,
    }),
    [count, startLoading, stopLoading, resetLoading],
  );

  return (
    <LoadingBarContext.Provider value={value}>
      {children}
      <TopLineLoader
        show={count > 0}
        className="fixed top-14 left-0 right-0 z-50"
      />
    </LoadingBarContext.Provider>
  );
}

export function useLoadingBar() {
  const ctx = useContext(LoadingBarContext);
  if (!ctx) {
    return {
      startLoading: () => undefined,
      stopLoading: () => undefined,
      resetLoading: () => undefined,
      isLoading: false,
    };
  }
  return ctx;
}
