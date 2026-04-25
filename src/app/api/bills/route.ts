import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { societyId: session.societyId };
  if (memberId) where.memberId = memberId;
  if (status) where.status = status;
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }

  const bills = await prisma.bill.findMany({
    where,
    include: { member: true, unit: true, items: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(bills);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { memberId, unitId, month, items } = body;

  if (!memberId || !unitId || !month) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const totalAmount = (items || []).reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
  const billCount = await prisma.bill.count({ where: { societyId: session.societyId } });

  const bill = await prisma.bill.create({
    data: {
      billNo: `BILL-${String(billCount + 1).padStart(4, "0")}`,
      month,
      totalAmount,
      memberId,
      unitId,
      societyId: session.societyId,
      items: {
        create: (items || []).map((item: { name: string; amount: number }) => ({
          name: item.name,
          amount: item.amount,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(bill, { status: 201 });
}
