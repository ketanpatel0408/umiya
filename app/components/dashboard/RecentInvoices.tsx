import Link from "next/link";
import { ArrowRight, Eye, FileText, Plus } from "lucide-react";
import type { Invoice } from "../../invoices/types";
import { formatCurrency, formatDate } from "../../invoices/utils";
import { Card, CardHeader, StatusBadge, btnPrimary, iconBtn, tableHead } from "../ui";

type RecentInvoicesProps = {
  invoices: Invoice[];
};

export default function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Recent Invoices"
        description="Latest 5 invoices by invoice date"
        icon={FileText}
        actions={
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        }
      />
      {invoices.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className={tableHead}>
              <tr>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3 text-right">Grand Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center" aria-label="Action" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-500">{formatDate(invoice.invoiceDate)}</p>
                  </td>
                  <td className="max-w-[260px] px-5 py-3">
                    <p className="truncate text-slate-700">{invoice.buyerName}</p>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(invoice.grandTotal)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className={iconBtn}
                      title="View invoice"
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <FileText size={22} />
      </div>
      <p className="text-base font-medium text-slate-900">No invoices yet</p>
      <p className="max-w-sm text-sm text-slate-500">
        Create your first GST invoice to get started.
      </p>
      <Link href="/invoices/create" className={`${btnPrimary} mt-2`}>
        <Plus size={16} />
        Create New Invoice
      </Link>
    </div>
  );
}
