"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { btnPrimary, inputBase, labelBase } from "../components/ui";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSentMessage(data.message || "If this is an admin account, a reset link has been sent to its registered email address.");
        return;
      }
      setError(data.error || "Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Forgot password?
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Admin accounts only. Enter your username and we&apos;ll email a reset
        link to the account&apos;s registered address.
      </p>

      {sentMessage ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
            <div className="text-sm text-emerald-800">
              <p className="font-medium">Check your email</p>
              <p className="mt-1">{sentMessage}</p>
              <p className="mt-2 text-xs text-emerald-700">
                The link is valid for 15 minutes and can be used once. Check
                the spam folder if you don&apos;t see it.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className={labelBase}>Admin Username</label>
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

            <button type="submit" disabled={loading} className={`${btnPrimary} mt-2 w-full py-3`}>
              <Mail size={16} />
              {loading ? "Sending..." : "Email me a reset link"}
            </button>
          </form>
        </>
      )}

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={14} />
        Back to sign in
      </Link>
    </AuthLayout>
  );
}
