"use client";

import { useEffect, useRef } from "react";
import type { College } from "@/lib/api";

interface CollegesTableProps {
  colleges: College[];
}

function StudentProgressBar({ count, capacity }: { count: number; capacity: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const percent = capacity > 0 ? (count / capacity) * 100 : 0;

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
  }, [percent]);

  return (
    <div className="mt-1.5 h-1 w-full max-w-[120px] overflow-hidden rounded-full bg-gray-100">
      <div ref={barRef} className="h-full rounded-full bg-[#153a75]" />
    </div>
  );
}

export default function CollegesTable({ colleges }: CollegesTableProps) {
  if (colleges.length === 0) {
    return (
      <div className="admin-card p-8 text-center text-sm text-gray-400">
        No institutions found.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:hidden">
        {colleges.map((college) => (
          <article
            key={college.id}
            className="admin-card p-4"
          >
            <p className="text-sm font-bold uppercase tracking-wide text-gray-900">{college.name}</p>
            <p className="mt-0.5 text-xs text-gray-400">ID: {college.id}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="admin-section-label">Students</p>
                <p className="text-sm font-semibold text-gray-900">
                  {college.studentCount.toLocaleString("en-IN")}
                </p>
                <StudentProgressBar
                  count={college.studentCount}
                  capacity={college.studentCapacity}
                />
              </div>
              <div className="text-right">
                <p className="admin-section-label">Coordinator</p>
                <p className="text-sm text-gray-700">{college.coordinator}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 admin-table-header">
              <th className="px-4 py-3" scope="col">Institution Name</th>
              <th className="px-4 py-3" scope="col">Students</th>
              <th className="px-4 py-3" scope="col">Coordinator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {colleges.map((college) => (
              <tr key={college.id} className="admin-table-row">
                <td className="px-4 py-4">
                  <p className="font-bold uppercase tracking-wide text-gray-900">{college.name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">ID: {college.id}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-gray-900">
                    {college.studentCount.toLocaleString("en-IN")}
                  </p>
                  <StudentProgressBar
                    count={college.studentCount}
                    capacity={college.studentCapacity}
                  />
                </td>
                <td className="px-4 py-4 text-gray-700">{college.coordinator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
