import { Calculator } from "lucide-react";
import type { ComputedTotals } from "./formHelpers";
import { formatCurrency } from "../utils";
import { CardHeader } from "../../components/ui";

export default function TotalsSummary({ totals }: { totals: ComputedTotals }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader title="Invoice Summary" description="Live estimate" icon={Calculator} />
      <dl className="flex flex-col gap-2.5 px-5 py-4 text-sm">
        <Row label="Taxable Amount" value={totals.subtotal} />
        <Row label="CGST" value={totals.totalCGST} />
        <Row label="SGST" value={totals.totalSGST} />
        <Row label="IGST" value={totals.totalIGST} />
        <Row label="Round Off" value={totals.roundOff} />
      </dl>
      <div className="flex items-center justify-between bg-indigo-600 px-5 py-4 text-white">
        <dt className="text-sm font-medium text-indigo-100">Grand Total</dt>
        <dd className="text-xl font-semibold tracking-tight tabular-nums">
          {formatCurrency(totals.grandTotal)}
        </dd>
      </div>
      <p className="px-5 py-3 text-xs text-slate-400">
        Estimates for preview only. Final amounts are calculated and saved by
        the server.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-slate-600">
      <dt>{label}</dt>
      <dd className="font-medium text-slate-900 tabular-nums">{formatCurrency(value)}</dd>
    </div>
  );
}
