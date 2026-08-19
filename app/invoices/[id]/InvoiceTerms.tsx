import { invoiceConfig } from "../invoiceConfig";

export function InvoiceNote({ notes }: { notes: string | null }) {
  return (
    <div className="flex h-[35px] items-center border-b border-current p-1">
      <span className="font-semibold">Note : {notes ?? ""}</span>
    </div>
  );
}

export default function InvoiceTerms({
  termsAndConditions,
}: {
  termsAndConditions: string | null;
}) {
  const terms = termsAndConditions
    ? termsAndConditions.split("\n").filter(Boolean)
    : invoiceConfig.defaultTerms;

  return (
    <div className="text-xs">
      <p className="mb-2 font-semibold">Terms &amp; Condition :</p>
      <ol>
        {terms.map((term, i) => (
          <li key={i} className="mb-1">
            {i + 1}. {term}
          </li>
        ))}
      </ol>
    </div>
  );
}
