"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, LogIn } from "lucide-react";
import PasswordInput from "@/components/common/PasswordInput";
import AuthLayout from "../components/AuthLayout";
import { btnPrimary } from "../components/ui";

type LinkState =
  | { status: "checking" }
  | { status: "invalid"; message: string }
  | { status: "ready"; username: string }
  | { status: "done" };

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<LinkState>(() =>
    token ? { status: "checking" } : { status: "invalid", message: "This reset link is invalid." }
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        setState(
          res.ok && data.valid
            ? { status: "ready", username: data.username }
            : { status: "invalid", message: data.error || "This reset link is invalid or has expired." }
        );
      })
      .catch(() => {
        if (active) setState({ status: "invalid", message: "Unable to verify the reset link." });
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmNewPassword }),
      });
      if (res.ok) {
        setState({ status: "done" });
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(
        Array.isArray(data.details) ? data.details.join(", ") : data.error || "Failed to reset password."
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Reset password
      </h1>

      {state.status === "checking" && (
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
          Verifying your reset link...
        </div>
      )}

      {state.status === "invalid" && (
        <>
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{state.message}</span>
          </div>
          <Link href="/forgot-password" className={`${btnPrimary} mt-6 w-full py-3`}>
            Request a new link
          </Link>
        </>
      )}

      {state.status === "ready" && (
        <>
          <p className="mt-1 text-sm text-slate-500">
            Set a new password for{" "}
            <span className="font-medium text-slate-900">@{state.username}</span>.
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              placeholder="At least 8 characters, a letter and a number"
              required
            />
            <PasswordInput
              label="Confirm New Password"
              value={confirmNewPassword}
              onChange={setConfirmNewPassword}
              autoComplete="new-password"
              placeholder="Re-enter the new password"
              required
            />
            <button type="submit" disabled={saving} className={`${btnPrimary} mt-2 w-full py-3`}>
              <KeyRound size={16} />
              {saving ? "Saving..." : "Set new password"}
            </button>
          </form>
        </>
      )}

      {state.status === "done" && (
        <>
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="text-sm text-emerald-800">
                Your password has been reset. You can now sign in with the new password.
              </p>
            </div>
          </div>
          <Link href="/login" className={`${btnPrimary} mt-6 w-full py-3`}>
            <LogIn size={16} />
            Go to sign in
          </Link>
        </>
      )}

      {state.status !== "done" && (
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      )}
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
