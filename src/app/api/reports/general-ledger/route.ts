import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const ledgerHeadId = searchParams.get("ledgerHeadId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!ledgerHeadId) {
    return NextResponse.json({ error: "ledgerHeadId required" }, { status: 400 });
  }

  const where: Record<string, unknown> = { ledgerHeadId };
  if (from || to) {
    where.voucher = { date: {} };
    if (from) ((where.voucher as Record<string, unknown>).date as Record<string, unknown>).gte = new Date(from);
    if (to) ((where.voucher as Record<string, unknown>).date as Record<string, unknown>).lte = new Date(to);
  }

  const lines = await prisma.journalLine.findMany({
    where,
    include: {
      voucher: true,
      ledgerHead: true,
    },
    orderBy: { voucher: { date: "asc" } },
  });

  let balance = 0;
  const entries = lines.map((line) => {
    const debit = line.type === "DEBIT" ? line.amount : 0;
    const credit = line.type === "CREDIT" ? line.amount : 0;
    balance += debit - credit;

    return {
      date: line.voucher.date,
      voucherNo: line.voucher.voucherNo,
      particular: line.ledgerHead.name,
      debit,
      credit,
      balance,
    };
  });

  return NextResponse.json(entries);
}
