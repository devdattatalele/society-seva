import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!memberId) {
    return NextResponse.json({ error: "memberId required" }, { status: 400 });
  }

  // Get all bills for this member
  const billWhere: Record<string, unknown> = { memberId, societyId: session.societyId };
  if (from || to) {
    billWhere.date = {};
    if (from) (billWhere.date as Record<string, unknown>).gte = new Date(from);
    if (to) (billWhere.date as Record<string, unknown>).lte = new Date(to);
  }

  const bills = await prisma.bill.findMany({
    where: billWhere,
    orderBy: { date: "asc" },
  });

  // Get all receipts for this member
  const receiptWhere: Record<string, unknown> = { memberId, societyId: session.societyId };
  if (from || to) {
    receiptWhere.date = {};
    if (from) (receiptWhere.date as Record<string, unknown>).gte = new Date(from);
    if (to) (receiptWhere.date as Record<string, unknown>).lte = new Date(to);
  }

  const receipts = await prisma.receipt.findMany({
    where: receiptWhere,
    orderBy: { date: "asc" },
  });

  // Combine and sort by date
  type LedgerEntry = { date: Date; particular: string; billAmount: number; receipt: number; balance: number };
  const entries: LedgerEntry[] = [];

  let balance = 0;

  // Merge bills and receipts in date order
  const allItems = [
    ...bills.map((b) => ({ date: b.date, type: "bill" as const, data: b })),
    ...receipts.map((r) => ({ date: r.date, type: "receipt" as const, data: r })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const item of allItems) {
    if (item.type === "bill") {
      balance += item.data.totalAmount;
      entries.push({
        date: item.date,
        particular: `Bill ${item.data.billNo} - ${item.data.month}`,
        billAmount: item.data.totalAmount,
        receipt: 0,
        balance,
      });
    } else {
      balance -= item.data.amount;
      entries.push({
        date: item.date,
        particular: `Receipt ${item.data.receiptNo}`,
        billAmount: 0,
        receipt: item.data.amount,
        balance,
      });
    }
  }

  return NextResponse.json(entries);
}
