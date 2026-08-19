import type { ComputedTotals } from "./formHelpers";
import { formatCurrency } from "../utils";

export default function TotalsSummary({ totals }: { totals: ComputedTotals }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Live Totals (estimate)
      </h2>
      <dl className="flex flex-col gap-2 text-sm">
        <Row label="Taxable Amount / Subtotal" value={totals.subtotal} />
        <Row label="CGST" value={totals.totalCGST} />
        <Row label="SGST" value={totals.totalSGST} />
        <Row label="IGST" value={totals.totalIGST} />
        <Row label="Round Off" value={totals.roundOff} />
        <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900">
          <dt>Grand Total</dt>
          <dd>{formatCurrency(totals.grandTotal)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-zinc-400">
        These values are estimates for preview only. Final amounts are
        calculated and saved by the server.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-zinc-600">
      <dt>{label}</dt>
      <dd>{formatCurrency(value)}</dd>
    </div>
  );
}
