import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = { societyId: session.societyId };

  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }
  if (type && type !== "All") {
    where.type = type.toLowerCase();
  }

  const entries = await prisma.cashEntry.findMany({
    where,
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

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const entry = await prisma.cashEntry.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      voucherNo: body.voucherNo,
      type: body.type,
      particular: body.particular,
      receipt: parseFloat(body.receipt || "0"),
      payment: parseFloat(body.payment || "0"),
      societyId: session.societyId,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
