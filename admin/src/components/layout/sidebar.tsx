"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/constants/navigation";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/30 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-30 flex h-screen w-60 flex-col
          border-r border-gray-200 bg-white px-4 py-5
          transition-transform duration-200
          sm:static sm:z-auto sm:translate-x-0 sm:transition-none
          ${open ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
        `}
      >
        <nav className="flex flex-col gap-1" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#153a75] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
