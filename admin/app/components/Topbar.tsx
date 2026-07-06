"use client";

import { Bell, HelpCircle, Search, Menu, X } from "lucide-react";
import { useState } from "react";

interface TopbarProps {
  searchPlaceholder?: string;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

export default function Topbar({ searchPlaceholder, onMenuToggle, menuOpen }: TopbarProps) {
  return (
    <header className="z-40 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* hamburger - only visible on mobile */}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={onMenuToggle}
          className="cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-100 sm:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <span className="text-base font-bold text-[#153a75] sm:text-lg">IMReady</span>

        {searchPlaceholder && (
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="w-48 rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#153a75] focus:outline-none focus:ring-1 focus:ring-[#153a75] lg:w-56"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button aria-label="Notifications" className="cursor-pointer text-gray-500 hover:text-gray-700">
          <Bell className="h-5 w-5" />
        </button>
        <button aria-label="Help" className="hidden cursor-pointer text-gray-500 hover:text-gray-700 sm:block">
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-xs font-semibold text-gray-800">ADMIN_01</p>
            <p className="text-[11px] font-medium text-emerald-500">AUTHORIZED</p>
          </div>
          <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
            <img
              src="/avatar-placeholder.png"
              alt="Admin avatar"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}