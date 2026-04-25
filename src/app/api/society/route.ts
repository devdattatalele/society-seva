import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const society = await prisma.society.findUnique({
    where: { id: session.societyId },
  });

  return NextResponse.json(society);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const society = await prisma.society.update({
    where: { id: session.societyId },
    data: {
      name: body.name,
      regNo: body.regNo,
      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      phone: body.phone,
      email: body.email,
      financialYear: body.financialYear,
      secretaryName: body.secretaryName,
      chairmanName: body.chairmanName,
      panNo: body.panNo,
      gstNo: body.gstNo,
      billingFrequency: body.billingFrequency,
      interestType: body.interestType,
      interestRate: body.interestRate !== undefined ? parseFloat(body.interestRate) : undefined,
      interestMethod: body.interestMethod,
      applyGST: body.applyGST,
      gstRate: body.gstRate !== undefined ? parseFloat(body.gstRate) : undefined,
      gracePeriodDays: body.gracePeriodDays !== undefined ? parseInt(body.gracePeriodDays) : undefined,
      billNote: body.billNote,
      billPrefix: body.billPrefix,
      receiptPrefix: body.receiptPrefix,
      paymentPrefix: body.paymentPrefix,
    },
  });

  return NextResponse.json(society);
}
