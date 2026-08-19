import type { InvoiceItem } from "../types";

/** Gray "total qty" band under the item table, left (67%) column only. */
export function InvoiceQtyBand({ items }: { items: InvoiceItem[] }) {
  const totalQty = items.reduce((sum, item) => sum + Number(item.quantity), 0);

  return (
    <div className="flex border-b border-current bg-[#eaeaea] p-1 px-1 font-semibold">
      <p className="w-[80%]" />
      <span className="w-[11%] text-right">{totalQty.toFixed(3)}</span>
      <span className="w-[9%]" />
    </div>
  );
}

/** Gray "Sub Total" band, right (33%) column only. */
export function InvoiceSubTotalBand({ subtotal }: { subtotal: string }) {
  return (
    <div className="flex border-b border-current bg-[#eaeaea] p-1 px-1 font-semibold">
      <span className="w-[50%]">Sub Total</span>
      <span className="w-[50%] text-right">{Number(subtotal).toFixed(2)}</span>
    </div>
  );
}
