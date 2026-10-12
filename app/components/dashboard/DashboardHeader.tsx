import Link from "next/link";
import { Plus, ListChecks } from "lucide-react";
import { PageHeader, btnPrimary, btnSecondary } from "../ui";

export default function DashboardHeader() {
  return (
    <PageHeader
      title="Dashboard"
      subtitle="Overview of your GST invoices and recent activity."
      actions={
        <>
          <Link href="/invoices" className={btnSecondary}>
            <ListChecks size={16} />
            View All Invoices
          </Link>
          <Link href="/invoices/create" className={btnPrimary}>
            <Plus size={16} />
            Create New Invoice
          </Link>
        </>
      }
    />
  );
}
