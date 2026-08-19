import type { Invoice } from "../types";
import { formatDate } from "../utils";

export default function InvoiceMeta({ invoice }: { invoice: Invoice }) {
  return (
    <div className="flex border-b border-current">
      <div className="w-7/12 border-r border-b-0 border-current">
        <div className="flex p-1">
          <p className="font-semibold whitespace-nowrap">M/s. :</p>
          <div className="ml-3">
            <p className="mb-2 font-semibold uppercase">{invoice.buyerName}</p>
            {invoice.buyerAddress && (
              <p className="mb-1 max-w-60">{invoice.buyerAddress}</p>
            )}
          </div>
        </div>
        <div className="flex p-1 pt-5 pb-4">
          <p className="font-semibold whitespace-nowrap">GSTIN No. :</p>
          <span className="ml-3">{invoice.buyerGSTIN ?? ""}</span>
        </div>
      </div>

      <div className="w-5/12">
        <div className="border-b border-current bg-[#eaeaea] p-1 px-2 font-semibold">
          <div className="flex">
            <p className="min-w-[85px] max-w-[85px] font-light">
              Invoice No.
            </p>
            <p>
              : <span className="ml-2">{invoice.invoiceNumber}</span>
            </p>
          </div>
          <div className="flex">
            <p className="min-w-[85px] max-w-[85px] font-light">Dated</p>
            <p>: <span className="ml-2">{formatDate(invoice.invoiceDate)}</span></p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-0 font-semibold">
          <div className="col-span-2 border-b border-current p-1 px-2 text-[13px]">
            <p className="min-w-[150px] max-w-[150px] font-light">
              Delivery Note
            </p>
            <p className=""><span className="block" contentEditable="true"></span></p>
          </div>
          <div className="border-r border-b border-current p-1 px-2 text-[13px]">
            <p className="min-w-[150px] max-w-[150px] font-light">
              Buyer&apos;s Order No.
            </p>
            <p className=""><span className="block" contentEditable="true"></span></p>
          </div>
          <div className="border-b border-current p-1 px-2 text-[13px]">
            <p className="min-w-[150px] max-w-[150px] font-light">Dated</p>
            <p className=""><span className="block" contentEditable="true"></span></p>
          </div>
          <div className="border-r border-b border-current p-1 px-2 text-[13px]">
            <p className="min-w-[150px] max-w-[150px] font-light">
              Dispatch Doc No.
            </p>
            <p className=""><span className="block" contentEditable="true"></span></p>
          </div>
          <div className="border-b border-current p-1 px-2 text-[13px]">
            <p className="min-w-[150px] max-w-[150px] font-light">
              Delivery Note Date
            </p>
            <p className=""><span className="block" contentEditable="true"></span></p>
          </div>
          <div className="border-r border-current p-1 px-2 text-[13px]">
            <p className="min-w-[150px] max-w-[150px] font-light">
              Dispatched through
            </p>
            <p className=""><span className="block" contentEditable="true"></span></p>
          </div>
          <div className="p-1 px-2 text-[13px]">
            <p className="min-w-[150px] max-w-[150px] font-light">
              Destination
            </p>
            <p className=""><span className="block" contentEditable="true"></span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
