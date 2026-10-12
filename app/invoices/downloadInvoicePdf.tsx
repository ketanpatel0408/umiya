import { createRoot } from "react-dom/client";
import type { Invoice } from "./types";
import InvoiceDocument from "./[id]/InvoiceDocument";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/** "26-27/01" -> "Invoice_26-27_01.pdf" (slashes aren't valid in file names). */
export function invoicePdfFileName(invoice: Invoice): string {
  return `Invoice_${invoice.invoiceNumber.replace(/[\\/:*?"<>|\s]+/g, "_")}.pdf`;
}

/**
 * Renders the printable invoice off-screen, rasterises it and saves it as
 * a single-page A4 PDF. The libraries are loaded on demand so they don't
 * weigh down the pages that never download anything.
 */
export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const [{ toJpeg }, { jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);

  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.background = "#ffffff";
  document.body.appendChild(host);

  const root = createRoot(host);
  try {
    root.render(<InvoiceDocument invoice={invoice} />);
    // Let React commit and the browser lay out / load fonts before capture.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await document.fonts.ready;

    const node = host.firstElementChild as HTMLElement | null;
    if (!node) throw new Error("Invoice document did not render");

    // JPEG keeps the file small (~a few hundred KB) while staying sharp at 2x.
    const dataUrl = await toJpeg(node, {
      pixelRatio: 2,
      quality: 0.92,
      backgroundColor: "#ffffff",
      cacheBust: true,
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const props = pdf.getImageProperties(dataUrl);
    let width = A4_WIDTH_MM;
    let height = (props.height * width) / props.width;
    // Keep it on one page: shrink to fit if the invoice is taller than A4.
    if (height > A4_HEIGHT_MM) {
      height = A4_HEIGHT_MM;
      width = (props.width * height) / props.height;
    }
    pdf.addImage(dataUrl, "JPEG", (A4_WIDTH_MM - width) / 2, 0, width, height);
    pdf.save(invoicePdfFileName(invoice));
  } finally {
    root.unmount();
    host.remove();
  }
}
