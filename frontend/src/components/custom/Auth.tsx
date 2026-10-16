import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EnvelopeSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  ForkKnifeIcon,
  LockKeyIcon,
  SpinnerGapIcon,
  UserIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/api/api";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

type AuthCardType = "signup" | "login";

type Role = "USER" | "ADMIN" | "CHEF" | "MANAGER" | "WAITER";

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-card pr-3 pl-10 text-sm text-foreground shadow-xs transition outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20";

const labelClass =
  "mb-1.5 block text-xs font-semibold tracking-wide text-foreground";

interface ApiSuccess {
  success: boolean;
  message?: string;
  data?: { access_token: string; token_type: string };
}

function getErrorMessage(status: number, body: ApiSuccess, fallback: string) {
  if (body?.message) return body.message;
  if (status === 409) return "This email is already in use.";
  if (status === 404) return "No account found with this email.";
  if (status === 401) return "Invalid email or password.";
  return fallback;
}

export const AuthCard = ({ type }: { type: AuthCardType }) => {
  const isSignup = type === "signup";
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (isSignup && (trimmedName.length < 2 || trimmedName.length > 20)) {
      setError("Name must be between 2 and 20 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (isSignup && password.length > 64) {
      setError("Password must be at most 64 characters long.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isSignup ? "/auth/signup" : "/auth/login";
      const payload = isSignup
        ? { name: trimmedName, email: trimmedEmail, password, role }
        : { email: trimmedEmail, password };

      const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await res.json().catch(() => ({}))) as ApiSuccess;

      if (!res.ok || !body.success || !body.data?.access_token) {
        setError(
          getErrorMessage(res.status, body, "Something went wrong. Try again."),
        );
        return;
      }

      setToken(body.data.access_token);
      navigate("/home", { replace: true });
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-[1.75rem] border border-border/80 bg-card p-7 text-card-foreground shadow-xl shadow-primary/5 sm:p-9">
      <div className="mb-7 flex flex-col items-start gap-4">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
          <ForkKnifeIcon className="size-6" weight="bold" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {isSignup ? "Join the table" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {isSignup
              ? "Create an account to order, book tables and track every bill."
              : "Log in to pick up where you left off."}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-[13px] font-medium text-destructive"
        >
          <WarningCircleIcon className="mt-px size-4 shrink-0" weight="bold" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {isSignup && (
          <div>
            <label htmlFor="auth-name" className={labelClass}>
              Name
            </label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                disabled={loading}
                minLength={2}
                maxLength={20}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className={labelClass}>
            Email
          </label>
          <div className="relative">
            <EnvelopeSimpleIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="auth-password" className={labelClass}>
            Password
          </label>
          <div className="relative">
            <LockKeyIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "Min. 8 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(inputClass, "pr-10")}
              disabled={loading}
              minLength={8}
              maxLength={64}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <EyeSlashIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>
          {isSignup && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Must be 8–64 characters.
            </p>
          )}
        </div>

        {isSignup && (
          <div>
            <label htmlFor="auth-role" className={labelClass}>
              Role
            </label>
            <select
              id="auth-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={loading}
              className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground shadow-xs transition outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
            >
              <option value="USER">User — order & book tables</option>
              <option value="WAITER">Waiter</option>
              <option value="CHEF">Chef</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="mt-2 w-full"
        >
          {loading && <SpinnerGapIcon className="size-4 animate-spin" />}
          {loading
            ? isSignup
              ? "Creating account…"
              : "Logging in…"
            : isSignup
              ? "Sign up"
              : "Login"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </>
        )}
      </p>
    </div>
  );
};
