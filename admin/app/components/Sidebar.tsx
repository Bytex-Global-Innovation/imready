"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/students", icon: Users },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Colleges", href: "/colleges", icon: Building2 },
  { label: "Assessments", href: "/assessments", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-[calc(100vh-3.5rem)] w-60 flex-col justify-between border-r border-gray-200 bg-white px-4 py-5">
      <div>
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-md bg-[#153a75]" />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-900">Admin Portal</p>
            <p className="text-[10px] text-gray-400">IMREADY PLATFORM</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
      </div>

      <div className="flex flex-col gap-1 border-t border-gray-100 pt-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          type="button"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}