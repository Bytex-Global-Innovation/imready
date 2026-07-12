import type { Mentor } from "@/lib/api";

interface MentorsTableProps {
  mentors: Mentor[];
}

export default function MentorsTable({ mentors }: MentorsTableProps) {
  if (mentors.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        No mentors found.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {/* Column headers — hidden on mobile */}
      <div className="hidden grid-cols-[2fr_1fr_2fr_2fr] gap-4 px-4 pb-2 sm:grid">
        {["Mentor", "Specialization", "Assigned Project", "Students"].map((h) => (
          <p key={h} className="admin-section-label">
            {h}
          </p>
        ))}
      </div>

      {mentors.map((mentor) => (
        <div key={mentor.id} className="px-4 py-5">
          {/* Desktop row — 4 col grid */}
          <div className="hidden grid-cols-[2fr_1fr_2fr_2fr] gap-4 sm:grid">
            {/* Mentor */}
            <div className="flex items-start gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${mentor.color}`}
              >
                {mentor.initials}
              </div>
              <div>
                <p className="font-semibold text-[#153a75]">{mentor.name}</p>
                <p className="text-[11px] text-gray-400">ID: {mentor.mentorId}</p>
              </div>
            </div>

            {/* Specialization */}
            <div className="flex items-start pt-1">
              <span className="rounded border border-gray-300 px-2.5 py-0.5 text-xs text-gray-600">
                {mentor.specialization}
              </span>
            </div>

            {/* Project */}
            <div className="pt-0.5">
              <p className="text-sm font-medium text-gray-800">{mentor.projectName}</p>
              <p className="text-xs text-gray-400">{mentor.organization}</p>
            </div>

            {/* Students */}
            <div>
              <p className={`mb-2 text-xs font-semibold ${mentor.teamType === "Solo" ? "text-gray-400" : "text-[#153a75]"}`}>
                {mentor.teamType === "Solo" ? "Solo" : `Team of ${mentor.students.length}`}
              </p>
              <div className="flex flex-col gap-1.5">
                {mentor.students.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${s.color}`}
                    >
                      {s.initials}
                    </div>
                    <p className="text-xs text-gray-700">{s.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile card — shown below sm */}
          <div className="flex flex-col gap-3 sm:hidden">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${mentor.color}`}
              >
                {mentor.initials}
              </div>
              <div>
                <p className="font-semibold text-[#153a75]">{mentor.name}</p>
                <p className="text-[11px] text-gray-400">ID: {mentor.mentorId}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-gray-300 px-2.5 py-0.5 text-xs text-gray-600">
                {mentor.specialization}
              </span>
              <span className={`text-xs font-semibold ${mentor.teamType === "Solo" ? "text-gray-400" : "text-[#153a75]"}`}>
                {mentor.teamType === "Solo" ? "Solo" : `Team of ${mentor.students.length}`}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">{mentor.projectName}</p>
              <p className="text-xs text-gray-400">{mentor.organization}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {mentor.students.map((s) => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${s.color}`}
                  >
                    {s.initials}
                  </div>
                  <p className="text-xs text-gray-700">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
