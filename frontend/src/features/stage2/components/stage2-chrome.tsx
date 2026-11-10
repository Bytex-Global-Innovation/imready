"use client";

import { MaterialSymbol } from "./material-symbol";

export function Stage2Toast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-6 top-20 z-50 flex items-center gap-2 rounded-xl bg-[#002546] px-6 py-3 text-white shadow-xl transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-24 opacity-0"
      }`}
    >
      <MaterialSymbol
        name="check_circle"
        className="text-[20px] text-[#b8d4ff]"
        filled
      />
      <span className="text-sm font-semibold">{message}</span>
    </div>
  );
}
