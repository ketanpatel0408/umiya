"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Users,
  FileText,
  KeyRound,
  LayoutDashboard,
  FilePlus2,
  Menu,
  X,
  Receipt,
} from "lucide-react";
import PasswordInput from "@/components/common/PasswordInput";
import { Alert, btnPrimary, btnSecondary, initials } from "./ui";

type CurrentUser = {
  id: number;
  username: string;
  fullName: string;
  role: "ADMIN" | "USER";
  sellerName?: string | null;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof FileText;
  adminOnly?: boolean;
  /** Whether this item is highlighted for the current path. */
  match: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (p) => p === "/",
  },
  {
    href: "/invoices",
    label: "Invoices",
    icon: FileText,
    match: (p) => p.startsWith("/invoices") && p !== "/invoices/create",
  },
  {
    href: "/invoices/create",
    label: "Create Invoice",
    icon: FilePlus2,
    match: (p) => p === "/invoices/create",
  },
  {
    href: "/users",
    label: "Users",
    icon: Users,
    adminOnly: true,
    match: (p) => p.startsWith("/users"),
  },
];

const AUTH_PAGES = ["/login", "/forgot-password", "/reset-password"];

/**
 * Application chrome: a fixed sidebar on desktop and a top bar with a
 * slide-in drawer on mobile. The login page renders without it.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdBusy, setPwdBusy] = useState(false);

  // Signed-out screens render without the sidebar.
  const isLogin = AUTH_PAGES.includes(pathname);

  useEffect(() => {
    if (isLogin) return;
    let active = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setUser(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname, isLogin]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
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

  if (isLogin) return <>{children}</>;

  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "ADMIN");

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
          <Receipt size={18} />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-white">Umiya GST Portal</p>
          <p className="truncate text-[11px] text-slate-400">Invoice Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </p>
        {navItems.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                size={18}
                className={active ? "text-white" : "text-slate-400 group-hover:text-white"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {user && (
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-400/30">
              {initials(user.fullName)}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
              <p className="truncate text-[11px] text-slate-400">
                {user.role === "ADMIN" ? "Administrator" : "User"} · @{user.username}
              </p>
            </div>
          </div>
        )}
        <div className="mt-1 grid grid-cols-2 gap-2">
          <button
            onClick={openChangePassword}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <KeyRound size={14} />
            Password
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50 lg:pl-64 print:bg-white print:pl-0">
      {/* Desktop sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        {sidebar}
      </aside>

      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Receipt size={16} />
          </div>
          <span className="text-sm font-semibold text-slate-900">Umiya GST Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="cursor-pointer rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="no-print fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 z-10 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <main className="flex flex-1 flex-col">{children}</main>

      {showChangePassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <KeyRound size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
                <p className="text-xs text-slate-500">Update your account password.</p>
              </div>
            </div>
            {pwdSuccess ? (
              <div className="mt-5">
                <Alert tone="success">Password updated successfully.</Alert>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-3">
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
                {pwdError && <Alert>{pwdError}</Alert>}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className={btnSecondary}
              >
                Close
              </button>
              {!pwdSuccess && (
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={pwdBusy}
                  className={btnPrimary}
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
