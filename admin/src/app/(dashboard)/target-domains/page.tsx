"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import ConfirmModal from "@/components/ui/confirm-modal";
import { targetDomainsApi, type TargetDomainItem } from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Target Domains" },
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
  isOther: false,
  sortOrder: 0,
};

const fieldLabel =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#7a94b3]";
const fieldControl =
  "w-full rounded-xl border border-[#cfe0f5] bg-white px-3 py-2.5 text-sm text-[#0b1c30] shadow-sm outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#3b6fb0] focus:ring-2 focus:ring-[#3b6fb0]/15";

export default function TargetDomainsPage() {
  const [domains, setDomains] = useState<TargetDomainItem[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasLoadedRef = useRef(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const loadData = useCallback(async () => {
    if (hasLoadedRef.current) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }
    setError(null);
    try {
      const data = await targetDomainsApi.list();
      setDomains(data.domains);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load domains.");
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function startEdit(domain: TargetDomainItem) {
    setEditingId(domain.id);
    setForm({
      name: domain.name,
      slug: domain.slug,
      description: domain.description || "",
      isActive: domain.isActive,
      isOther: domain.isOther,
      sortOrder: domain.sortOrder ?? 0,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Domain name is required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim(),
        isActive: form.isActive,
        isOther: form.isOther,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editingId) {
        await targetDomainsApi.update(editingId, payload);
      } else {
        await targetDomainsApi.create(payload);
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save domain.");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await targetDomainsApi.delete(deleteId);
      setDeleteId(null);
      if (editingId === deleteId) resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete domain.");
    } finally {
      setIsDeleting(false);
    }
  }

  const deleteTarget = domains.find((d) => d.id === deleteId);
  const activeCount = domains.filter((d) => d.isActive).length;

  return (
    <div className="space-y-5">
      <Breadcrumb items={BREADCRUMBS} />

      <header className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_50%,#dcecff_100%)] px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
        <div className="pointer-events-none absolute -bottom-14 left-16 h-32 w-32 rounded-full bg-[#b7d4f5]/35" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]">
              Signup options
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e4f8c] sm:text-[28px]">
              Target Domains
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5a7aa0]">
              Manage interest domains on student signup. Mark one row as
              &quot;Others&quot; for custom text. Inactive domains stay hidden
              from signup but remain for existing accounts.
            </p>
          </div>
          {!isInitialLoading ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0f5] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#3b6fb0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3b6fb0]" />
              {activeCount} active · {domains.length} total
            </div>
          ) : null}
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="h-fit overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]"
        >
          <div className="border-b border-[#e8eef6] bg-[#f7faff] px-5 py-3.5">
            <h2 className="text-sm font-semibold text-[#1e4f8c]">
              {editingId ? "Edit domain" : "Create domain"}
            </h2>
            <p className="mt-0.5 text-xs text-[#7a94b3]">
              {editingId
                ? "Update this domain, then save."
                : "Add a new interest option for signup."}
            </p>
          </div>

          <div className="space-y-4 p-5">
            <label className="block">
              <span className={fieldLabel}>Name</span>
              <input
                className={fieldControl}
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Artificial Intelligence"
                required
              />
            </label>

            <label className="block">
              <span className={fieldLabel}>Slug (optional)</span>
              <input
                className={fieldControl}
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="ai"
              />
            </label>

            <label className="block">
              <span className={fieldLabel}>Description</span>
              <textarea
                className={fieldControl}
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Short note for admins (optional)"
              />
            </label>

            <label className="block">
              <span className={fieldLabel}>Sort order</span>
              <input
                type="number"
                className={fieldControl}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sortOrder: Number(e.target.value) || 0,
                  }))
                }
              />
            </label>

            <div className="space-y-2 rounded-xl border border-[#e8eef6] bg-[#f7faff] p-3">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#334155]">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-[#cfe0f5] text-[#3b6fb0] focus:ring-[#3b6fb0]/30"
                />
                Active (shown on signup)
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#334155]">
                <input
                  type="checkbox"
                  checked={form.isOther}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isOther: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-[#cfe0f5] text-[#3b6fb0] focus:ring-[#3b6fb0]/30"
                />
                Others option (custom text on signup)
              </label>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#3b6fb0] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e4f8c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {isSaving ? "Saving…" : editingId ? "Update" : "Create"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex cursor-pointer items-center rounded-full border border-[#d7e0ef] bg-white px-4 py-2 text-sm font-semibold text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
          <div className="flex items-center justify-between border-b border-[#e8eef6] bg-[#f7faff] px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-[#1e4f8c]">
                Domain list
              </h2>
              <p className="mt-0.5 text-xs text-[#7a94b3]">
                Ordered for the signup interest picker
              </p>
            </div>
            {isRefreshing ? (
              <span className="text-xs font-medium text-[#7a94b3]">
                Updating…
              </span>
            ) : null}
          </div>

          {error ? (
            <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          {isInitialLoading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="admin-skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : domains.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-[#0b1c30]">
                No domains yet
              </p>
              <p className="mt-1 text-xs text-[#6b7280]">
                Create your first interest domain to show on signup.
              </p>
            </div>
          ) : (
            <div
              className={`transition-opacity duration-200 ${
                isRefreshing ? "pointer-events-none opacity-55" : "opacity-100"
              }`}
            >
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e8eef6] bg-[#f7faff] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a94b3]">
                      <th className="px-5 py-3.5">Name</th>
                      <th className="px-3 py-3.5">Slug</th>
                      <th className="px-3 py-3.5">Order</th>
                      <th className="px-3 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domains.map((domain) => (
                      <tr
                        key={domain.id}
                        className={`border-b border-[#eef2f7] transition-colors last:border-b-0 hover:bg-[#f7faff] ${
                          editingId === domain.id ? "bg-[#f7faff]" : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-[#0b1c30]">
                              {domain.name}
                            </p>
                            {domain.isOther ? (
                              <span className="rounded-full bg-[#eaf3ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#3b6fb0]">
                                Others
                              </span>
                            ) : null}
                          </div>
                          {domain.description ? (
                            <p className="mt-1 line-clamp-2 text-xs text-[#6b7280]">
                              {domain.description}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-4 font-mono text-xs text-[#64748b]">
                          {domain.slug}
                        </td>
                        <td className="px-3 py-4 text-[#475569]">
                          {domain.sortOrder ?? 0}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              domain.isActive
                                ? "bg-[#ecfdf5] text-[#047857]"
                                : "bg-[#f1f5f9] text-[#64748b]"
                            }`}
                          >
                            {domain.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="inline-flex cursor-pointer items-center justify-center rounded-md border border-[#d7e0ef] p-2 text-[#3b6fb0] transition-colors hover:border-[#3b6fb0] hover:bg-[#eaf3ff]"
                              aria-label={`Edit ${domain.name}`}
                              onClick={() => startEdit(domain)}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex cursor-pointer items-center justify-center rounded-md border border-[#d7e0ef] p-2 text-[#94a3b8] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Delete ${domain.name}`}
                              onClick={() => setDeleteId(domain.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 p-4 sm:hidden">
                {domains.map((domain) => (
                  <div
                    key={domain.id}
                    className="rounded-2xl border border-[#d7e0ef] bg-[linear-gradient(160deg,#ffffff_0%,#f7faff_100%)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[#0b1c30]">
                            {domain.name}
                          </p>
                          {domain.isOther ? (
                            <span className="rounded-full bg-[#eaf3ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#3b6fb0]">
                              Others
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 font-mono text-xs text-[#64748b]">
                          {domain.slug} · order {domain.sortOrder ?? 0}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          domain.isActive
                            ? "bg-[#ecfdf5] text-[#047857]"
                            : "bg-[#f1f5f9] text-[#64748b]"
                        }`}
                      >
                        {domain.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-[#e8eef6] pt-3">
                      <button
                        type="button"
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#d7e0ef] px-3 py-1.5 text-xs font-semibold text-[#3b6fb0] hover:bg-[#eaf3ff]"
                        onClick={() => startEdit(domain)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#d7e0ef] px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteId(domain.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete target domain"
        message={`Delete "${deleteTarget?.name || "this domain"}"? Students will no longer see it on signup.`}
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
