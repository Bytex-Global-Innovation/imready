"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { ensureFoundationJourneyContent } from "@/features/missions/lib/foundation-journey";
import {
  ensureFoundationProgress,
  hasFoundationProblemSelected,
} from "@/features/missions/lib/mission-progress";
import type { StudentProfile } from "@/lib/api";
import {
  clearStudentSessionCache,
  getCachedStudentSession,
  loadStudentSession,
  type StudentSession,
} from "@/lib/student-session";

type StudentSessionContextValue = {
  student: StudentProfile | null;
  foundationComplete: boolean;
  unpaidProjectsUnlocked: boolean;
  paidProjectsUnlocked: boolean;
  /** Paid industry projects route access (legacy name). */
  projectsUnlocked: boolean;
  ready: boolean;
  refresh: () => Promise<void>;
};

const StudentSessionContext = createContext<StudentSessionContextValue | null>(
  null,
);

interface StudentAuthGateProps {
  children: ReactNode;
  requireProjectsUnlocked?: boolean;
}

function SessionLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
      Checking your session…
    </div>
  );
}

/**
 * Root gate: loads /me once and shares it via context.
 * Nested gates (e.g. projects layout) reuse the same session — no extra /me calls.
 */
export function StudentAuthGate({
  children,
  requireProjectsUnlocked = false,
}: StudentAuthGateProps) {
  const parent = useContext(StudentSessionContext);

  if (parent) {
    return (
      <NestedProjectsGuard requireProjectsUnlocked={requireProjectsUnlocked}>
        {children}
      </NestedProjectsGuard>
    );
  }

  return (
    <StudentSessionProvider requireProjectsUnlocked={requireProjectsUnlocked}>
      {children}
    </StudentSessionProvider>
  );
}

function NestedProjectsGuard({
  children,
  requireProjectsUnlocked,
}: {
  children: ReactNode;
  requireProjectsUnlocked: boolean;
}) {
  const session = useContext(StudentSessionContext);
  const router = useRouter();

  useEffect(() => {
    if (!requireProjectsUnlocked || !session?.ready) return;
    if (!session.paidProjectsUnlocked) {
      router.replace(ROUTES.dashboard);
    }
  }, [
    requireProjectsUnlocked,
    router,
    session?.ready,
    session?.paidProjectsUnlocked,
  ]);

  if (!session?.ready) return <SessionLoading />;
  if (requireProjectsUnlocked && !session.paidProjectsUnlocked) {
    return <SessionLoading />;
  }
  return <>{children}</>;
}

function StudentSessionProvider({
  children,
  requireProjectsUnlocked = false,
}: {
  children: ReactNode;
  requireProjectsUnlocked?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const cached = getCachedStudentSession();
  const [student, setStudent] = useState<StudentProfile | null>(
    () => cached?.student ?? null,
  );
  const [foundationComplete, setFoundationComplete] = useState(
    () => cached?.foundationComplete ?? false,
  );
  const [unpaidProjectsUnlocked, setUnpaidProjectsUnlocked] = useState(
    () => cached?.unpaidProjectsUnlocked ?? false,
  );
  const [paidProjectsUnlocked, setPaidProjectsUnlocked] = useState(
    () => cached?.paidProjectsUnlocked ?? cached?.projectsUnlocked ?? false,
  );
  const [ready, setReady] = useState(() => Boolean(cached));

  const applySession = useCallback((session: StudentSession) => {
    setStudent(session.student);
    setFoundationComplete(session.foundationComplete);
    setUnpaidProjectsUnlocked(session.unpaidProjectsUnlocked);
    setPaidProjectsUnlocked(session.paidProjectsUnlocked);
    setReady(true);
  }, []);

  const refresh = useCallback(async () => {
    const session = await loadStudentSession(true);
    applySession(session);
  }, [applySession]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const session = await loadStudentSession();
        if (cancelled) return;

        ensureFoundationProgress()
          .then((progress) => {
            if (hasFoundationProblemSelected() || progress.foundationProblemStatementId) {
              return ensureFoundationJourneyContent();
            }
            return undefined;
          })
          .catch(() => undefined);

        if (requireProjectsUnlocked && !session.paidProjectsUnlocked) {
          router.replace(ROUTES.dashboard);
          return;
        }

        applySession(session);
      } catch {
        if (cancelled) return;
        clearStudentSessionCache();
        router.replace(
          `${ROUTES.login}?next=${encodeURIComponent(pathname)}`,
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // Session bootstraps once per app-shell mount — not on every in-app navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-once session bootstrap
  }, [applySession, requireProjectsUnlocked, router]);

  const value = useMemo<StudentSessionContextValue>(
    () => ({
      student,
      foundationComplete,
      unpaidProjectsUnlocked,
      paidProjectsUnlocked,
      projectsUnlocked: paidProjectsUnlocked,
      ready,
      refresh,
    }),
    [
      student,
      foundationComplete,
      unpaidProjectsUnlocked,
      paidProjectsUnlocked,
      ready,
      refresh,
    ],
  );

  if (!ready) return <SessionLoading />;

  return (
    <StudentSessionContext.Provider value={value}>
      {children}
    </StudentSessionContext.Provider>
  );
}

/** Reads the shared session from StudentAuthGate — does not call /me again. */
export function useStudentProfile() {
  const session = useContext(StudentSessionContext);

  if (!session) {
    return {
      student: null as StudentProfile | null,
      foundationComplete: false,
      unpaidProjectsUnlocked: false,
      paidProjectsUnlocked: false,
      projectsUnlocked: false,
      loading: true,
      refresh: async () => {},
    };
  }

  return {
    student: session.student,
    foundationComplete: session.foundationComplete,
    unpaidProjectsUnlocked: session.unpaidProjectsUnlocked,
    paidProjectsUnlocked: session.paidProjectsUnlocked,
    projectsUnlocked: session.paidProjectsUnlocked,
    loading: !session.ready,
    refresh: session.refresh,
  };
}

export { clearStudentSessionCache };
