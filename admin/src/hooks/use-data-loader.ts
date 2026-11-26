"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLoadingBar } from "@/components/layout/loading-bar-context";

/**
 * Shows the global top line loader while an async data load runs.
 * Use for page fetches and in-page filter tab switches.
 */
export function useDataLoader() {
  const { startLoading, stopLoading } = useLoadingBar();
  const activeRef = useRef(false);

  const begin = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    startLoading();
  }, [startLoading]);

  const end = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    stopLoading();
  }, [stopLoading]);

  useEffect(() => {
    return () => {
      if (activeRef.current) {
        activeRef.current = false;
        stopLoading();
      }
    };
  }, [stopLoading]);

  const track = useCallback(
    async <T,>(promise: Promise<T>): Promise<T> => {
      begin();
      try {
        return await promise;
      } finally {
        end();
      }
    },
    [begin, end],
  );

  return { begin, end, track };
}
