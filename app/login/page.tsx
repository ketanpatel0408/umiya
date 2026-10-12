"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, AlertCircle, Receipt, CheckCircle2 } from "lucide-react";
import PasswordInput from "@/components/common/PasswordInput";
import { btnPrimary, inputBase, labelBase } from "../components/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const next = searchParams.get("next") || "/";
        router.push(next);
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error || "Invalid username or password");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 bg-white">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
            <Receipt size={20} />
          </div>
          <span className="text-lg font-semibold">Umiya GST Portal</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            GST invoicing, simplified for your business.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Create compliant tax invoices, track every bill by financial year,
            and print professional PDFs in seconds.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-200">
            {[
              "Automatic CGST / SGST / IGST calculation",
              "Financial-year wise invoice numbering",
              "Saved buyer details for faster billing",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="shrink-0 text-indigo-400" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Umiya GST Portal
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Receipt size={20} />
            </div>
            <span className="text-lg font-semibold text-slate-900">Umiya GST Portal</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to your account to continue.
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className={labelBase}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Enter your username"
                required
                className={`${inputBase} py-2.5`}
              />
            </div>
            <PasswordInput
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />

            <button type="submit" disabled={loading} className={`${btnPrimary} mt-2 w-full py-3`}>
              <LogIn size={16} />
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
