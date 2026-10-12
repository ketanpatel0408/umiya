import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";

/**
 * Distinct buyers from previously created invoices, used to suggest and
 * auto-fill Buyer Details on the invoice form. Most recently used details
 * win when the same buyer appears on multiple invoices.
 */
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  try {
    const rows = await prisma.invoice.findMany({
      // Admins see every invoice's buyers; normal users only their own.
      where: auth.user.role === "ADMIN" ? undefined : { ownerId: auth.user.id },
      select: {
        buyerName: true,
        buyerGSTIN: true,
        buyerPAN: true,
        buyerAddress: true,
        buyerState: true,
        buyerStateCode: true,
        buyerAadhaar: true,
      },
      orderBy: [{ invoiceDate: "desc" }, { createdAt: "desc" }],
    });

    const seen = new Set<string>();
    const buyers = rows.filter((row) => {
      const name = row.buyerName.trim();
      if (!name) return false;
      const key = `${name.toLowerCase()}|${(row.buyerGSTIN ?? "").trim().toUpperCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json(buyers, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch buyers:", error);
    return NextResponse.json(
      { error: "Failed to fetch buyers" },
      { status: 500 }
    );
  }
}
