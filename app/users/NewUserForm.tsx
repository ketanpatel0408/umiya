"use client";

import { useState } from "react";
import type { UserRole, SellerDetailsForm } from "./types";
import { emptySellerDetails } from "./types";
import PasswordInput from "@/components/common/PasswordInput";

export default function NewUserForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [seller, setSeller] = useState<SellerDetailsForm>(emptySellerDetails());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateSeller<K extends keyof SellerDetailsForm>(
    key: K,
    value: SellerDetailsForm[K]
  ) {
    setSeller((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, fullName, email, password, role, ...seller }),
      });
      if (res.ok) {
        onCreated();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(
        Array.isArray(data.details) ? data.details.join(", ") : data.error || "Failed to create user"
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-zinc-200 bg-white p-5"
    >
      <h2 className="text-sm font-semibold text-zinc-900">Create New User</h2>

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Username" value={username} onChange={setUsername} required />
        <Field label="Full Name" value={fullName} onChange={setFullName} required />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <PasswordInput
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
        />
        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          required
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <h2 className="mt-6 text-sm font-semibold text-zinc-900">
        Seller Details
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Seller Name"
          value={seller.sellerName}
          onChange={(v) => updateSeller("sellerName", v)}
        />
        <Field
          label="Seller Phone"
          value={seller.sellerPhone}
          onChange={(v) => updateSeller("sellerPhone", v)}
        />
        <Field
          label="Seller Address"
          value={seller.sellerAddress}
          onChange={(v) => updateSeller("sellerAddress", v)}
        />
        <Field
          label="Seller GSTIN"
          value={seller.sellerGSTIN}
          onChange={(v) => updateSeller("sellerGSTIN", v)}
        />
        <Field
          label="Seller PAN"
          value={seller.sellerPAN}
          onChange={(v) => updateSeller("sellerPAN", v)}
        />
        <Field
          label="Seller State"
          value={seller.sellerState}
          onChange={(v) => updateSeller("sellerState", v)}
        />
        <Field
          label="Seller State Code"
          value={seller.sellerStateCode}
          onChange={(v) => updateSeller("sellerStateCode", v)}
        />
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
      />
    </div>
  );
}
