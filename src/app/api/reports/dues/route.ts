import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  const where: Record<string, unknown> = { societyId: session.societyId };
  if (month) where.month = month;

  const bills = await prisma.bill.findMany({
    where,
    include: {
      member: true,
      unit: true,
    },
    orderBy: { date: "desc" },
  });

  const duesData = bills.map((bill) => ({
    id: bill.id,
    unitNo: bill.unit.unitNo,
    memberName: bill.member.name,
    billAmount: bill.totalAmount,
    paidAmount: bill.paidAmount,
    dueAmount: bill.totalAmount - bill.paidAmount,
    status: bill.status,
    month: bill.month,
  }));

  return NextResponse.json(duesData);
}
