"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Users, FileText, KeyRound } from "lucide-react";
import PasswordInput from "@/components/common/PasswordInput";

type CurrentUser = {
  id: number;
  username: string;
  fullName: string;
  role: "ADMIN" | "USER";
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdBusy, setPwdBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) {
          setUser(data);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function openChangePassword() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPwdError(null);
    setPwdSuccess(false);
    setShowChangePassword(true);
  }

  async function handleChangePassword() {
    setPwdError(null);
    setPwdSuccess(false);
    if (newPassword !== confirmNewPassword) {
      setPwdError("New passwords do not match");
      return;
    }
    setPwdBusy(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      if (res.ok) {
        setPwdSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setPwdError(
        Array.isArray(data.details) ? data.details.join(", ") : data.error || "Failed to change password"
      );
    } catch {
      setPwdError("Something went wrong.");
    } finally {
      setPwdBusy(false);
    }
  }

  if (pathname === "/login" || !loaded || !user) return null;

  return (
    <div className="no-print flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2.5 sm:px-8">
      <Link href="/" className="text-sm font-semibold text-zinc-900">
        Invoice Portal
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <FileText size={16} />
          Invoices
        </Link>
        {user.role === "ADMIN" && (
          <Link
            href="/users"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            <Users size={16} />
            Users
          </Link>
        )}
        <span className="text-sm text-zinc-500">
          {user.fullName}{" "}
          <span className="text-xs text-zinc-400">({user.role})</span>
        </span>
        <button
          onClick={openChangePassword}
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          <KeyRound size={14} />
          Change Password
        </button>
        <button
          onClick={handleLogout}
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

      {showChangePassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-base font-semibold text-zinc-900">
              Change Password
            </h2>
            {pwdSuccess ? (
              <p className="mt-3 text-sm text-emerald-600">
                Password updated successfully.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <PasswordInput
                  label="Current Password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  autoComplete="current-password"
                />
                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  autoComplete="new-password"
                />
                <PasswordInput
                  label="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={setConfirmNewPassword}
                  autoComplete="new-password"
                />
                {pwdError && (
                  <p className="text-xs text-red-600">{pwdError}</p>
                )}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="cursor-pointer rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Close
              </button>
              {!pwdSuccess && (
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={pwdBusy}
                  className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pwdBusy ? "Saving..." : "Update Password"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
