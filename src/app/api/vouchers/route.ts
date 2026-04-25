import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vouchers = await prisma.journalVoucher.findMany({
    where: { societyId: session.societyId },
    include: { lines: { include: { ledgerHead: true } }, member: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(vouchers);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, notes, memberId, lines } = body;

  const voucherCount = await prisma.journalVoucher.count({ where: { societyId: session.societyId } });

  const voucher = await prisma.journalVoucher.create({
    data: {
      voucherNo: `JV-${String(voucherCount + 1).padStart(4, "0")}`,
      date: date ? new Date(date) : new Date(),
      notes,
      memberId,
      societyId: session.societyId,
      lines: {
        create: (lines || []).map((line: { type: string; amount: number; ledgerHeadId: string }) => ({
          type: line.type,
          amount: line.amount,
          ledgerHeadId: line.ledgerHeadId,
        })),
      },
    },
    include: { lines: true },
  });

  return NextResponse.json(voucher, { status: 201 });
}
