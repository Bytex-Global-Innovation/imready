"use client";

import Image from "next/image";
import Link from "next/link";
import { FOUNDATION_VERIFICATION_DETAIL_LOCKED_MESSAGE } from "@/constants/project-access";
import { ROUTES } from "@/constants/routes";
import { MaterialSymbol } from "./material-symbol";
import type { Stage2ProjectCardModel } from "@/features/stage2/lib/map-api-project";

export function Stage2ProjectCard({
  project,
  detailsLocked = false,
}: {
  project: Stage2ProjectCardModel;
  detailsLocked?: boolean;
}) {
  const href = ROUTES.stage2ProjectDetail(project.id);
  const isRemote =
    project.image.startsWith("http") || project.image.startsWith("blob:");

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
      {detailsLocked ? (
        <div className="flex flex-col gap-4">{body}</div>
      ) : (
        <Link href={href} className="flex flex-col gap-4">
          {body}
        </Link>
      )}
      <div className="flex items-center justify-between gap-2 pt-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[#42474f]">
            <MaterialSymbol name="group" className="text-[18px] text-[#153a75]" />
            <span>{project.teamSize}</span>
          </div>
          {detailsLocked ? (
            <span className="text-[11px] font-semibold text-[#153a75]">
              Details locked until verification
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
        {detailsLocked ? (
          <span
            title={FOUNDATION_VERIFICATION_DETAIL_LOCKED_MESSAGE}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-[#737780]"
          >
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
