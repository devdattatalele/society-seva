import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { members } = body;

  if (!Array.isArray(members) || members.length === 0) {
    return NextResponse.json({ error: "No member data provided" }, { status: 400 });
  }

  const societyId = session.societyId;

  // Get building for unit creation
  const building = await prisma.building.findFirst({
    where: { societyId },
  });

  if (!building) {
    return NextResponse.json({ error: "No building found. Create a building first." }, { status: 400 });
  }

  const existingCount = await prisma.member.count({ where: { societyId } });
  let counter = existingCount;

  const results: { name: string; unitNo: string; status: string }[] = [];

  for (const row of members) {
    try {
      counter++;
      const member = await prisma.member.create({
        data: {
          memberNo: String(counter).padStart(5, "0"),
          name: row.name || `Member ${counter}`,
          email: row.email || null,
          phone: row.phone || null,
          address: row.address || null,
          occupation: row.occupation || null,
          aadhaarNo: row.aadhaarNo || null,
          panNo: row.panNo || null,
          nomineeName: row.nomineeName || null,
          nomineeRelation: row.nomineeRelation || null,
          dateOfEntry: row.dateOfEntry ? new Date(row.dateOfEntry) : new Date(),
          openingPrincipal: parseFloat(row.openingPrincipal) || 0,
          openingInterest: parseFloat(row.openingInterest) || 0,
          openingTax: parseFloat(row.openingTax) || 0,
          societyId,
        },
      });

      // Create unit if unitNo provided
      if (row.unitNo) {
        await prisma.unit.create({
          data: {
            unitNo: row.unitNo,
            wing: row.wing || null,
            type: (row.unitType === "COMMERCIAL" ? "COMMERCIAL" : "RESIDENTIAL"),
            area: parseFloat(row.area) || null,
            carpetArea: parseFloat(row.carpetArea) || null,
            buildingId: building.id,
            societyId,
            memberId: member.id,
          },
        });
      }

      results.push({ name: row.name, unitNo: row.unitNo || "-", status: "success" });
    } catch (e) {
      results.push({ name: row.name || "Unknown", unitNo: row.unitNo || "-", status: `error: ${(e as Error).message}` });
    }
  }

  const success = results.filter(r => r.status === "success").length;
  const failed = results.filter(r => r.status !== "success").length;

  return NextResponse.json({ total: members.length, success, failed, results }, { status: 201 });
}
