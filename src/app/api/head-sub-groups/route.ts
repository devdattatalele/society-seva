import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const groups = await prisma.headSubGroup.findMany({
    where: { societyId: session.societyId },
    include: { _count: { select: { heads: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, code, groupType } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const group = await prisma.headSubGroup.create({
    data: { name, code, groupType: groupType || "INCOME", societyId: session.societyId },
  });

  return NextResponse.json(group, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, code, groupType } = await req.json();
  const group = await prisma.headSubGroup.update({
    where: { id },
    data: { name, code, groupType },
  });

  return NextResponse.json(group);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.headSubGroup.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
