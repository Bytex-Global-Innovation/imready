"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, User, LogOut, ChevronDown } from "@/components/icons";
import { authApi } from "@/lib/api";

interface TopbarProps {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

export default function Topbar({ onMenuToggle, menuOpen }: TopbarProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen]);

  async function handleLogout() {
    setProfileOpen(false);
    await authApi.logout();
    router.replace("/");
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={onMenuToggle}
          className="cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-100 sm:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <span className="text-base font-bold text-[#153a75] sm:text-lg">ImReady</span>
      </div>

      <div className="relative" ref={profileRef}>
        <button
          type="button"
          aria-label="Open profile menu"
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((open) => !open)}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pr-2.5 pl-1.5 text-gray-700 outline-none ring-0 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-0"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#153a75] text-white">
            <User className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium">Admin</span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
          />
        </button>

        {profileOpen ? (
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-full min-w-[11rem] origin-top overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg transition-[opacity,transform] duration-150 ease-out"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm font-medium text-red-600 outline-none ring-0 transition-colors hover:bg-red-50 focus:outline-none focus:ring-0"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
