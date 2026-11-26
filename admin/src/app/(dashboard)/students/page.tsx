"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "@/components/icons";
import Breadcrumb from "@/components/ui/breadcrumb";
import ConfirmModal from "@/components/ui/confirm-modal";
import EditStudentModal, { type StudentEditPayload } from "@/components/ui/edit-student-modal";
import { PanelLoader } from "@/components/ui/line-loader";
import Pagination from "@/components/ui/pagination";
import Select from "@/components/ui/select";
import StudentsTable from "@/components/tables/students-table";
import { useDataLoader } from "@/hooks/use-data-loader";
import { studentsApi, type Student } from "@/lib/api";
import PremiumRequestModal from "@/components/ui/premium-request-modal";

const BREADCRUMBS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Students" },
];

const PAGE_SIZE = 10;

type SubscriptionAction = "approve" | "reject";

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
      `Approve premium for "${name}"? This unlocks premium features for their account.`,
    confirmLabel: "Approve Premium",
    loadingLabel: "Approving…",
    tone: "primary",
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
  const [premiumRequestTarget, setPremiumRequestTarget] =
    useState<Student | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const { begin, end } = useDataLoader();

  const loadData = useCallback(
    async (page: number) => {
      begin();
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
        end();
      }
    },
    [begin, end, search, status, subscriptionStatus],
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
    <div className="space-y-5">
      <Breadcrumb items={BREADCRUMBS} />

      <header className="relative overflow-hidden rounded-2xl border border-[#cfe0f5] bg-[linear-gradient(160deg,#f5f9ff_0%,#eaf3ff_50%,#dcecff_100%)] px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#9ec5f0]/25" />
        <div className="pointer-events-none absolute -bottom-14 left-16 h-32 w-32 rounded-full bg-[#b7d4f5]/35" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5a7aa0]">
              Directory
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1e4f8c] sm:text-[28px]">
              Students
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#5a7aa0]">
              Manage and monitor student enrollments and verifications.
            </p>
          </div>
          {!isLoading ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe0f5] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#3b6fb0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3b6fb0]" />
              {totalEntries} student{totalEntries === 1 ? "" : "s"}
            </div>
          ) : null}
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-[#d7e0ef] bg-white shadow-[0_10px_30px_-24px_rgba(15,35,70,0.35)]">
        <div className="flex flex-col gap-3 border-b border-[#e8eef6] bg-[#f7faff] p-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
          <div className="relative w-full min-w-0 max-w-md flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#7a94b3]">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a94b3]" />
              <input
                type="text"
                placeholder="Search by name, email, or college…"
                className="w-full rounded-xl border border-[#cfe0f5] bg-white py-2.5 pl-9 pr-3 text-sm text-[#0b1c30] shadow-sm outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#3b6fb0] focus:ring-2 focus:ring-[#3b6fb0]/15"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
          </div>
          <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:w-auto sm:min-w-[22rem] sm:grid-cols-2">
            <label className="block min-w-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#7a94b3]">
              <span className="mb-1.5 block">Status</span>
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
            <label className="block min-w-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#7a94b3]">
              <span className="mb-1.5 block">Subscription</span>
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

        {error ? (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        <div className="p-0">
          {isLoading ? (
            <PanelLoader label="Loading students…" />
          ) : (
            <StudentsTable
              students={students}
              onViewPremiumRequest={(student) => {
                setError(null);
                setPremiumRequestTarget(student);
              }}
              onApprovePremium={(student) =>
                openSubscriptionAction(student, "approve")
              }
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

        {!isLoading && totalEntries > 0 ? (
          <div className="border-t border-[#e8eef6] bg-[#f7faff] px-4 py-3 sm:px-5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalEntries={totalEntries}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              entryLabel="students"
            />
          </div>
        ) : null}
      </section>

      <PremiumRequestModal
        open={Boolean(premiumRequestTarget)}
        student={premiumRequestTarget}
        isLoading={isUpdatingSubscription}
        onClose={() => {
          if (!isUpdatingSubscription) setPremiumRequestTarget(null);
        }}
        onApprove={() => {
          if (!premiumRequestTarget) return;
          setPremiumRequestTarget(null);
          openSubscriptionAction(premiumRequestTarget, "approve");
        }}
        onReject={() => {
          if (!premiumRequestTarget) return;
          setPremiumRequestTarget(null);
          openSubscriptionAction(premiumRequestTarget, "reject");
        }}
      />

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
    </div>
  );
}
