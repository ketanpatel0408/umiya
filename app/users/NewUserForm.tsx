"use client";

import { useState } from "react";
import type { UserRole, SellerDetailsForm } from "./types";
import { emptySellerDetails } from "./types";
import PasswordInput from "@/components/common/PasswordInput";
import { UserPlus, Store, Landmark } from "lucide-react";
import SignatureInput from "./SignatureInput";
import InvoiceNumberFormatInput from "./InvoiceNumberFormatInput";
import { validateInvoiceNumberFormat } from "@/lib/invoiceNumber";
import BeneficiaryToggle from "./BeneficiaryToggle";
import { Alert, CardHeader, btnPrimary, btnSecondary, inputBase, labelBase } from "../components/ui";
import Select from "../components/Select";

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
    // Drop a stale "Invoice Number Format" error once the format is edited.
    if (key === "invoiceNumberFormat") setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }
    const formatError = seller.invoiceNumberFormat.trim()
      ? validateInvoiceNumberFormat(seller.invoiceNumberFormat.trim())
      : null;
    if (formatError) {
      setError(`Invoice Number Format: ${formatError}`);
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
      className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <CardHeader title="Create New User" description="Account and login details" icon={UserPlus} />

      {error && (
        <div className="px-5 pt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
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
          <label className={labelBase}>Role</label>
          <Select<UserRole>
            value={role}
            onChange={setRole}
            ariaLabel="Role"
            options={[
              { value: "USER", label: "User" },
              { value: "ADMIN", label: "Admin" },
            ]}
          />
        </div>
      </div>

      <div className="border-t border-slate-100">
        <CardHeader
          title="Seller Details"
          description="Used to prefill invoices created by this user"
          icon={Store}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
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

      <div className="border-t border-slate-100">
        <CardHeader
          title="Bank, Signature & Invoice Number"
          description="Printed on invoices created by this user"
          icon={Landmark}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <Field
          label="Bank Name"
          value={seller.bankName}
          onChange={(v) => updateSeller("bankName", v)}
        />
        <Field
          label="Branch Name"
          value={seller.bankBranchName}
          onChange={(v) => updateSeller("bankBranchName", v)}
        />
        <Field
          label="Bank A/c. No."
          value={seller.bankAccountNumber}
          onChange={(v) => updateSeller("bankAccountNumber", v)}
        />
        <Field
          label="RTGS/IFSC Code"
          value={seller.bankIfscCode}
          onChange={(v) => updateSeller("bankIfscCode", v)}
        />
        <SignatureInput
          value={seller.signatureImage}
          onChange={(v) => updateSeller("signatureImage", v)}
          disabled={saving}
        />
        <InvoiceNumberFormatInput
          value={seller.invoiceNumberFormat}
          onChange={(v) => updateSeller("invoiceNumberFormat", v)}
        />
        <BeneficiaryToggle
          checked={seller.showBeneficiaryOnInvoice}
          onChange={(v) => updateSeller("showBeneficiaryOnInvoice", v)}
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
        {/* Repeated here: the top alert is out of view when saving at the bottom. */}
        {error && <p className="mr-auto text-sm text-red-600">{error}</p>}
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className={btnPrimary}>
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
      <label className={labelBase}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={inputBase}
      />
    </div>
  );
}
