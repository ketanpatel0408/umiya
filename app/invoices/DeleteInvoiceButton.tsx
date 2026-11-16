"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Invoice } from "./types";
import ConfirmDialog from "@/components/common/ConfirmDialog";

/**
 * Deletes an invoice after confirmation. Render it only for the latest
 * invoice of a series (`invoice.isLatest`); the API enforces the same rule.
 */
export default function DeleteInvoiceButton({
  invoice,
  className,
  label,
  onDeleted,
}: {
  invoice: Pick<Invoice, "id" | "invoiceNumber">;
  className: string;
  /** Optional visible text; icon-only when omitted. */
  label?: string;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
      if (res.ok) {
        setOpen(false);
        onDeleted();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to delete invoice");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className={className}
        title="Delete invoice"
      >
        <Trash2 size={16} className="text-red-600" />
        {label && <span className="text-red-600">{label}</span>}
      </button>
      <ConfirmDialog
        open={open}
        title="Delete Invoice"
        message={
          <>
            Delete invoice <strong>{invoice.invoiceNumber}</strong>? This cannot be
            undone. The next invoice you create will reuse this number.
            {error && <span className="mt-2 block text-red-600">{error}</span>}
          </>
        }
        confirmLabel="Delete"
        danger
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
