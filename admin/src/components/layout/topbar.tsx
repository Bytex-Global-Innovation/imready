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
    <header className="flex h-14 items-center justify-between border-b border-[#cfe0f5] bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={onMenuToggle}
          className="cursor-pointer rounded-xl p-1.5 text-[#5a7aa0] transition-colors hover:bg-[#eaf3ff] hover:text-[#1e4f8c] sm:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div>
          <p className="text-base font-bold tracking-tight text-[#1e4f8c] sm:text-lg">
            ImReady
          </p>
          <p className="hidden text-[11px] font-medium text-[#7a94b3] sm:block">
            Admin console
          </p>
        </div>
      </div>

      <div className="relative" ref={profileRef}>
        <button
          type="button"
          aria-label="Open profile menu"
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((open) => !open)}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-[#cfe0f5] bg-[#f7faff] py-1.5 pr-2.5 pl-1.5 text-[#1e4f8c] outline-none transition-colors hover:bg-[#eaf3ff]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b6fb0] text-white">
            <User className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">Admin</span>
          <ChevronDown
            className={`h-4 w-4 text-[#7a94b3] transition-transform ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {profileOpen ? (
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-full min-w-[11rem] origin-top overflow-hidden rounded-xl border border-[#d7e0ef] bg-white py-1 shadow-[0_12px_30px_-18px_rgba(15,35,70,0.45)]"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleLogout()}
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-red-600 outline-none transition-colors hover:bg-red-50"
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
