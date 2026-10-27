"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
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

export default function TargetDomainsPage() {
  const [domains, setDomains] = useState<TargetDomainItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await targetDomainsApi.list();
      setDomains(data.domains);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load domains.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
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

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />

      <div className="mb-6">
        <h1 className="admin-page-title">Target Domains</h1>
        <p className="admin-page-subtitle">
          Manage interest domains on the student signup form. Mark one row as
          &quot;Others&quot; so students can type a custom domain. Inactive
          domains are hidden from signup but kept for existing accounts.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="admin-card space-y-4 p-5 h-fit">
          <p className="admin-section-label">
            {editingId ? "Edit domain" : "Create domain"}
          </p>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Name</span>
            <input
              className="admin-input w-full"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Artificial Intelligence"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">
              Slug (optional)
            </span>
            <input
              className="admin-input w-full"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="ai"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Description</span>
            <textarea
              className="admin-input w-full"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Sort order</span>
            <input
              type="number"
              className="admin-input w-full"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  sortOrder: Number(e.target.value) || 0,
                }))
              }
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Active (shown on signup)
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isOther}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isOther: e.target.checked }))
              }
            />
            Others option (custom text on signup)
          </label>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="admin-btn-primary gap-2" disabled={isSaving}>
              <Plus className="h-4 w-4" />
              {isSaving ? "Saving…" : editingId ? "Update" : "Create"}
            </button>
            {editingId ? (
              <button type="button" className="admin-btn-outline" onClick={resetForm}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        <div className="admin-card overflow-hidden">
          {error && (
            <div className="border-b border-red-100 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="p-10 text-center text-sm text-gray-400 animate-pulse">
              Loading domains…
            </div>
          ) : domains.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No domains yet. Create your first one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 admin-table-header">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {domains.map((domain) => (
                    <tr key={domain.id} className="admin-table-row">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">
                          {domain.name}
                          {domain.isOther ? (
                            <span className="ml-2 text-xs font-semibold text-blue-600">
                              OTHERS
                            </span>
                          ) : null}
                        </div>
                        {domain.description ? (
                          <div className="mt-0.5 text-xs text-gray-500">
                            {domain.description}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{domain.slug}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {domain.sortOrder ?? 0}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={
                            domain.isActive
                              ? "text-xs font-semibold text-emerald-600"
                              : "text-xs font-semibold text-gray-400"
                          }
                        >
                          {domain.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            className="admin-icon-btn"
                            aria-label={`Edit ${domain.name}`}
                            onClick={() => startEdit(domain)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="cursor-pointer text-gray-400 transition-colors hover:text-red-500"
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
          )}
        </div>
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
    </>
  );
}
