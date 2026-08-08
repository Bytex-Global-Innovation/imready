"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import ConfirmModal from "@/components/ui/confirm-modal";
import {
  projectCategoriesApi,
  type ProjectCategoryItem,
} from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Project Categories" },
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
};

export default function ProjectCategoriesPage() {
  const [categories, setCategories] = useState<ProjectCategoryItem[]>([]);
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
      const data = await projectCategoriesApi.list();
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function startEdit(category: ProjectCategoryItem) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      isActive: category.isActive,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Category name is required.");
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
      };
      if (editingId) {
        await projectCategoriesApi.update(editingId, payload);
      } else {
        await projectCategoriesApi.create(payload);
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category.");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await projectCategoriesApi.delete(deleteId);
      setDeleteId(null);
      if (editingId === deleteId) resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category.");
    } finally {
      setIsDeleting(false);
    }
  }

  const deleteTarget = categories.find((c) => c.id === deleteId);

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />

      <div className="mb-6">
        <h1 className="admin-page-title">Project Categories</h1>
        <p className="admin-page-subtitle">
          Manage categories shown in the project form dropdown and student catalog.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="admin-card space-y-4 p-5 h-fit">
          <p className="admin-section-label">
            {editingId ? "Edit category" : "Create category"}
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
              placeholder="artificial-intelligence"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-gray-700">Description</span>
            <textarea
              className="admin-input w-full"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
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
            Active (available in project form)
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
          {error && <div className="border-b border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

          {isLoading ? (
            <div className="p-10 text-center text-sm text-gray-400 animate-pulse">
              Loading categories…
            </div>
          ) : categories.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              No categories yet. Create your first one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 admin-table-header">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((category) => (
                    <tr key={category.id} className="admin-table-row">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{category.name}</div>
                        {category.description ? (
                          <div className="mt-0.5 text-xs text-gray-500">
                            {category.description}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{category.slug}</td>
                      <td className="px-4 py-4">
                        <span
                          className={
                            category.isActive
                              ? "text-xs font-semibold text-emerald-600"
                              : "text-xs font-semibold text-gray-400"
                          }
                        >
                          {category.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            className="admin-icon-btn"
                            aria-label={`Edit ${category.name}`}
                            onClick={() => startEdit(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="cursor-pointer text-gray-400 transition-colors hover:text-red-500"
                            aria-label={`Delete ${category.name}`}
                            onClick={() => setDeleteId(category.id)}
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
        title="Delete category"
        message={`Delete category "${deleteTarget?.name || "this category"}"? Projects using it must be reassigned first.`}
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </>
  );
}
