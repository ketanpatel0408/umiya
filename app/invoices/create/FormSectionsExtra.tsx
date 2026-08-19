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
    <SectionCard title="Additional Invoice Details">
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

export function NotesSection({ form, updateField }: Props) {
  return (
    <SectionCard title="Notes / Terms">
      <label className="col-span-2 flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Notes</span>
        <textarea
          className={`${inputClass} min-h-[60px]`}
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </label>
      <label className="col-span-2 flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700">Terms &amp; Conditions</span>
        <textarea
          className={`${inputClass} min-h-[100px]`}
          value={form.termsAndConditions}
          onChange={(e) => updateField("termsAndConditions", e.target.value)}
        />
      </label>
    </SectionCard>
  );
}
