import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const certs = await prisma.shareCertificate.findMany({
    where: { societyId: session.societyId },
    include: { member: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(certs);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const cert = await prisma.shareCertificate.create({
    data: {
      serialNo: body.serialNo,
      certificateNo: body.certificateNo,
      date: body.date ? new Date(body.date) : new Date(),
      numberOfShares: parseInt(body.numberOfShares) || 1,
      valueOfShare: parseFloat(body.valueOfShare) || 0,
      regNoOfTransferor: body.regNoOfTransferor,
      dateOfPaymentEntrance: body.dateOfPaymentEntrance ? new Date(body.dateOfPaymentEntrance) : null,
      membershipCessationDate: body.membershipCessationDate ? new Date(body.membershipCessationDate) : null,
      cessationReason: body.cessationReason,
      remark: body.remark,
      memberId: body.memberId,
      societyId: session.societyId,
    },
  });

  return NextResponse.json(cert, { status: 201 });
}
