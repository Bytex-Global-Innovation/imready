"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "@/components/icons";
import { NAV_GROUPS } from "@/constants/navigation";
import { authApi } from "@/lib/api";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

function matchesPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    onClose?.();
    try {
      await authApi.logout();
    } finally {
      router.replace("/");
    }
  }

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    function handleScroll() {
      setIsScrolling(true);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 450);
    }

    nav.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      nav.removeEventListener("scroll", handleScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const activePath = pendingHref ?? pathname;

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-20 bg-[#0b1c30]/35 backdrop-blur-[1px] sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`
          fixed left-0 top-0 z-30 flex h-dvh w-[17.5rem] flex-col
          border-r border-[#cfe0f5] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_42%,#f5f9ff_100%)]
          px-3 py-3.5
          transition-transform duration-200 ease-out
          sm:static sm:z-auto sm:h-full sm:max-h-full sm:translate-x-0 sm:self-stretch sm:transition-none
          ${open ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
        `}
      >
        <nav
          ref={navRef}
          className={`admin-sidebar-scroll min-h-0 flex-1 overflow-y-auto pb-3 pr-1 ${
            isScrolling ? "is-scrolling" : ""
          }`}
          aria-label="Admin navigation"
        >
          <div className="flex flex-col gap-2.5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aaec8]">
                  {group.label}
                </p>
                <ul className="flex flex-col gap-1">
                  {group.items.map(({ label, href, icon: Icon }) => {
                    const isActive = matchesPath(activePath, href);
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          prefetch
                          onClick={() => {
                            if (!matchesPath(pathname, href)) {
                              setPendingHref(href);
                            }
                            onClose?.();
                          }}
                          aria-current={isActive ? "page" : undefined}
                          className={`group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-sm font-semibold transition-colors duration-150 ${
                            isActive
                              ? "bg-[#3b6fb0] text-white shadow-[0_8px_18px_-12px_rgba(59,111,176,0.9)]"
                              : "text-[#4a6485] hover:bg-[#eaf3ff] hover:text-[#1e4f8c]"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors ${
                              isActive
                                ? "bg-white/15 text-white"
                                : "bg-[#eaf3ff] text-[#3b6fb0] group-hover:bg-white"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="truncate">{label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-[#e8eef6] bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] pt-3 pb-1">
          <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9aaec8]">
            Session
          </p>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-sm font-semibold text-[#b91c1c] transition-colors duration-150 hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#fee2e2] text-[#b91c1c] transition-colors group-hover:bg-white">
              <LogOut className="h-3.5 w-3.5" />
            </span>
            <span className="truncate">
              {isLoggingOut ? "Logging out…" : "Logout"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
