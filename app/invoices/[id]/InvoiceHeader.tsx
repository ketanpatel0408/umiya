import type { Invoice } from "../types";

export default function InvoiceHeader({ invoice }: { invoice: Invoice }) {
  return (
    <>
      <div className="border-b border-current bg-[#eaeaea] text-center text-2xl font-bold tracking-wide uppercase font-tinos">
        {invoice.sellerName}
      </div>

      {invoice.sellerAddress && (
        // Phone sits in its own column so a long address wraps instead of
        // running underneath it. An invisible copy on the left keeps the
        // address visually centred on the page.
        <div className="flex items-end gap-2 border-b border-current p-2 text-sm">
          {invoice.sellerPhone && (
            <span aria-hidden className="invisible shrink-0 whitespace-nowrap font-semibold">
              Mo.: {invoice.sellerPhone}
            </span>
          )}
          <span className="min-w-0 flex-1 text-center">{invoice.sellerAddress}</span>
          {invoice.sellerPhone && (
            <span className="shrink-0 whitespace-nowrap font-semibold">
              Mo.: {invoice.sellerPhone}
            </span>
          )}
        </div>
      )}

      {invoice.sellerGSTIN && (
        <div className="border-b border-current bg-[#f1f1f1] p-1 text-center text-sm">
          GSTIN No.: <span className="font-bold">{invoice.sellerGSTIN}</span>
        </div>
      )}

      <div className="flex border-b border-current text-sm font-bold">
        <div className="flex-1 p-1 text-left">Cash Memo</div>
        <div className="flex-1 p-1 text-center">
          {invoice.taxType === "LUMPSUM" ? "BILL OF SUPPLY" : "TAX INVOICE"}
        </div>
        <div className="flex-1 p-1 text-right">Original</div>
      </div>

      {invoice.taxType === "LUMPSUM" && (
        <div className="border-b border-current p-1 text-center text-xs font-semibold">
          Composition taxable person, not eligible to collect tax on supplies
        </div>
      )}
    </>
  );
}
