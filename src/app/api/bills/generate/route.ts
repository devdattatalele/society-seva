import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { month, billType } = body; // month e.g. "April 2025", billType: "REGULAR" | "SUPPLEMENTARY"

  if (!month) {
    return NextResponse.json({ error: "Month is required" }, { status: 400 });
  }

  const societyId = session.societyId;

  // Get society config for interest/GST settings
  const society = await prisma.society.findUnique({ where: { id: societyId } });
  if (!society) return NextResponse.json({ error: "Society not found" }, { status: 404 });

  // Get all active members with units
  const members = await prisma.member.findMany({
    where: { societyId, isActive: true },
    include: { units: true },
  });

  // Get applicable tariffs (MONTHLY tariffs for monthly billing, etc.)
  const tariffs = await prisma.tariff.findMany({
    where: { societyId },
    orderBy: { sortOrder: "asc" },
  });

  // Filter tariffs by billing frequency
  const applicableTariffs = tariffs.filter((t) => {
    if (society.billingFrequency === "MONTHLY") return t.frequency === "MONTHLY";
    if (society.billingFrequency === "QUARTERLY") return t.frequency === "MONTHLY" || t.frequency === "QUARTERLY";
    if (society.billingFrequency === "HALF_YEARLY") return t.frequency === "MONTHLY" || t.frequency === "QUARTERLY" || t.frequency === "HALF_YEARLY";
    return true; // YEARLY - include all
  });

  // Check for already-generated bills for this month
  const existingBills = await prisma.bill.findMany({
    where: { societyId, month, billType: billType || "REGULAR" },
    select: { memberId: true },
  });
  const alreadyBilled = new Set(existingBills.map((b) => b.memberId));

  const now = new Date();
  const billCount = await prisma.bill.count({ where: { societyId } });
  let counter = billCount;

  const results: { memberId: string; memberName: string; unitNo: string; billNo: string; totalAmount: number; interestAmount: number; taxAmount: number }[] = [];

  for (const member of members) {
    if (alreadyBilled.has(member.id)) continue;
    if (member.units.length === 0) continue;

    const unit = member.units[0]; // Primary unit

    // Calculate interest on overdue bills
    let interestAmount = 0;
    if (society.interestRate > 0) {
      const unpaidBills = await prisma.bill.findMany({
        where: { memberId: member.id, societyId, status: { in: ["UNPAID", "PARTIAL"] } },
      });

      for (const bill of unpaidBills) {
        const overdue = bill.totalAmount - bill.paidAmount;
        if (overdue <= 0) continue;

        const dueDate = bill.dueDate || bill.date;
        const daysOverdue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

        if (daysOverdue <= (society.gracePeriodDays || 0)) continue;

        const effectiveDays = daysOverdue - (society.gracePeriodDays || 0);

        if (society.interestType === "SIMPLE") {
          if (society.interestMethod === "PER_DAY") {
            interestAmount += (overdue * society.interestRate * effectiveDays) / (365 * 100);
          } else {
            // PER_MONTH
            const months = effectiveDays / 30;
            interestAmount += (overdue * society.interestRate * months) / (12 * 100);
          }
        } else {
          // COMPOUND
          if (society.interestMethod === "PER_DAY") {
            interestAmount += overdue * (Math.pow(1 + society.interestRate / (365 * 100), effectiveDays) - 1);
          } else {
            const months = Math.floor(effectiveDays / 30);
            interestAmount += overdue * (Math.pow(1 + society.interestRate / (12 * 100), months) - 1);
          }
        }
      }
    }

    interestAmount = Math.round(interestAmount * 100) / 100;

    // Calculate tariff total
    const tariffTotal = applicableTariffs.reduce((sum, t) => sum + t.amount, 0);

    // Calculate GST/tax
    let taxAmount = 0;
    if (society.applyGST && society.gstRate > 0) {
      taxAmount = Math.round(tariffTotal * society.gstRate) / 100;
    }

    const totalAmount = tariffTotal + interestAmount + taxAmount;

    // Due date: 15 days from now (or configurable)
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 15);

    counter++;
    const billNo = `${society.billPrefix || "BILL"}-${String(counter).padStart(4, "0")}`;

    // Create bill with items
    await prisma.bill.create({
      data: {
        billNo,
        date: now,
        dueDate,
        month,
        totalAmount,
        interestAmount,
        taxAmount,
        billType: billType || "REGULAR",
        memberId: member.id,
        unitId: unit.id,
        societyId,
        items: {
          create: [
            ...applicableTariffs.map((t) => ({
              name: t.name,
              amount: t.amount,
              tariffId: t.id,
            })),
            ...(interestAmount > 0
              ? [{ name: "Interest on Overdue", amount: interestAmount }]
              : []),
            ...(taxAmount > 0
              ? [{ name: `GST @ ${society.gstRate}%`, amount: taxAmount }]
              : []),
          ],
        },
      },
    });

    results.push({
      memberId: member.id,
      memberName: member.name,
      unitNo: unit.unitNo,
      billNo,
      totalAmount,
      interestAmount,
      taxAmount,
    });
  }

  return NextResponse.json({
    generated: results.length,
    skipped: alreadyBilled.size,
    bills: results,
  }, { status: 201 });
}

// Preview endpoint - GET to see what bills would be generated
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  if (!month) return NextResponse.json({ error: "month required" }, { status: 400 });

  const societyId = session.societyId;

  const society = await prisma.society.findUnique({ where: { id: societyId } });
  if (!society) return NextResponse.json({ error: "Society not found" }, { status: 404 });

  const members = await prisma.member.findMany({
    where: { societyId, isActive: true },
    include: { units: true },
  });

  const tariffs = await prisma.tariff.findMany({
    where: { societyId },
    orderBy: { sortOrder: "asc" },
  });

  const applicableTariffs = tariffs.filter((t) => {
    if (society.billingFrequency === "MONTHLY") return t.frequency === "MONTHLY";
    if (society.billingFrequency === "QUARTERLY") return t.frequency === "MONTHLY" || t.frequency === "QUARTERLY";
    if (society.billingFrequency === "HALF_YEARLY") return t.frequency === "MONTHLY" || t.frequency === "QUARTERLY" || t.frequency === "HALF_YEARLY";
    return true;
  });

  const existingBills = await prisma.bill.findMany({
    where: { societyId, month, billType: "REGULAR" },
    select: { memberId: true },
  });
  const alreadyBilled = new Set(existingBills.map((b) => b.memberId));

  const now = new Date();
  const tariffTotal = applicableTariffs.reduce((sum, t) => sum + t.amount, 0);

  const preview = [];
  for (const member of members) {
    if (member.units.length === 0) continue;

    let interestAmount = 0;
    if (society.interestRate > 0) {
      const unpaidBills = await prisma.bill.findMany({
        where: { memberId: member.id, societyId, status: { in: ["UNPAID", "PARTIAL"] } },
      });
      for (const bill of unpaidBills) {
        const overdue = bill.totalAmount - bill.paidAmount;
        if (overdue <= 0) continue;
        const dueDate = bill.dueDate || bill.date;
        const daysOverdue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        if (daysOverdue <= (society.gracePeriodDays || 0)) continue;
        const effectiveDays = daysOverdue - (society.gracePeriodDays || 0);
        if (society.interestType === "SIMPLE") {
          if (society.interestMethod === "PER_DAY") {
            interestAmount += (overdue * society.interestRate * effectiveDays) / (365 * 100);
          } else {
            interestAmount += (overdue * society.interestRate * (effectiveDays / 30)) / (12 * 100);
          }
        } else {
          if (society.interestMethod === "PER_DAY") {
            interestAmount += overdue * (Math.pow(1 + society.interestRate / (365 * 100), effectiveDays) - 1);
          } else {
            interestAmount += overdue * (Math.pow(1 + society.interestRate / (12 * 100), Math.floor(effectiveDays / 30)) - 1);
          }
        }
      }
    }
    interestAmount = Math.round(interestAmount * 100) / 100;

    let taxAmount = 0;
    if (society.applyGST && society.gstRate > 0) {
      taxAmount = Math.round(tariffTotal * society.gstRate) / 100;
    }

    preview.push({
      memberId: member.id,
      memberName: member.name,
      unitNo: member.units[0].unitNo,
      tariffTotal,
      interestAmount,
      taxAmount,
      totalAmount: tariffTotal + interestAmount + taxAmount,
      alreadyBilled: alreadyBilled.has(member.id),
    });
  }

  return NextResponse.json({
    tariffs: applicableTariffs.map(t => ({ name: t.name, amount: t.amount })),
    tariffTotal,
    gstRate: society.applyGST ? society.gstRate : 0,
    interestRate: society.interestRate,
    interestType: society.interestType,
    preview,
  });
}
