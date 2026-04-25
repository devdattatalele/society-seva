import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const societyId = session.societyId;

  const [
    totalMembers,
    totalBills,
    unpaidBills,
    cashCollection,
    bankCollection,
    residentialUnits,
    commercialUnits,
    previousCash,
    previousBank,
    dueMembers,
  ] = await Promise.all([
    prisma.member.count({ where: { societyId } }),
    prisma.bill.count({ where: { societyId } }),
    prisma.bill.count({ where: { societyId, status: "UNPAID" } }),
    prisma.receipt.aggregate({ where: { societyId, paymentMode: "CASH" }, _sum: { amount: true } }),
    prisma.receipt.aggregate({ where: { societyId, paymentMode: { not: "CASH" } }, _sum: { amount: true } }),
    prisma.unit.count({ where: { societyId, type: "RESIDENTIAL" } }),
    prisma.unit.count({ where: { societyId, type: "COMMERCIAL" } }),
    // Previous period collections (last financial year rough estimate)
    prisma.receipt.aggregate({
      where: {
        societyId,
        paymentMode: "CASH",
        date: { lt: new Date(new Date().getFullYear(), 3, 1) }, // Before April current year
      },
      _sum: { amount: true },
    }),
    prisma.receipt.aggregate({
      where: {
        societyId,
        paymentMode: { not: "CASH" },
        date: { lt: new Date(new Date().getFullYear(), 3, 1) },
      },
      _sum: { amount: true },
    }),
    // Due members - members with unpaid bills
    prisma.bill.findMany({
      where: { societyId, status: { in: ["UNPAID", "PARTIAL"] } },
      include: { member: true, unit: true },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  // Monthly receipt data for trial balance chart (current FY)
  // Use society's configured financial year instead of system date
  const society = await prisma.society.findUnique({ where: { id: societyId }, select: { financialYear: true } });
  const fyString = society?.financialYear || "2024-25"; // e.g. "2024-25"
  const fyStartYear = parseInt(fyString.split("-")[0], 10); // 2024
  const fyStart = new Date(fyStartYear, 3, 1); // April 1 of start year

  const monthlyReceipts = await prisma.receipt.groupBy({
    by: ["date"],
    where: {
      societyId,
      date: { gte: fyStart },
    },
    _sum: { amount: true },
  });

  const monthlyPayments = await prisma.payment.groupBy({
    by: ["date"],
    where: {
      societyId,
      date: { gte: fyStart },
    },
    _sum: { amount: true },
  });

  // Aggregate by month
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const trialBalanceData = months.map((month, i) => {
    const monthIndex = (i + 3) % 12; // April = 3
    const year = monthIndex < 3 ? fyStart.getFullYear() + 1 : fyStart.getFullYear();

    const income = monthlyReceipts
      .filter((r) => {
        const d = new Date(r.date);
        return d.getMonth() === monthIndex && d.getFullYear() === year;
      })
      .reduce((sum, r) => sum + (r._sum.amount || 0), 0);

    const expense = monthlyPayments
      .filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() === monthIndex && d.getFullYear() === year;
      })
      .reduce((sum, p) => sum + (p._sum.amount || 0), 0);

    return { month, income, expense, balance: income - expense };
  });

  const dueMembersList = dueMembers.map((bill) => ({
    unitNo: bill.unit.unitNo,
    memberName: bill.member.name,
    dueAmount: bill.totalAmount - bill.paidAmount,
    month: bill.month,
  }));

  const totalUnits = residentialUnits + commercialUnits;
  const resPct = totalUnits > 0 ? Math.round((residentialUnits / totalUnits) * 100) : 0;
  const comPct = totalUnits > 0 ? Math.round((commercialUnits / totalUnits) * 100) : 0;

  return NextResponse.json({
    totalMembers,
    totalBills,
    unpaidBills,
    cashCollection: cashCollection._sum.amount || 0,
    bankCollection: bankCollection._sum.amount || 0,
    previousCash: previousCash._sum.amount || 0,
    previousBank: previousBank._sum.amount || 0,
    residentialPct: resPct,
    commercialPct: comPct,
    trialBalanceData,
    dueMembers: dueMembersList,
  });
}
