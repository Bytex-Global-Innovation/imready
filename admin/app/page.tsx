import { Lock } from "lucide-react";
import LoginForm from "./components/Loginform";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50">
      {/* watermark icon, bottom-right */}
      <Lock className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 text-violet-100" />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border-t-4 border-violet-600 bg-white shadow-sm">
        <div className="px-8 pb-8 pt-10 text-center">
          <h1 className="text-xl font-bold text-gray-900">IMReady</h1>
          <p className="mt-1 text-xs font-semibold tracking-wide text-violet-600">
            ADMIN CONSOLE
          </p>

          <div className="mt-8 text-left">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}