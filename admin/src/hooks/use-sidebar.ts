"use client";

import { useState, useCallback } from "react";

/**
 * Manages sidebar open/close state for the admin shell.
 * Extracted so the dashboard layout handles it once rather than every page.
 */
export function useSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return { sidebarOpen, toggleSidebar, closeSidebar } as const;
}
