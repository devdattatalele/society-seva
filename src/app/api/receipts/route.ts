import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const receipts = await prisma.receipt.findMany({
    where: { societyId: session.societyId },
    include: { member: true, bill: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(receipts);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { memberId, billId, amount, paymentMode, chequeNo, bankName, notes } = body;

  if (!memberId || !amount) {
    return NextResponse.json({ error: "Member and amount required" }, { status: 400 });
  }

  const receiptCount = await prisma.receipt.count({ where: { societyId: session.societyId } });

  const receipt = await prisma.receipt.create({
    data: {
      receiptNo: `RCP-${String(receiptCount + 1).padStart(4, "0")}`,
      amount: parseFloat(amount),
      paymentMode: paymentMode || "CASH",
      chequeNo,
      bankName,
      notes,
      memberId,
      billId,
      societyId: session.societyId,
    },
  });

  // Update bill paid amount if billId provided
  if (billId) {
    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (bill) {
      const newPaid = bill.paidAmount + parseFloat(amount);
      await prisma.bill.update({
        where: { id: billId },
        data: {
          paidAmount: newPaid,
          status: newPaid >= bill.totalAmount ? "PAID" : "PARTIAL",
        },
      });
    }
  }

  return NextResponse.json(receipt, { status: 201 });
}
