"use client";

/**
 * Per-user switch: when on, the Create/Edit Invoice form asks for a
 * Beneficiary Name and TIN No. and the invoice prints them.
 */
export default function BeneficiaryToggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white px-3 py-2.5 sm:col-span-2">
      <div>
        <p className="text-sm font-medium text-slate-700">
          Beneficiary Name &amp; TIN No. on invoice
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          When on, these two fields are asked on Create Invoice and printed below
          the buyer GSTIN.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Show Beneficiary Name and TIN No. on invoice"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
