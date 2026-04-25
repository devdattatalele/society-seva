import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payments = await prisma.payment.findMany({
    where: { societyId: session.societyId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const paymentCount = await prisma.payment.count({ where: { societyId: session.societyId } });

  const payment = await prisma.payment.create({
    data: {
      voucherNo: body.voucherNo || `PAY-${String(paymentCount + 1).padStart(4, "0")}`,
      date: body.date ? new Date(body.date) : new Date(),
      amount: parseFloat(body.amount),
      payee: body.payee,
      description: body.description,
      paymentMode: body.paymentMode || "CASH",
      chequeNo: body.chequeNo,
      bankName: body.bankName,
      societyId: session.societyId,
    },
  });

  // Also create a cash entry for tracking
  if (body.paymentMode === "CASH" || !body.paymentMode) {
    await prisma.cashEntry.create({
      data: {
        date: body.date ? new Date(body.date) : new Date(),
        voucherNo: payment.voucherNo,
        type: "payment",
        particular: `Payment to ${body.payee}${body.description ? ' - ' + body.description : ''}`,
        payment: parseFloat(body.amount),
        societyId: session.societyId,
      },
    });
  } else {
    // Bank entry
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { societyId: session.societyId },
    });
    if (bankAccount) {
      await prisma.bankEntry.create({
        data: {
          date: body.date ? new Date(body.date) : new Date(),
          particular: `Payment to ${body.payee}${body.description ? ' - ' + body.description : ''}`,
          payment: parseFloat(body.amount),
          bankAccountId: bankAccount.id,
          societyId: session.societyId,
        },
      });
    }
  }

  return NextResponse.json(payment, { status: 201 });
}
