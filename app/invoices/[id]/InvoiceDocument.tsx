import type { Invoice } from "../types";
import InvoiceHeader from "./InvoiceHeader";
import InvoiceMeta from "./InvoiceMeta";
import InvoiceItemsTable from "./InvoiceItemsTable";
import { InvoiceQtyBand, InvoiceSubTotalBand } from "./InvoiceItemTotalBand";
import InvoiceTotals, { InvoiceGrandTotal } from "./InvoiceTotals";
import InvoiceBankDetails from "./InvoiceBankDetails";
import InvoiceTerms, { InvoiceNote } from "./InvoiceTerms";
import InvoiceSignature from "./InvoiceSignature";
import { numberToWords } from "../numberToWords";

/**
 * A4-sized, print-oriented GST invoice document, visually modeled after
 * the original static Umiya invoice template.
 */
export default function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const totalGST =
    Number(invoice.totalCGST) +
    Number(invoice.totalSGST) +
    Number(invoice.totalIGST);

  return (
    <div className="invoice-a4 mx-auto bg-white" id="invoice-document">
      <div className="border border-current">
        <InvoiceHeader invoice={invoice} />
        <InvoiceMeta invoice={invoice} />

        <InvoiceItemsTable items={invoice.items} />

        <div className="flex">
          <div className="w-[67%] border-r border-current">
            <InvoiceQtyBand items={invoice.items} />
            <InvoiceBankDetails
              totalGSTWords={numberToWords(totalGST)}
              billAmountWords={numberToWords(invoice.grandTotal)}
            />
            <InvoiceNote notes={invoice.notes} />
          </div>
          <div className="w-[33%] border-current">
            <InvoiceSubTotalBand subtotal={invoice.subtotal} />
            <div className="h-[108px]" />
            <InvoiceTotals invoice={invoice} />
            <InvoiceGrandTotal invoice={invoice} />
          </div>
        </div>

        <div className="flex p-1">
          <div className="w-[67%] text-xs">
            <InvoiceTerms termsAndConditions={invoice.termsAndConditions} />
          </div>
          <InvoiceSignature sellerName={invoice.sellerName} />
        </div>
        <p className="pr-1 pb-2 text-right text-xs">(Authorised Signatory)</p>
      </div>
    </div>
  );
}
