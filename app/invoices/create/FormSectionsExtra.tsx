import { Truck, StickyNote, UserCheck } from "lucide-react";
import type { InvoiceFormState } from "./formHelpers";
import { Field, inputClass, SectionCard, DateInput } from "./FormSections";

type Props = {
  form: InvoiceFormState;
  updateField: <K extends keyof InvoiceFormState>(
    key: K,
    value: InvoiceFormState[K]
  ) => void;
};

export function MetadataSection({ form, updateField }: Props) {
  return (
    <SectionCard
      title="Dispatch & Order Details"
      description="Optional delivery and order references"
      icon={Truck}
    >
      <Field label="Delivery Note">
        <input
          className={inputClass}
          value={form.deliveryNote}
          onChange={(e) => updateField("deliveryNote", e.target.value)}
        />
      </Field>
      <Field label="Delivery Note Date">
        <DateInput
          value={form.deliveryNoteDate}
          onChange={(iso) => updateField("deliveryNoteDate", iso)}
        />
      </Field>
      <Field label="Buyer's Order No.">
        <input
          className={inputClass}
          value={form.buyerOrderNo}
          onChange={(e) => updateField("buyerOrderNo", e.target.value)}
        />
      </Field>
      <Field label="Buyer's Order Date">
        <DateInput
          value={form.buyerOrderDate}
          onChange={(iso) => updateField("buyerOrderDate", iso)}
        />
      </Field>
      <Field label="Dispatch Doc No.">
        <input
          className={inputClass}
          value={form.dispatchDocNo}
          onChange={(e) => updateField("dispatchDocNo", e.target.value)}
        />
      </Field>
      <Field label="Dispatched Through">
        <input
          className={inputClass}
          value={form.dispatchedThrough}
          onChange={(e) => updateField("dispatchedThrough", e.target.value)}
        />
      </Field>
      <Field label="Destination">
        <input
          className={inputClass}
          value={form.destination}
          onChange={(e) => updateField("destination", e.target.value)}
        />
      </Field>
    </SectionCard>
  );
}

export function BeneficiarySection({ form, updateField }: Props) {
  return (
    <SectionCard
      title="Beneficiary Details"
      description="Printed below the buyer GSTIN on the invoice"
      icon={UserCheck}
    >
      <Field label="Beneficiary Name">
        <input
          className={inputClass}
          value={form.beneficiaryName}
          maxLength={60}
          onChange={(e) => updateField("beneficiaryName", e.target.value)}
        />
      </Field>
      <Field label="TIN No.">
        <input
          className={inputClass}
          value={form.beneficiaryTin}
          maxLength={30}
          onChange={(e) => updateField("beneficiaryTin", e.target.value)}
        />
      </Field>
    </SectionCard>
  );
}

export function NotesSection({ form, updateField }: Props) {
  return (
    <SectionCard title="Notes & Terms" description="Printed at the bottom of the invoice" icon={StickyNote}>
      <label className="col-span-1 flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="font-medium text-slate-700">Notes</span>
        <textarea
          className={`${inputClass} min-h-[60px]`}
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </label>
      <label className="col-span-1 flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="font-medium text-slate-700">Terms &amp; Conditions</span>
        <textarea
          className={`${inputClass} min-h-[100px]`}
          value={form.termsAndConditions}
          onChange={(e) => updateField("termsAndConditions", e.target.value)}
        />
      </label>
    </SectionCard>
  );
}
