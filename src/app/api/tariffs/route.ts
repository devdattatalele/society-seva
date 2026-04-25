import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tariffs = await prisma.tariff.findMany({
    where: { societyId: session.societyId },
    include: { ledgerHead: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(tariffs);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, amount, frequency, ledgerHeadId } = await req.json();
  if (!name || !amount) return NextResponse.json({ error: "Name and amount required" }, { status: 400 });

  const maxOrder = await prisma.tariff.aggregate({
    where: { societyId: session.societyId },
    _max: { sortOrder: true },
  });

  const tariff = await prisma.tariff.create({
    data: {
      name,
      amount: parseFloat(amount),
      frequency: frequency || "MONTHLY",
      ledgerHeadId,
      sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      societyId: session.societyId,
    },
  });

  return NextResponse.json(tariff, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, amount, frequency, ledgerHeadId, sortOrder } = await req.json();

  const tariff = await prisma.tariff.update({
    where: { id },
    data: { name, amount: parseFloat(amount), frequency, ledgerHeadId, sortOrder },
  });

  return NextResponse.json(tariff);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.tariff.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
