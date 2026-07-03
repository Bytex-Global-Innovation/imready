import LoginForm from "./components/Loginform";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-lg overflow-hidden rounded-lg border-t-4 border-violet-600 bg-white shadow-sm">
        <div className="px-10 pb-12 pt-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900">IMReady</h1>
          <p className="mt-1 text-xs font-semibold tracking-wide text-violet-600">
            ADMIN CONSOLE
          </p>
          <div className="mt-10 text-left">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}