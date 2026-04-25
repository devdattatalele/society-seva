import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await prisma.member.findMany({
    where: { societyId: session.societyId },
    include: { units: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  // Count existing members for auto member number
  const count = await prisma.member.count({ where: { societyId: session.societyId } });

  const member = await prisma.member.create({
    data: {
      memberNo: String(count + 1).padStart(5, "0"),
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      occupation: body.occupation || null,
      aadhaarNo: body.aadhaarNo || null,
      panNo: body.panNo || null,
      nomineeName: body.nomineeName || null,
      nomineeRelation: body.nomineeRelation || null,
      dateOfEntry: body.dateOfEntry ? new Date(body.dateOfEntry) : new Date(),
      openingPrincipal: body.openingPrincipal || 0,
      openingInterest: body.openingInterest || 0,
      openingTax: body.openingTax || 0,
      societyId: session.societyId,
    },
  });

  // Create unit if unitNo provided
  if (body.unitNo) {
    const building = await prisma.building.findFirst({
      where: { societyId: session.societyId },
    });

    if (building) {
      await prisma.unit.create({
        data: {
          unitNo: body.unitNo,
          wing: body.wing || null,
          type: body.unitType || "RESIDENTIAL",
          area: body.area || null,
          carpetArea: body.carpetArea || null,
          buildingId: building.id,
          societyId: session.societyId,
          memberId: member.id,
        },
      });
    }
  }

  // If opening balance > 0, create an opening balance journal entry
  const totalOpening = (body.openingPrincipal || 0) + (body.openingInterest || 0) + (body.openingTax || 0);
  if (totalOpening > 0) {
    await prisma.cashEntry.create({
      data: {
        date: body.dateOfEntry ? new Date(body.dateOfEntry) : new Date(),
        particular: `Opening Balance - ${body.name}`,
        type: "opening",
        receipt: totalOpening,
        societyId: session.societyId,
      },
    });
  }

  return NextResponse.json(member, { status: 201 });
}
