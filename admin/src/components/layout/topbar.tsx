"use client";

import { Search, Menu, X } from "@/components/icons";

interface TopbarProps {
  searchPlaceholder?: string;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

export default function Topbar({ searchPlaceholder, onMenuToggle, menuOpen }: TopbarProps) {
  return (
    <header className="flex h-14 items-center border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={onMenuToggle}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 sm:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <span className="text-base font-bold text-[#153a75] sm:text-lg">ImReady</span>

        {searchPlaceholder && (
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="admin-input-icon w-48 lg:w-56"
            />
          </div>
        )}
      </div>
    </header>
  );
}
