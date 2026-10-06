"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import Select from "@/components/ui/select";
import {
  projectCategoriesApi,
  projectsApi,
  type ProjectCategoryItem,
  type ProjectInput,
  type ProjectStatus,
} from "@/lib/api";

type Mode = "create" | "edit";

interface ProjectFormProps {
  mode: Mode;
  projectId?: string;
}

function linesToList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function listToLines(value?: string[]) {
  return (value || []).join("\n");
}

function csvToList(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function listToCsv(value?: string[]) {
  return (value || []).join(", ");
}

export default function ProjectForm({ mode, projectId }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const imageInputRef = useRef<HTMLInputElement>(null);
  const resourceInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<ProjectCategoryItem[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [description, setDescription] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [techStackText, setTechStackText] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [level, setLevel] = useState("Intermediate Level");
  const [overview, setOverview] = useState("");
  const [briefRequirementsText, setBriefRequirementsText] = useState("");
  const [deliverablesText, setDeliverablesText] = useState("");
  const [criteriaText, setCriteriaText] = useState(
    "Functionality|40\nCode quality|30\nDocumentation|30",
  );
  const [resourcesText, setResourcesText] = useState("");
  const [resourceLabel, setResourceLabel] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [status, setStatus] = useState<ProjectStatus>("ACTIVE");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Projects", href: "/projects" },
    { label: isEdit ? "Edit Project" : "New Project" },
  ];

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      setIsLoading(true);
      setError(null);
      try {
        const categoriesRes = await projectCategoriesApi.list(true);
        if (cancelled) return;
        const activeCategories = categoriesRes.categories.filter((c) => c.isActive);
        setCategories(activeCategories);

        if (isEdit && projectId) {
          const project = await projectsApi.getProject(projectId);
          if (cancelled) return;
          setTitle(project.title || project.name);
          setCategory(project.category || activeCategories[0]?.slug || "");
          setIsFree(Boolean(project.isFree));
          setDescription(project.description || "");
          setImageSrc(project.imageSrc || "");
          setImageAlt(project.imageAlt || "");
          setRequirementsText(listToCsv(project.requirements));
          setTechStackText(listToCsv(project.techStack));
          setEstimatedTime(project.estimatedTime || "");
          setLevel(project.level || "Intermediate Level");
          setOverview(project.overview || "");
          setBriefRequirementsText(listToLines(project.briefRequirements));
          setDeliverablesText(
            (project.deliverables || []).map((d) => d.label).join("\n"),
          );
          setCriteriaText(
            (project.evaluationCriteria || [])
              .map((c) => `${c.label}|${c.percent}`)
              .join("\n"),
          );
          setResourcesText(
            (project.resources || [])
              .map((r) => `${r.label}|${r.type}|${r.href}`)
              .join("\n"),
          );
          setTeamSize(project.teamSize || 1);
          setStatus(project.status);
        } else if (activeCategories.length > 0) {
          setCategory(activeCategories[0].slug);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load form.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [isEdit, projectId]);

  function buildPayload(): ProjectInput {
    const evaluationCriteria = linesToList(criteriaText).map((line) => {
      const [label, percentRaw] = line.split("|").map((part) => part.trim());
      return {
        label: label || "Criterion",
        percent: Number(percentRaw) || 0,
      };
    });

    const resources = linesToList(resourcesText).map((line) => {
      const [label, typeRaw, href] = line.split("|").map((part) => part.trim());
      const type = typeRaw === "zip" ? "zip" : "pdf";
      return {
        label: label || "Resource",
        type: type as "pdf" | "zip",
        href: href || "#",
      };
    });

    return {
      title: title.trim(),
      category,
      isFree,
      description: description.trim(),
      imageSrc: imageSrc.trim(),
      imageAlt: imageAlt.trim() || title.trim(),
      requirements: csvToList(requirementsText),
      techStack: csvToList(techStackText),
      estimatedTime: estimatedTime.trim(),
      level: level.trim(),
      overview: overview.trim(),
      briefRequirements: linesToList(briefRequirementsText),
      deliverables: linesToList(deliverablesText).map((label, index) => ({
        id: `d${index + 1}`,
        label,
      })),
      evaluationCriteria,
      resources,
      teamSize: teamSize || 1,
      status,
    };
  }

  async function handleImageUpload(file: File | null) {
    if (!file) return;
    setIsUploadingImage(true);
    setError(null);
    try {
      const uploaded = await projectsApi.uploadFile(file, "image");
      setImageSrc(uploaded.url);
      if (!imageAlt.trim()) setImageAlt(file.name.replace(/\.[^.]+$/, ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function handleResourceUpload(file: File | null) {
    if (!file) return;
    setIsUploadingResource(true);
    setError(null);
    try {
      const uploaded = await projectsApi.uploadFile(file, "resource");
      const label =
        resourceLabel.trim() ||
        file.name.replace(/\.[^.]+$/, "") ||
        "Resource";
      const type = uploaded.type === "zip" ? "zip" : "pdf";
      const line = `${label}|${type}|${uploaded.url}`;
      setResourcesText((prev) => (prev.trim() ? `${prev.trim()}\n${line}` : line));
      setResourceLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resource upload failed.");
    } finally {
      setIsUploadingResource(false);
      if (resourceInputRef.current) resourceInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const payload = buildPayload();

    if (!payload.category) {
      setError("Select a project category.");
      return;
    }
    if (!payload.requirements.length || !payload.techStack.length) {
      setError("Add requirements and tech stack (comma-separated).");
      return;
    }
    if (!payload.briefRequirements.length || !payload.deliverables.length) {
      setError("Add brief requirements and deliverables (one per line).");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && projectId) {
        await projectsApi.updateProject(projectId, payload);
      } else {
        await projectsApi.createProject(payload);
      }
      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-10 text-center text-sm text-gray-400 animate-pulse">
        Loading project…
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbs} />
      <div className="mb-6">
        <h1 className="admin-page-title">
          {isEdit ? "Edit Project" : "New Project"}
        </h1>
        <p className="admin-page-subtitle">
          Fill all details shown on the student projects catalog and brief page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="admin-card space-y-4 p-5">
          <p className="admin-section-label">Basic details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-gray-700">Title</span>
              <input
                className="admin-input w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Category</span>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.length === 0 ? (
                  <option value="">No active categories</option>
                ) : (
                  categories.map((item) => (
                    <option key={item.id} value={item.slug}>
                      {item.name}
                    </option>
                  ))
                )}
              </Select>
              {categories.length === 0 && (
                <span className="mt-1 block text-xs text-amber-600">
                  Create a category under Project Categories first.
                </span>
              )}
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Level</span>
              <input
                className="admin-input w-full"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="Intermediate Level"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Status</span>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="REVIEW">REVIEW</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </Select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Access</span>
              <Select
                value={isFree ? "FREE" : "PREMIUM"}
                onChange={(e) => setIsFree(e.target.value === "FREE")}
              >
                <option value="FREE">FREE - shown in Free Projects</option>
                <option value="PREMIUM">PREMIUM - locked projects</option>
              </Select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">
                Estimated time (in months)
              </span>
              <input
                className="admin-input w-full"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="e.g. 2 months"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">
                Team size (optional)
              </span>
              <input
                type="number"
                min={1}
                className="admin-input w-full"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value) || 1)}
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-gray-700">
                Short description
              </span>
              <textarea
                className="admin-input w-full"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </label>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">
                  Image URL / upload image
                </span>
                <input
                  className="admin-input w-full"
                  value={imageSrc}
                  onChange={(e) => setImageSrc(e.target.value)}
                  placeholder="https://... or upload below"
                />
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  className="admin-btn-outline gap-2"
                  disabled={isUploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {isUploadingImage ? "Uploading…" : "Upload image"}
                </button>
                {imageSrc ? (
                  <span className="truncate text-xs text-gray-500 max-w-sm">
                    {imageSrc}
                  </span>
                ) : null}
              </div>
            </div>

            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-medium text-gray-700">
                Image alt text
              </span>
              <input
                className="admin-input w-full"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="admin-card space-y-4 p-5">
          <p className="admin-section-label">Catalog chips</p>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">
              Requirements (comma-separated)
            </span>
            <textarea
              className="admin-input w-full"
              rows={3}
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder="Python, Basic Data Science, IoT Sensors"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">
              Tech stack (comma-separated)
            </span>
            <textarea
              className="admin-input w-full"
              rows={3}
              value={techStackText}
              onChange={(e) => setTechStackText(e.target.value)}
              placeholder="TensorFlow, Scikit-learn, Raspberry Pi"
              required
            />
          </label>
        </section>

        <section className="admin-card space-y-4 p-5">
          <p className="admin-section-label">Project brief</p>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Overview</span>
            <textarea
              className="admin-input w-full"
              rows={5}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">
              Brief requirements (one per line)
            </span>
            <textarea
              className="admin-input w-full"
              rows={4}
              value={briefRequirementsText}
              onChange={(e) => setBriefRequirementsText(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">
              Deliverables (one per line)
            </span>
            <textarea
              className="admin-input w-full"
              rows={4}
              value={deliverablesText}
              onChange={(e) => setDeliverablesText(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">
              Evaluation criteria (`Label|Percent` per line)
            </span>
            <textarea
              className="admin-input w-full"
              rows={4}
              value={criteriaText}
              onChange={(e) => setCriteriaText(e.target.value)}
              required
            />
          </label>

          <div className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">
                Resources (`Label|pdf|url` per line)
              </span>
              <textarea
                className="admin-input w-full"
                rows={3}
                value={resourcesText}
                onChange={(e) => setResourcesText(e.target.value)}
                placeholder="Starter kit|pdf|/uploads/projects/resources/..."
              />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="block flex-1 text-sm">
                <span className="mb-1 block font-medium text-gray-700">
                  Resource label (for upload)
                </span>
                <input
                  className="admin-input w-full"
                  value={resourceLabel}
                  onChange={(e) => setResourceLabel(e.target.value)}
                  placeholder="Optional label"
                />
              </label>
              <input
                ref={resourceInputRef}
                type="file"
                accept=".pdf,.zip,application/pdf,application/zip"
                className="hidden"
                onChange={(e) =>
                  handleResourceUpload(e.target.files?.[0] || null)
                }
              />
              <button
                type="button"
                className="admin-btn-outline gap-2"
                disabled={isUploadingResource}
                onClick={() => resourceInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {isUploadingResource ? "Uploading…" : "Upload & attach"}
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="admin-btn-outline"
            onClick={() => router.push("/projects")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={isSubmitting || categories.length === 0}
          >
            {isSubmitting
              ? "Saving…"
              : isEdit
                ? "Update Project"
                : "Create Project"}
          </button>
        </div>
      </form>
    </>
  );
}
