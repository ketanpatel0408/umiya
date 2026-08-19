export default function InvoiceSignature({ sellerName }: { sellerName: string }) {
  return (
    <div className="w-[43%] text-right">
      <p className="text-sm font-bold">For, {sellerName}</p>
    </div>
  );
}
