"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { Invoice } from "./types";
import { downloadInvoicePdf } from "./downloadInvoicePdf";

/** Downloads the GST invoice as a PDF file; shows a spinner while it's generated. */
export default function InvoiceDownloadButton({
  invoice,
  className,
  label,
}: {
  invoice: Invoice;
  className: string;
  /** Optional visible text; icon-only when omitted. */
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await downloadInvoicePdf(invoice);
    } catch (error) {
      console.error("Failed to download invoice PDF:", error);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={`${className} ${failed ? "text-red-600" : ""}`}
      title={
        busy ? "Preparing PDF..." : failed ? "Download failed, click to retry" : "Download PDF"
      }
      aria-label={label ? undefined : "Download PDF"}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {label && (busy ? "Preparing..." : label)}
    </button>
  );
}
