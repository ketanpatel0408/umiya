"use client";

import { useState } from "react";
import { Trash2, KeyRound } from "lucide-react";
import type { ManagedUser, SellerDetailsForm } from "./types";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PasswordInput from "@/components/common/PasswordInput";

const editInputClass =
  "w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500";

function sellerFromUser(user: ManagedUser): SellerDetailsForm {
  return {
    sellerName: user.sellerName ?? "",
    sellerPhone: user.sellerPhone ?? "",
    sellerAddress: user.sellerAddress ?? "",
    sellerGSTIN: user.sellerGSTIN ?? "",
    sellerPAN: user.sellerPAN ?? "",
    sellerState: user.sellerState ?? "",
    sellerStateCode: user.sellerStateCode ?? "",
  };
}

export default function UserRow({
  user,
  currentUserId,
  onUpdated,
}: {
  user: ManagedUser;
  currentUserId: number | null;
  onUpdated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [seller, setSeller] = useState<SellerDetailsForm>(() => sellerFromUser(user));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isSelf = currentUserId !== null && currentUserId === user.id;

  function updateSeller<K extends keyof SellerDetailsForm>(
    key: K,
    value: SellerDetailsForm[K]
  ) {
    setSeller((prev) => ({ ...prev, [key]: value }));
  }

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        onUpdated();
        return true;
      }
      const data = await res.json().catch(() => ({}));
      setError(
        Array.isArray(data.details) ? data.details.join(", ") : data.error || "Update failed"
      );
      return false;
    } catch {
      setError("Something went wrong.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveSeller() {
    const ok = await patch(seller);
    if (ok) setEditing(false);
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmDelete(false);
        onUpdated();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Delete failed");
      setConfirmDelete(false);
    } catch {
      setError("Something went wrong.");
      setConfirmDelete(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError(null);
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/users/${user.id}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmNewPassword }),
      });
      if (res.ok) {
        setChangingPassword(false);
        setNewPassword("");
        setConfirmNewPassword("");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setPasswordError(
        Array.isArray(data.details) ? data.details.join(", ") : data.error || "Failed to change password"
      );
    } catch {
      setPasswordError("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <tr className="hover:bg-zinc-50">
        <td className="px-4 py-3 font-medium text-zinc-900">{user.username}</td>
        <td className="px-4 py-3 text-zinc-700">{user.fullName}</td>
        <td className="px-4 py-3 text-zinc-700">{user.email}</td>
        <td className="px-4 py-3">
          <select
            value={user.role}
            disabled={busy}
            onChange={(e) => patch({ role: e.target.value })}
            className="cursor-pointer rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-500 disabled:cursor-not-allowed"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              user.isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              disabled={busy}
              onClick={() => patch({ isActive: !user.isActive })}
              className="cursor-pointer rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {user.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              disabled={busy}
              onClick={() => {
                setSeller(sellerFromUser(user));
                setEditing((v) => !v);
              }}
              className="cursor-pointer rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editing ? "Close" : "Seller Details"}
            </button>
            <button
              disabled={busy}
              onClick={() => {
                setPasswordError(null);
                setNewPassword("");
                setConfirmNewPassword("");
                setChangingPassword(true);
              }}
              title="Change Password"
              className="cursor-pointer inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <KeyRound size={14} />
            </button>
            <button
              disabled={busy || isSelf}
              onClick={() => setConfirmDelete(true)}
              title={isSelf ? "You cannot delete your own account" : "Delete User"}
              className="cursor-pointer inline-flex items-center gap-1 rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </td>
      </tr>
      {editing && (
        <tr className="bg-zinc-50">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-zinc-600">
                Seller Name
                <input
                  className={editInputClass}
                  value={seller.sellerName}
                  onChange={(e) => updateSeller("sellerName", e.target.value)}
                />
              </label>
              <label className="text-xs font-medium text-zinc-600">
                Seller Phone
                <input
                  className={editInputClass}
                  value={seller.sellerPhone}
                  onChange={(e) => updateSeller("sellerPhone", e.target.value)}
                />
              </label>
              <label className="text-xs font-medium text-zinc-600">
                Seller Address
                <input
                  className={editInputClass}
                  value={seller.sellerAddress}
                  onChange={(e) => updateSeller("sellerAddress", e.target.value)}
                />
              </label>
              <label className="text-xs font-medium text-zinc-600">
                Seller GSTIN
                <input
                  className={editInputClass}
                  value={seller.sellerGSTIN}
                  onChange={(e) => updateSeller("sellerGSTIN", e.target.value)}
                />
              </label>
              <label className="text-xs font-medium text-zinc-600">
                Seller PAN
                <input
                  className={editInputClass}
                  value={seller.sellerPAN}
                  onChange={(e) => updateSeller("sellerPAN", e.target.value)}
                />
              </label>
              <label className="text-xs font-medium text-zinc-600">
                Seller State
                <input
                  className={editInputClass}
                  value={seller.sellerState}
                  onChange={(e) => updateSeller("sellerState", e.target.value)}
                />
              </label>
              <label className="text-xs font-medium text-zinc-600">
                Seller State Code
                <input
                  className={editInputClass}
                  value={seller.sellerStateCode}
                  onChange={(e) => updateSeller("sellerStateCode", e.target.value)}
                />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                disabled={busy}
                onClick={handleSaveSeller}
                className="cursor-pointer rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Saving..." : "Save Seller Details"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>
            </div>
          </td>
        </tr>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete User"
        message={
          <>
            Are you sure you want to delete <strong>{user.username}</strong>?
            If this user has existing invoices, the account will be
            deactivated instead of deleted to preserve invoice history.
          </>
        }
        confirmLabel="Delete"
        danger
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {changingPassword && (
        <tr className="bg-zinc-50">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            </div>
            {passwordError && (
              <p className="mt-2 text-xs text-red-600">{passwordError}</p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                disabled={busy}
                onClick={handleChangePassword}
                className="cursor-pointer rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Saving..." : "Set Password"}
              </button>
              <button
                onClick={() => setChangingPassword(false)}
                className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Cancel
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
