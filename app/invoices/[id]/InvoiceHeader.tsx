import type { Invoice } from "../types";

export default function InvoiceHeader({ invoice }: { invoice: Invoice }) {
  return (
    <>
      <div className="border-b border-current bg-[#eaeaea] text-center text-2xl font-bold tracking-wide uppercase font-tinos">
        {invoice.sellerName}
      </div>

      {invoice.sellerAddress && (
        <div className="relative border-b border-current p-2 text-center text-sm">
          {invoice.sellerAddress}
          {invoice.sellerPhone && (
            <span className="absolute right-1 bottom-2 font-semibold">
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
        <div className="flex-1 p-1 text-center">TAX INVOICE</div>
        <div className="flex-1 p-1 text-right">Original</div>
      </div>
    </>
  );
}
