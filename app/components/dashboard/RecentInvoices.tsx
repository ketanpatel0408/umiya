import Link from "next/link";
import { Eye, FileText, Plus } from "lucide-react";
import type { Invoice } from "../../invoices/types";
import { formatCurrency, formatDate } from "../../invoices/utils";

type RecentInvoicesProps = {
  invoices: Invoice[];
};

export default function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
        Recent Invoices
      </h2>

      <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {invoices.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice No.</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Taxable Amount
                  </th>
                  <th className="px-4 py-3 font-medium text-right">GST</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Grand Total
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoices.map((invoice) => (
                  <InvoiceRow key={invoice.id} invoice={invoice} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const gst =
    Number(invoice.totalCGST) +
    Number(invoice.totalSGST) +
    Number(invoice.totalIGST);

  return (
    <tr className="hover:bg-zinc-50">
      <td className="px-4 py-3 font-medium text-zinc-900">
        {invoice.invoiceNumber}
      </td>
      <td className="px-4 py-3 text-zinc-700">
        {formatDate(invoice.invoiceDate)}
      </td>
      <td className="px-4 py-3 text-zinc-700">{invoice.buyerName}</td>
      <td className="px-4 py-3 text-right text-zinc-700">
        {formatCurrency(invoice.subtotal)}
      </td>
      <td className="px-4 py-3 text-right text-zinc-700">
        {formatCurrency(gst)}
      </td>
      <td className="px-4 py-3 text-right font-medium text-zinc-900">
        {formatCurrency(invoice.grandTotal)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={invoice.status} />
      </td>
      <td className="px-4 py-3 text-center">
        <Link
          href={`/invoices/${invoice.id}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          title="View invoice"
        >
          <Eye size={16} />
          <span className="text-xs font-medium">View</span>
        </Link>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: Invoice["status"] }) {
  const styles: Record<Invoice["status"], string> = {
    DRAFT: "bg-zinc-100 text-zinc-700",
    ISSUED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <FileText size={32} className="text-zinc-300" />
      <p className="text-base font-medium text-zinc-900">No invoices yet</p>
      <p className="max-w-sm text-sm text-zinc-500">
        Create your first GST invoice to get started.
      </p>
      <Link
        href="/invoices/create"
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        <Plus size={16} />
        Create New Invoice
      </Link>
    </div>
  );
}
