import { useState } from "react";
import type { InvoiceFormState } from "./formHelpers";
import {
  isoToDisplayDate,
  displayToISODate,
  FINANCIAL_YEARS,
  financialYearRangeLabel,
} from "./formHelpers";

type Props = {
  form: InvoiceFormState;
  updateField: <K extends keyof InvoiceFormState>(
    key: K,
    value: InvoiceFormState[K]
  ) => void;
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-zinc-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500";

/**
 * Date input that displays/accepts Indian DD-MM-YYYY format while storing
 * an ISO ("YYYY-MM-DD") value in form state for API compatibility. Uses a
 * native date picker plus a synced text display.
 */
function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (isoValue: string) => void;
}) {
  const [text, setText] = useState(isoToDisplayDate(value));

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="DD-MM-YYYY"
        className={inputClass}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const iso = displayToISODate(e.target.value);
          if (iso) onChange(iso);
        }}
        onBlur={() => setText(isoToDisplayDate(value))}
      />
      <input
        type="date"
        aria-label="Pick date"
        className="rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setText(isoToDisplayDate(e.target.value));
        }}
      />
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function InvoiceDetailsSection({
  form,
  updateField,
  mode = "create",
}: Props & { mode?: "create" | "edit" }) {
  return (
    <SectionCard title="Invoice Details">
      <Field label="Financial Year" required>
        <select
          className={`${inputClass} ${mode === "edit" ? "cursor-not-allowed bg-zinc-100 text-zinc-500" : ""}`}
          value={form.financialYear}
          disabled={mode === "edit"}
          onChange={(e) => updateField("financialYear", e.target.value)}
        >
          {FINANCIAL_YEARS.map((fy) => (
            <option key={fy} value={fy}>
              {fy}
            </option>
          ))}
        </select>
        <span className="mt-1 text-xs text-zinc-400">
          {mode === "edit"
            ? "Financial Year cannot be changed."
            : `Valid range: ${financialYearRangeLabel(form.financialYear)}`}
        </span>
      </Field>
      <Field label="Invoice Date" required>
        <DateInput
          value={form.invoiceDate}
          onChange={(iso) => updateField("invoiceDate", iso)}
        />
      </Field>

      <label className="col-span-1 flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300"
          checked={form.useExistingInvoiceNumber}
          disabled={mode === "edit"}
          onChange={(e) =>
            updateField("useExistingInvoiceNumber", e.target.checked)
          }
        />
        <span className="font-medium text-zinc-700">
          Use Existing Invoice Number
        </span>
      </label>

      <Field label="Invoice Number" required={form.useExistingInvoiceNumber}>
        {form.useExistingInvoiceNumber ? (
          <input
            className={inputClass}
            placeholder="e.g. 25-26/087"
            value={form.invoiceNumber}
            onChange={(e) => updateField("invoiceNumber", e.target.value)}
          />
        ) : (
          <input
            className={`${inputClass} cursor-not-allowed bg-zinc-100 text-zinc-500`}
            value="Auto-generated on save"
            readOnly
            disabled
          />
        )}
        <span className="mt-1 text-xs text-zinc-400">
          {form.useExistingInvoiceNumber
            ? "Enter the exact historical invoice number, e.g. 25-26/087."
            : "Invoice number will be assigned automatically from the selected Financial Year's sequence."}
        </span>
      </Field>

      <Field label="Tax Type" required>
        <select
          className={inputClass}
          value={form.taxType}
          onChange={(e) =>
            updateField("taxType", e.target.value as InvoiceFormState["taxType"])
          }
        >
          <option value="CGST_SGST">CGST + SGST</option>
          <option value="IGST">IGST</option>
        </select>
      </Field>
    </SectionCard>
  );
}

type SellerSectionProps = Props & {
  sellerStatus?: "loading" | "ready" | "missing" | "error";
};

export function SellerSection({
  form,
  updateField,
  sellerStatus = "ready",
}: SellerSectionProps) {
  if (sellerStatus === "loading") {
    return (
      <SectionCard title="Seller Details">
        <p className="col-span-2 text-sm text-zinc-500">
          Loading seller details...
        </p>
      </SectionCard>
    );
  }

  if (sellerStatus === "missing") {
    return (
      <SectionCard title="Seller Details">
        <p className="col-span-2 text-sm text-red-600">
          Seller Details are not configured for your account. Please contact
          the administrator.
        </p>
      </SectionCard>
    );
  }

  if (sellerStatus === "error") {
    return (
      <SectionCard title="Seller Details">
        <p className="col-span-2 text-sm text-red-600">
          Unable to load your seller details. Please refresh the page.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Seller Details">
      <Field label="Seller Name">
        <input
          className={inputClass}
          value={form.sellerName}
          onChange={(e) => updateField("sellerName", e.target.value)}
        />
      </Field>
      <Field label="Seller Phone">
        <input
          className={inputClass}
          value={form.sellerPhone}
          onChange={(e) => updateField("sellerPhone", e.target.value)}
        />
      </Field>
      <Field label="Seller Address">
        <input
          className={inputClass}
          value={form.sellerAddress}
          onChange={(e) => updateField("sellerAddress", e.target.value)}
        />
      </Field>
      <Field label="Seller GSTIN">
        <input
          className={inputClass}
          value={form.sellerGSTIN}
          onChange={(e) => updateField("sellerGSTIN", e.target.value)}
        />
      </Field>
      <Field label="Seller PAN">
        <input
          className={inputClass}
          value={form.sellerPAN}
          onChange={(e) => updateField("sellerPAN", e.target.value)}
        />
      </Field>
      <Field label="Seller State">
        <input
          className={inputClass}
          value={form.sellerState}
          onChange={(e) => updateField("sellerState", e.target.value)}
        />
      </Field>
      <Field label="Seller State Code">
        <input
          className={inputClass}
          value={form.sellerStateCode}
          onChange={(e) => updateField("sellerStateCode", e.target.value)}
        />
      </Field>
    </SectionCard>
  );
}

export function BuyerSection({ form, updateField }: Props) {
  return (
    <SectionCard title="Buyer Details">
      <Field label="Buyer Name / M/s." required>
        <input
          className={inputClass}
          value={form.buyerName}
          onChange={(e) => updateField("buyerName", e.target.value)}
        />
      </Field>
      <Field label="Buyer Address" required>
        <input
          className={inputClass}
          value={form.buyerAddress}
          onChange={(e) => updateField("buyerAddress", e.target.value)}
        />
      </Field>
      <Field label="Buyer GSTIN">
        <input
          className={inputClass}
          value={form.buyerGSTIN}
          onChange={(e) => updateField("buyerGSTIN", e.target.value)}
        />
      </Field>
      <Field label="Buyer PAN">
        <input
          className={inputClass}
          value={form.buyerPAN}
          onChange={(e) => updateField("buyerPAN", e.target.value)}
        />
      </Field>
      <Field label="Buyer Aadhaar">
        <input
          className={inputClass}
          value={form.buyerAadhaar}
          onChange={(e) => updateField("buyerAadhaar", e.target.value)}
        />
      </Field>
      <Field label="Buyer State">
        <input
          className={inputClass}
          value={form.buyerState}
          onChange={(e) => updateField("buyerState", e.target.value)}
        />
      </Field>
      <Field label="Buyer State Code">
        <input
          className={inputClass}
          value={form.buyerStateCode}
          onChange={(e) => updateField("buyerStateCode", e.target.value)}
        />
      </Field>
    </SectionCard>
  );
}

export { Field, inputClass, SectionCard, DateInput };
