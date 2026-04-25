import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const heads = await prisma.ledgerHead.findMany({
    where: { societyId: session.societyId },
    include: { subGroup: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(heads);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, code, type, subGroupId, openingBalance } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const head = await prisma.ledgerHead.create({
    data: {
      name, code, type: type || "INCOME",
      subGroupId: subGroupId || null,
      openingBalance: openingBalance || 0,
      societyId: session.societyId,
    },
  });

  return NextResponse.json(head, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, code, type, subGroupId, openingBalance } = await req.json();
  const head = await prisma.ledgerHead.update({
    where: { id },
    data: { name, code, type, subGroupId: subGroupId || null, openingBalance: openingBalance || 0 },
  });

  return NextResponse.json(head);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.ledgerHead.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
