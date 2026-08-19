import Link from "next/link";
import { Plus, ListChecks } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Invoice Portal
        </h1>
        <p className="mt-1 text-sm text-zinc-600">Manage your GST invoices</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/invoices"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          <ListChecks size={18} />
          View All Invoices
        </Link>
        <Link
          href="/invoices/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <Plus size={18} />
          Create New Invoice
        </Link>
      </div>
    </div>
  );
}
