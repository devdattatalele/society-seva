import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fromMemberId, toMemberId, unitId, notes } = await req.json();

  if (!fromMemberId || !toMemberId || !unitId) {
    return NextResponse.json({ error: "From member, to member, and unit are required" }, { status: 400 });
  }

  // Transfer the unit to the new member
  await prisma.unit.update({
    where: { id: unitId },
    data: { memberId: toMemberId },
  });

  // Record the transfer
  const transfer = await prisma.memberTransfer.create({
    data: {
      fromMemberId,
      toMemberId,
      unitId,
      notes,
      societyId: session.societyId,
    },
  });

  return NextResponse.json(transfer, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const transfers = await prisma.memberTransfer.findMany({
    where: { societyId: session.societyId },
    include: {
      fromMember: true,
      toMember: true,
    },
    orderBy: { transferDate: "desc" },
  });

  return NextResponse.json(transfers);
}
