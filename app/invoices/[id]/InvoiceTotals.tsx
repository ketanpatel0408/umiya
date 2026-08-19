import type { Invoice } from "../types";

/**
 * Right-hand (33%) tax summary block: Taxable Amount, CGST/SGST or IGST,
 * Round Off table, followed by the gray Grand Total table, matching the
 * original's two stacked bordered tables.
 */
export default function InvoiceTotals({ invoice }: { invoice: Invoice }) {
  const isIGST = invoice.taxType === "IGST";
  const cgstRate = Number(invoice.items[0]?.gstRate ?? 0) / 2;
  const igstRate = Number(invoice.items[0]?.gstRate ?? 0);

  return (
    <div className="border-b border-current p-1">
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td colSpan={2} className="font-bold">
              Taxable Amount
            </td>
            <td className="text-right font-bold">
              {Number(invoice.subtotal).toFixed(2)}
            </td>
          </tr>
          {!isIGST && (
            <tr>
              <td>CGST</td>
              <td className="text-right">{cgstRate.toFixed(2)}%</td>
              <td className="text-right">
                {Number(invoice.totalCGST).toFixed(2)}
              </td>
            </tr>
          )}
          {!isIGST && (
            <tr>
              <td>SGST</td>
              <td className="text-right">{cgstRate.toFixed(2)}%</td>
              <td className="text-right">
                {Number(invoice.totalSGST).toFixed(2)}
              </td>
            </tr>
          )}
          {isIGST && (
            <tr>
              <td>IGST</td>
              <td className="text-right">{igstRate.toFixed(2)}%</td>
              <td className="text-right">
                {Number(invoice.totalIGST).toFixed(2)}
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={2}>Round Off</td>
            <td className="text-right">
              {Number(invoice.roundOff).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function InvoiceGrandTotal({ invoice }: { invoice: Invoice }) {
  return (
    <div className="border-b border-l-0 border-current bg-[#eaeaea] px-1 py-[5px]">
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="text-base font-bold">Grand Total</td>
            <td className="text-right text-base font-bold">
              {Number(invoice.grandTotal).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
