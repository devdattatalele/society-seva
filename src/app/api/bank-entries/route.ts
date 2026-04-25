import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const bankAccountId = searchParams.get("bankAccountId");

  const where: Record<string, unknown> = { societyId: session.societyId };

  if (bankAccountId) where.bankAccountId = bankAccountId;
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }

  const entries = await prisma.bankEntry.findMany({
    where,
    include: { bankAccount: true },
    orderBy: { date: "asc" },
  });

  // Calculate running balance
  let balance = 0;
  const withBalance = entries.map((e) => {
    balance += e.receipt - e.payment;
    return { ...e, balance };
  });

  return NextResponse.json(withBalance);
}
