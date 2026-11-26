import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#153a75] transition-opacity hover:opacity-90"
            aria-label="Back to ImReady home"
          >
            <span className="text-xl font-bold text-white">IR</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to access the ImReady administrative dashboard.
          </p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/" className="font-medium text-[#153a75] hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
