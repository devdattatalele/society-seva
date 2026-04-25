import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const societyId = session.societyId;

  // Get all ledger heads with their journal lines
  const ledgerHeads = await prisma.ledgerHead.findMany({
    where: { societyId },
    include: {
      journalLines: true,
      subGroup: true,
    },
  });

  const entries = ledgerHeads.map((head) => {
    const totalDebit = head.journalLines
      .filter((l) => l.type === "DEBIT")
      .reduce((sum, l) => sum + l.amount, 0);

    const totalCredit = head.journalLines
      .filter((l) => l.type === "CREDIT")
      .reduce((sum, l) => sum + l.amount, 0);

    const openingBalance = head.openingBalance || 0;
    const closingBalance = openingBalance + totalDebit - totalCredit;

    return {
      id: head.id,
      name: head.name,
      code: head.code,
      type: head.type,
      subGroup: head.subGroup?.name || "-",
      openingBalance,
      totalDebit,
      totalCredit,
      closingBalance,
    };
  });

  // Also add member receivables (bills - receipts)
  const totalBilled = await prisma.bill.aggregate({
    where: { societyId },
    _sum: { totalAmount: true },
  });
  const totalReceived = await prisma.receipt.aggregate({
    where: { societyId },
    _sum: { amount: true },
  });
  const totalPaid = await prisma.payment.aggregate({
    where: { societyId },
    _sum: { amount: true },
  });

  const memberReceivables = (totalBilled._sum.totalAmount || 0) - (totalReceived._sum.amount || 0);

  const grandTotalDebit = entries.reduce((s, e) => s + e.totalDebit, 0) + (totalBilled._sum.totalAmount || 0);
  const grandTotalCredit = entries.reduce((s, e) => s + e.totalCredit, 0) + (totalReceived._sum.amount || 0);

  return NextResponse.json({
    entries,
    memberReceivables,
    totalPayments: totalPaid._sum.amount || 0,
    totalBilled: totalBilled._sum.totalAmount || 0,
    totalReceived: totalReceived._sum.amount || 0,
    grandTotalDebit,
    grandTotalCredit,
  });
}
