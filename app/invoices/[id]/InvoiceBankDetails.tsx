import { invoiceConfig } from "../invoiceConfig";

export default function InvoiceBankDetails({
  totalGSTWords,
  billAmountWords,
}: {
  totalGSTWords: string;
  billAmountWords: string;
}) {
  const { bank } = invoiceConfig;

  return (
    <>
      <div className="border-b border-current">
        <Row label="Bank Name" value={bank.bankName} />
        <Row label="Branch Name" value={bank.branchName} />
        <Row label="Bank A/c. No." value={bank.accountNumber} />
        <Row label="RTGS/IFSC Code" value={bank.ifscCode} />
      </div>
      <div className="h-[100px] border-b border-current">
        <div className="flex p-1 pb-0">
          <span className="w-[20%] font-semibold">Total GST</span>
          <span>:</span>
          <span className="ml-3 w-[80%]">{totalGSTWords}</span>
        </div>
        <div className="flex p-1 pb-0">
          <span className="w-[20%] font-semibold">Bill Amount</span>
          <span>:</span>
          <span className="ml-3 w-[80%]">{billAmountWords}</span>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex p-1 pb-0">
      <span className="w-36 font-semibold">{label}</span>
      <span className="font-semibold">:</span>
      <span className="ml-3 uppercase">{value}</span>
    </div>
  );
}
