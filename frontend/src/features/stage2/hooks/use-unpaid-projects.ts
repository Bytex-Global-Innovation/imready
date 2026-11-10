"use client";

import { useEffect, useMemo, useState } from "react";
import {
  mapApiProjectToStage2Card,
  type Stage2ProjectCardModel,
} from "@/features/stage2/lib/map-api-project";
import { projectsApi } from "@/lib/api";

export function useUnpaidProjects() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [projects, setProjects] = useState<Stage2ProjectCardModel[]>([]);
  const [filterPills, setFilterPills] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [projectsResult, categoriesResult] = await Promise.all([
          projectsApi.list(undefined, "free"),
          projectsApi.listCategories().catch(() => ({ categories: [] })),
        ]);
        if (cancelled) return;

        const categoryNameBySlug = Object.fromEntries(
          (categoriesResult.categories || []).map((c) => [c.slug, c.name]),
        );
        const mapped = projectsResult.projects.map((project) =>
          mapApiProjectToStage2Card(project, categoryNameBySlug),
        );
        setProjects(mapped);

        const dynamicFilters = Array.from(
          new Set(
            mapped
              .map((project) => project.category)
              .filter((label) => Boolean(label && label.trim())),
          ),
        ).sort((a, b) => a.localeCompare(b));
        setFilterPills(["All", ...dynamicFilters]);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load projects");
        setProjects([]);
        setFilterPills(["All"]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return projects;
    const needle = activeFilter.toLowerCase();
    return projects.filter((project) => {
      const haystack = [
        project.badge.label,
        project.category,
        project.company,
        project.title,
        ...project.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [activeFilter, projects]);

  return {
    activeFilter,
    setActiveFilter,
    projects,
    filtered,
    filterPills,
    loading,
    error,
  };
}
