import { Bell, HelpCircle } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <span className="text-lg font-bold text-violet-600">IMReady</span>

      <div className="flex items-center gap-5">
        <button aria-label="Notifications" className="text-gray-500 hover:text-gray-700">
          <Bell className="h-5 w-5" />
        </button>
        <button aria-label="Help" className="text-gray-500 hover:text-gray-700">
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="text-right leading-tight">
            <p className="text-xs font-semibold text-gray-800">SYS_ADMIN</p>
            <p className="text-[11px] text-gray-400">192.168.1.104</p>
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