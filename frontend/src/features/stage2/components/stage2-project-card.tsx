"use client";

import Image from "next/image";
import Link from "next/link";
import { UNPAID_PROJECTS_LOCKED_MESSAGE } from "@/constants/project-access";
import { ROUTES } from "@/constants/routes";
import { MaterialSymbol } from "./material-symbol";
import type { Stage2ProjectCardModel } from "@/features/stage2/lib/map-api-project";

export type Stage2ProjectCardAccess = "open" | "preview" | "locked";

export function Stage2ProjectCard({
  project,
  access,
  detailsLocked = false,
}: {
  project: Stage2ProjectCardModel;
  access?: Stage2ProjectCardAccess;
  /** @deprecated Prefer `access`. */
  detailsLocked?: boolean;
}) {
  const resolvedAccess: Stage2ProjectCardAccess =
    access ?? (detailsLocked ? "locked" : "open");
  const href = ROUTES.stage2ProjectDetail(project.id);
  const isRemote =
    project.image.startsWith("http") || project.image.startsWith("blob:");
  const isLocked = resolvedAccess === "locked";
  const isPreview = resolvedAccess === "preview";

  const body = (
    <>
      <div className="relative h-40 w-full overflow-hidden rounded-lg bg-[#e5eeff]">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
          unoptimized={isRemote}
        />
        <div
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${project.badge.className}`}
        >
          {project.badge.label}
        </div>
        {isPreview ? (
          <div className="absolute right-2 top-2 rounded-full bg-[#002546]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Featured preview
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] text-[#737780]">
          <span className="flex items-center gap-1 font-semibold text-[#002546]">
            <MaterialSymbol name="apartment" className="text-[15px] text-[#153a75]" />
            {project.company}
          </span>
          <span className="flex items-center gap-1">
            <MaterialSymbol name="schedule" className="text-[15px]" />
            {project.duration}
          </span>
        </div>
        <h3 className="text-lg font-semibold leading-[26px] text-[#002546] transition-colors group-hover:text-[#001c66]">
          {project.title}
        </h3>
        <p className="line-clamp-2 text-xs leading-4 text-[#42474f]">{project.description}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-[#e5eeff] px-2 py-0.5 text-[11px] text-[#42474f]"
          >
            {tag}
          </span>
        ))}
      </div>
    </>
  );

  return (
    <article className="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
      {isLocked ? (
        <div className="pointer-events-none flex select-none flex-col gap-4 blur-[2.5px]">
          {body}
        </div>
      ) : (
        <Link href={href} className="flex flex-col gap-4">
          {body}
        </Link>
      )}

      {isLocked ? (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#f8f9ff]/70 px-6 text-center backdrop-blur-[1px]"
          aria-label="Project locked"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#002546] text-white shadow-md">
            <MaterialSymbol name="lock" className="text-[20px]" />
          </span>
          <p className="text-sm font-semibold text-[#002546]">Locked</p>
          <p className="max-w-[16rem] text-xs leading-relaxed text-[#42474f]">
            {UNPAID_PROJECTS_LOCKED_MESSAGE}
          </p>
        </div>
      ) : null}

      <div className="relative z-20 flex items-center justify-between gap-2 pt-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[#42474f]">
            <MaterialSymbol name="group" className="text-[18px] text-[#153a75]" />
            <span>{project.teamSize}</span>
          </div>
          {isLocked ? (
            <span className="text-[11px] font-semibold text-[#153a75]">
              Complete Foundation to unlock
            </span>
          ) : isPreview ? (
            <span className="text-[11px] font-semibold text-[#153a75]">
              Read-only preview · Apply after Foundation
            </span>
          ) : project.applicationsClosed ? (
            <span className="text-[11px] font-semibold text-[#ba1a1a]">Applications closed</span>
          ) : project.remainingDays != null ? (
            <span className="text-[11px] font-semibold text-[#153a75]">
              {project.remainingDays === 0
                ? "Last day to apply"
                : `${project.remainingDays} day${project.remainingDays === 1 ? "" : "s"} left`}
            </span>
          ) : null}
        </div>
        {isLocked ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-[#737780]">
            <MaterialSymbol name="lock" className="text-[18px]" />
          </span>
        ) : (
          <Link
            href={href}
            aria-label={`View ${project.title}`}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#e5eeff] text-[#002546] transition-all hover:bg-[#153a75] hover:text-white"
          >
            <MaterialSymbol name="arrow_forward" className="text-[18px]" />
          </Link>
        )}
      </div>
    </article>
  );
}
