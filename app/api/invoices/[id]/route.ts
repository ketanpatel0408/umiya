import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/guards";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return NextResponse.json(
      { error: "Invalid invoice ID" },
      { status: 400 }
    );
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        items: true,
      },
    });

    if (
      !invoice ||
      (auth.user.role !== "ADMIN" && invoice.ownerId !== auth.user.id)
    ) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}
