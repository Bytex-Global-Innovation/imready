"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import {
  CriteriaField,
  ResourcesField,
  TagListField,
  type CriterionRow,
  type ResourceRow,
} from "@/components/ui/easy-list-fields";
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

function newRowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_GAIN = [
  "Work on a real product problem",
  "Build industry-relevant skills",
  "Get verified proof of work",
  "Potential opportunity for paid continuation (Stage 3)",
];

const DEFAULT_CRITERIA: CriterionRow[] = [
  { id: "c-1", label: "Functionality", percent: "40" },
  { id: "c-2", label: "Code quality", percent: "30" },
  { id: "c-3", label: "Documentation", percent: "30" },
];

const LEVEL_OPTIONS = [
  "Beginner Level",
  "Intermediate Level",
  "Advanced Level",
];

export default function ProjectForm({ mode, projectId }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const imageInputRef = useRef<HTMLInputElement>(null);
  const resourceInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<ProjectCategoryItem[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [badge, setBadge] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [projectPriceAmount, setProjectPriceAmount] = useState("");
  const [description, setDescription] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [level, setLevel] = useState("Intermediate Level");
  const [overview, setOverview] = useState("");
  const [briefRequirements, setBriefRequirements] = useState<string[]>([]);
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [criteriaRows, setCriteriaRows] =
    useState<CriterionRow[]>(DEFAULT_CRITERIA);
  const [resourceRows, setResourceRows] = useState<ResourceRow[]>([]);
  const [resourceLabel, setResourceLabel] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [whatYouGain, setWhatYouGain] = useState<string[]>(DEFAULT_GAIN);
  const [cohortStarts, setCohortStarts] = useState("");
  const [mentorshipLabel, setMentorshipLabel] = useState("Verified Industry Partner");
  const [teamFormationNote, setTeamFormationNote] = useState("");
  const [applyOpensAt, setApplyOpensAt] = useState("");
  const [applyClosesAt, setApplyClosesAt] = useState("");
  const [applyWindowDays, setApplyWindowDays] = useState("");
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
          setBadge(project.badge || "");
          setCompanyName(project.companyName || "");
          setIsFree(Boolean(project.isFree));
          setProjectPriceAmount(
            project.projectPriceAmount != null && project.projectPriceAmount > 0
              ? String(project.projectPriceAmount)
              : "",
          );
          setDescription(project.description || "");
          setImageSrc(project.imageSrc || "");
          setImageAlt(project.imageAlt || "");
          setRequirements(project.requirements || []);
          setTechStack(project.techStack || []);
          setEstimatedTime(project.estimatedTime || "");
          setLevel(project.level || "Intermediate Level");
          setOverview(project.overview || "");
          setBriefRequirements(project.briefRequirements || []);
          setDeliverables((project.deliverables || []).map((d) => d.label));
          setCriteriaRows(
            (project.evaluationCriteria || []).length > 0
              ? (project.evaluationCriteria || []).map((c, index) => ({
                  id: `c-${index}`,
                  label: c.label,
                  percent: String(c.percent ?? ""),
                }))
              : DEFAULT_CRITERIA,
          );
          setResourceRows(
            (project.resources || []).map((r, index) => ({
              id: `r-${index}`,
              label: r.label,
              type: r.type === "zip" ? "zip" : "pdf",
              href: r.href,
            })),
          );
          setTeamSize(project.teamSize || 1);
          setWhatYouGain(
            project.whatYouGain?.length ? project.whatYouGain : DEFAULT_GAIN,
          );
          setCohortStarts(project.cohortStarts || "");
          setMentorshipLabel(project.mentorshipLabel || "Verified Industry Partner");
          setTeamFormationNote(project.teamFormationNote || "");
          setApplyOpensAt(project.applyOpensAt || "");
          setApplyClosesAt(project.applyClosesAt || "");
          setApplyWindowDays(
            project.applyWindowDays != null ? String(project.applyWindowDays) : "",
          );
          setStatus(project.status);
        } else if (activeCategories.length > 0) {
          setCategory(activeCategories[0].slug);
          const today = new Date().toISOString().slice(0, 10);
          setApplyOpensAt(today);
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
    const evaluationCriteria = criteriaRows
      .filter((row) => row.label.trim())
      .map((row) => ({
        label: row.label.trim(),
        percent: Number(row.percent) || 0,
      }));

    const resources = resourceRows
      .filter((row) => row.label.trim() || row.href.trim())
      .map((row) => ({
        label: row.label.trim() || "Resource",
        type: row.type,
        href: row.href.trim() || "#",
      }));

    return {
      title: title.trim(),
      category,
      badge: badge.trim(),
      companyName: companyName.trim(),
      isFree,
      projectPriceAmount: isFree
        ? null
        : projectPriceAmount.trim()
          ? Number(projectPriceAmount)
          : null,
      description: description.trim(),
      imageSrc: imageSrc.trim(),
      imageAlt: imageAlt.trim() || title.trim(),
      requirements: requirements.map((item) => item.trim()).filter(Boolean),
      techStack: techStack.map((item) => item.trim()).filter(Boolean),
      estimatedTime: estimatedTime.trim(),
      level: level.trim(),
      overview: overview.trim(),
      briefRequirements: briefRequirements
        .map((item) => item.trim())
        .filter(Boolean),
      deliverables: deliverables
        .map((item) => item.trim())
        .filter(Boolean)
        .map((label, index) => ({
          id: `d${index + 1}`,
          label,
        })),
      evaluationCriteria,
      resources,
      whatYouGain: whatYouGain.map((item) => item.trim()).filter(Boolean),
      cohortStarts: cohortStarts.trim(),
      mentorshipLabel: mentorshipLabel.trim() || "Verified Industry Partner",
      teamFormationNote: teamFormationNote.trim(),
      applyOpensAt: applyOpensAt.trim() || null,
      applyClosesAt: applyClosesAt.trim() || null,
      applyWindowDays: applyWindowDays.trim()
        ? Number(applyWindowDays)
        : null,
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
      setResourceRows((prev) => [
        ...prev,
        {
          id: newRowId("r"),
          label,
          type,
          href: uploaded.url,
        },
      ]);
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
      setError("Add at least one requirement and one tech stack item.");
      return;
    }
    if (!payload.briefRequirements.length || !payload.deliverables.length) {
      setError("Add at least one brief requirement and one deliverable.");
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

  const fieldLabel =
    "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-[#5a7aa0]";
  const fieldHint = "mt-1.5 block text-xs leading-5 text-[#7a94b3]";
  const fieldControl =
    "w-full rounded-xl border border-[#cfe0f5] bg-white px-3.5 py-2.5 text-sm text-[#0b1c30] shadow-sm outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#3b6fb0] focus:ring-2 focus:ring-[#3b6fb0]/15";
  const sectionCard =
    "overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]";
  const sectionHeader =
    "border-b border-[#e8eef6] bg-[#f7faff] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]";
  const outlineBtn =
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#cfe0f5] bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f8c] transition-colors hover:bg-[#eaf3ff] disabled:cursor-not-allowed disabled:opacity-60";
  const primaryBtn =
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3b6fb0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2f5f99] disabled:cursor-not-allowed disabled:opacity-60";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="admin-skeleton h-28 rounded-2xl" />
        <div className="admin-skeleton h-64 rounded-2xl" />
        <div className="admin-skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Breadcrumb items={breadcrumbs} />

      <header className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_50%,#dcecff_100%)] px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
        <div className="pointer-events-none absolute -bottom-14 left-16 h-32 w-32 rounded-full bg-[#b7d4f5]/35" />
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]">
            Project editor
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e4f8c] sm:text-[28px]">
            {isEdit ? "Edit Project" : "New Project"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5a7aa0]">
            Fill all details shown on the student projects catalog and brief page.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <section className={sectionCard}>
          <div className={sectionHeader}>Basic details</div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className={fieldLabel}>Title</span>
              <input
                className={fieldControl}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <label className="block text-sm">
              <span className={fieldLabel}>Company / partner name</span>
              <input
                className={fieldControl}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. ABC Technologies"
              />
            </label>

            <label className="block text-sm">
              <span className={fieldLabel}>Card label overlay</span>
              <input
                className={fieldControl}
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. HEALTH-TECH, SMART CITIES, Sustainability"
              />
              <span className={fieldHint}>
                Shown on the project card image (and detail hero). Leave blank to use the
                category name.
              </span>
            </label>

            <label className="block text-sm">
              <span className={fieldLabel}>Category</span>
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
              {categories.length === 0 ? (
                <span className="mt-1.5 block text-xs text-amber-600">
                  Create a category under Project Categories first.
                </span>
              ) : null}
            </label>

            <label className="block text-sm">
              <span className={fieldLabel}>Level</span>
              <Select
                value={LEVEL_OPTIONS.includes(level) ? level : "Intermediate Level"}
                onChange={(e) => setLevel(e.target.value)}
              >
                {LEVEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block text-sm">
              <span className={fieldLabel}>Status</span>
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
              <span className={fieldLabel}>Access</span>
              <Select
                value={isFree ? "FREE" : "PREMIUM"}
                onChange={(e) => setIsFree(e.target.value === "FREE")}
              >
                <option value="FREE">UNPAID - shown in Unpaid Projects</option>
                <option value="PREMIUM">PREMIUM - locked projects</option>
              </Select>
            </label>

            {!isFree ? (
              <label className="block text-sm sm:col-span-2">
                <span className={fieldLabel}>Project value (INR)</span>
                <input
                  className={`${fieldControl} max-w-xs`}
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={projectPriceAmount}
                  onChange={(e) => setProjectPriceAmount(e.target.value)}
                  placeholder="e.g. 15000"
                />
                <span className={fieldHint}>
                  Optional. Shown to students on paid (premium) projects only.
                </span>
              </label>
            ) : null}

            <label className="block text-sm">
              <span className={fieldLabel}>Duration shown to students</span>
              <input
                className={fieldControl}
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="e.g. Up to 30 days or 2 months"
              />
              <span className={fieldHint}>
                Use whatever wording students should see on the project card.
              </span>
            </label>

            <label className="block text-sm">
              <span className={fieldLabel}>Team size (optional)</span>
              <input
                type="number"
                min={1}
                className={fieldControl}
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value) || 1)}
              />
            </label>

            <label className="block text-sm">
              <span className={fieldLabel}>Cohort starts</span>
              <input
                className={fieldControl}
                value={cohortStarts}
                onChange={(e) => setCohortStarts(e.target.value)}
                placeholder="e.g. Next Monday or 2026-04-01"
              />
            </label>

            <label className="block text-sm">
              <span className={fieldLabel}>Mentorship label</span>
              <input
                className={fieldControl}
                value={mentorshipLabel}
                onChange={(e) => setMentorshipLabel(e.target.value)}
                placeholder="Verified Industry Partner"
              />
            </label>

            <label className="block text-sm">
              <span className={fieldLabel}>Apply opens on</span>
              <input
                type="date"
                className={fieldControl}
                value={applyOpensAt}
                onChange={(e) => setApplyOpensAt(e.target.value)}
              />
            </label>

            <label className="block text-sm">
              <span className={fieldLabel}>Apply closes on</span>
              <input
                type="date"
                className={fieldControl}
                value={applyClosesAt}
                onChange={(e) => setApplyClosesAt(e.target.value)}
              />
            </label>

            <label className="block text-sm">
              <span className={fieldLabel}>Or apply window (days)</span>
              <input
                type="number"
                min={1}
                max={365}
                className={fieldControl}
                value={applyWindowDays}
                onChange={(e) => setApplyWindowDays(e.target.value)}
                placeholder="e.g. 14"
              />
              <span className={fieldHint}>
                Used when close date is empty. Counts from open date.
              </span>
            </label>

            <div className="sm:col-span-2">
              <TagListField
                label="What you'll gain"
                hint="Add each benefit as a separate item. Press Add or Enter after typing."
                values={whatYouGain}
                onChange={setWhatYouGain}
                placeholder="e.g. Mentor feedback"
              />
            </div>

            <label className="block text-sm sm:col-span-2">
              <span className={fieldLabel}>Team formation note (optional)</span>
              <input
                className={fieldControl}
                value={teamFormationNote}
                onChange={(e) => setTeamFormationNote(e.target.value)}
                placeholder="e.g. Apply, then form your team within the allowed size."
              />
            </label>

            <label className="block text-sm sm:col-span-2">
              <span className={fieldLabel}>Short description</span>
              <textarea
                className={fieldControl}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </label>

            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm">
                <span className={fieldLabel}>Image URL / upload image</span>
                <input
                  className={fieldControl}
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
                  className={outlineBtn}
                  disabled={isUploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {isUploadingImage ? "Uploading…" : "Upload image"}
                </button>
                {imageSrc ? (
                  <span className="max-w-sm truncate text-xs text-[#7a94b3]">
                    {imageSrc}
                  </span>
                ) : null}
              </div>
            </div>

            <label className="block text-sm sm:col-span-2">
              <span className={fieldLabel}>Image alt text</span>
              <input
                className={fieldControl}
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className={sectionCard}>
          <div className={sectionHeader}>Catalog chips</div>
          <div className="space-y-4 p-5">
            <TagListField
              label="Requirements"
              hint="Skills or background students should have. Add one at a time."
              values={requirements}
              onChange={setRequirements}
              placeholder="e.g. Research"
            />
            <TagListField
              label="Tech stack"
              hint="Tools students will use. Add one at a time."
              values={techStack}
              onChange={setTechStack}
              placeholder="e.g. Figma"
            />
          </div>
        </section>

        <section className={sectionCard}>
          <div className={sectionHeader}>Project brief</div>
          <div className="space-y-4 p-5">
            <label className="block text-sm">
              <span className={fieldLabel}>Overview</span>
              <textarea
                className={fieldControl}
                rows={5}
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                required
              />
            </label>
            <TagListField
              label="Brief requirements"
              hint="What students need to do. Add each step separately."
              values={briefRequirements}
              onChange={setBriefRequirements}
              placeholder="e.g. Map the current experience"
            />
            <TagListField
              label="Deliverables"
              hint="What students must submit. Add each deliverable separately."
              values={deliverables}
              onChange={setDeliverables}
              placeholder="e.g. Problem brief"
            />
            <CriteriaField rows={criteriaRows} onChange={setCriteriaRows} />
            <ResourcesField
              rows={resourceRows}
              onChange={setResourceRows}
              uploadSlot={
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    className={fieldControl}
                    value={resourceLabel}
                    onChange={(e) => setResourceLabel(e.target.value)}
                    placeholder="Optional label for uploaded file"
                  />
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
                    className={outlineBtn}
                    disabled={isUploadingResource}
                    onClick={() => resourceInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {isUploadingResource ? "Uploading…" : "Upload & attach"}
                  </button>
                </div>
              }
            />
          </div>
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-[#d7e0ef] bg-[#f7faff] p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={outlineBtn}
            onClick={() => router.push("/projects")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={primaryBtn}
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
    </div>
  );
}
