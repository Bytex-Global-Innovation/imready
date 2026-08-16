"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import ConfirmModal from "@/components/ui/confirm-modal";
import EditStudentModal, { type StudentEditPayload } from "@/components/ui/edit-student-modal";
import Pagination from "@/components/ui/pagination";
import Select from "@/components/ui/select";
import StudentsTable from "@/components/tables/students-table";
import { studentsApi, type Student } from "@/lib/api";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Students Registry" },
];

const PAGE_SIZE = 10;

type SubscriptionAction = "approve" | "undo" | "reject";

const SUBSCRIPTION_CONFIRM: Record<
  SubscriptionAction,
  {
    title: string;
    message: (name: string) => string;
    confirmLabel: string;
    loadingLabel: string;
    tone: "primary" | "danger";
  }
> = {
  approve: {
    title: "Approve premium access",
    message: (name) =>
      `Approve premium for "${name}"? This unlocks Bytex premium features for their account.`,
    confirmLabel: "Approve Premium",
    loadingLabel: "Approving…",
    tone: "primary",
  },
  undo: {
    title: "Undo premium approval",
    message: (name) =>
      `Undo premium for "${name}"? Status goes back to Premium Pending and premium features lock again.`,
    confirmLabel: "Undo Approval",
    loadingLabel: "Undoing…",
    tone: "danger",
  },
  reject: {
    title: "Reject premium subscription",
    message: (name) =>
      `Reject premium for "${name}"? They will be moved back to the Free plan.`,
    confirmLabel: "Reject Premium",
    loadingLabel: "Rejecting…",
    tone: "danger",
  },
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [subscriptionStatus, setSubscriptionStatus] = useState("ALL");

  const [subscriptionTarget, setSubscriptionTarget] = useState<Student | null>(
    null,
  );
  const [subscriptionAction, setSubscriptionAction] =
    useState<SubscriptionAction | null>(null);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const loadData = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await studentsApi.getStudents(page, {
          search,
          status,
          subscriptionStatus,
        });
        setStudents(data.students);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setTotalEntries(data.total);
        setPageSize(data.pageSize || PAGE_SIZE);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load students.");
      } finally {
        setIsLoading(false);
      }
    },
    [search, status, subscriptionStatus],
  );

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const handlePageChange = (newPage: number) => {
    loadData(newPage);
  };

  function openSubscriptionAction(student: Student, action: SubscriptionAction) {
    setError(null);
    setSubscriptionTarget(student);
    setSubscriptionAction(action);
  }

  async function confirmSubscriptionAction() {
    if (!subscriptionTarget || !subscriptionAction) return;
    setIsUpdatingSubscription(true);
    setError(null);
    setMessage(null);
    try {
      const apiAction =
        subscriptionAction === "approve"
          ? studentsApi.approvePremium
          : subscriptionAction === "undo"
            ? studentsApi.undoPremium
            : studentsApi.rejectPremium;
      const result = await apiAction(subscriptionTarget.id);
      setMessage(result.message);
      setSubscriptionTarget(null);
      setSubscriptionAction(null);
      await loadData(currentPage);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update subscription.",
      );
    } finally {
      setIsUpdatingSubscription(false);
    }
  }

  async function saveStudent(payload: StudentEditPayload) {
    if (!editTarget) return;
    setIsSavingEdit(true);
    setEditError(null);
    setError(null);
    setMessage(null);
    try {
      const result = await studentsApi.updateStudent(editTarget.id, payload);
      setMessage(result.message);
      setEditTarget(null);
      await loadData(currentPage);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update student.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  return (
    <>
      <Breadcrumb items={BREADCRUMBS} />
      
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-page-title">Students Registry</h1>
          <p className="admin-page-subtitle">Manage and monitor student enrollments and verifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="admin-btn-outline" type="button">Export CSV</button>
          <button className="admin-btn-primary gap-2" type="button">
            <Plus className="h-4 w-4" />
            Add Student
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full min-w-0 max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="admin-input-icon w-full"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
          <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:w-auto sm:min-w-[22rem] sm:grid-cols-2">
            <label className="block min-w-0 text-sm text-gray-500">
              <span className="mb-1 block">Status</span>
              <Select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="FLAGGED">Flagged</option>
              </Select>
            </label>
            <label className="block min-w-0 text-sm text-gray-500">
              <span className="mb-1 block">Subscription</span>
              <Select
                value={subscriptionStatus}
                onChange={(event) => {
                  setSubscriptionStatus(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All</option>
                <option value="FREE">Free</option>
                <option value="PREMIUM_PENDING">Premium Pending</option>
                <option value="PREMIUM">Premium</option>
              </Select>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-500">{error}</div>
        )}
        {message && (
          <div className="p-4 text-sm text-emerald-600">{message}</div>
        )}

        <div className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Loading students...</div>
          ) : (
            <StudentsTable
              students={students}
              onApprovePremium={(student) =>
                openSubscriptionAction(student, "approve")
              }
              onUndoPremium={(student) => openSubscriptionAction(student, "undo")}
              onRejectPremium={(student) =>
                openSubscriptionAction(student, "reject")
              }
              onEditStudent={(student) => {
                setEditError(null);
                setEditTarget(student);
              }}
              actingId={
                isUpdatingSubscription ? subscriptionTarget?.id ?? null : null
              }
            />
          )}
        </div>

        {!isLoading && totalEntries > 0 && (
          <div className="p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalEntries={totalEntries}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              entryLabel="students"
            />
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(subscriptionTarget && subscriptionAction)}
        tone={
          subscriptionAction
            ? SUBSCRIPTION_CONFIRM[subscriptionAction].tone
            : "primary"
        }
        title={
          subscriptionAction
            ? SUBSCRIPTION_CONFIRM[subscriptionAction].title
            : ""
        }
        message={
          subscriptionAction
            ? SUBSCRIPTION_CONFIRM[subscriptionAction].message(
                subscriptionTarget?.studentName || "this student",
              )
            : ""
        }
        confirmLabel={
          subscriptionAction
            ? SUBSCRIPTION_CONFIRM[subscriptionAction].confirmLabel
            : "Confirm"
        }
        loadingLabel={
          subscriptionAction
            ? SUBSCRIPTION_CONFIRM[subscriptionAction].loadingLabel
            : "Working…"
        }
        isLoading={isUpdatingSubscription}
        onClose={() => {
          if (!isUpdatingSubscription) {
            setSubscriptionTarget(null);
            setSubscriptionAction(null);
          }
        }}
        onConfirm={confirmSubscriptionAction}
      />

      <EditStudentModal
        open={Boolean(editTarget)}
        student={editTarget}
        isSaving={isSavingEdit}
        error={editError}
        onClose={() => {
          if (!isSavingEdit) {
            setEditTarget(null);
            setEditError(null);
          }
        }}
        onSave={saveStudent}
      />
    </>
  );
}
