export default function InvoiceSignature({
  sellerName,
  signatureImage,
}: {
  sellerName: string;
  /** Owner's signature (data: URL); nothing is shown when absent. */
  signatureImage: string | null;
}) {
  return (
    <div className="w-[43%] text-right">
      <p className="text-sm font-bold">For, {sellerName}</p>
      {signatureImage && (
        // eslint-disable-next-line @next/next/no-img-element -- data: URL, also captured by html-to-image for the PDF
        <img
          src={signatureImage}
          alt="Signature"
          className="mt-1 ml-auto block h-12 max-w-[180px] object-contain"
        />
      )}
    </div>
  );
}
