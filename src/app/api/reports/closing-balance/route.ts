import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await prisma.member.findMany({
    where: { societyId: session.societyId },
    include: {
      units: true,
      bills: true,
      receipts: true,
    },
  });

  const balances = members.map((member) => {
    const totalBilled = member.bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalPaid = member.bills.reduce((sum, b) => sum + b.paidAmount, 0);
    const principalBalance = totalBilled - totalPaid;

    // Interest calculation: 21% per annum on overdue, simple interest
    // For each unpaid bill, calculate interest from due date to now
    let interestBalance = 0;
    const now = new Date();
    for (const bill of member.bills) {
      if (bill.status !== "PAID" && bill.dueDate) {
        const dueDate = new Date(bill.dueDate);
        if (now > dueDate) {
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          const overdue = bill.totalAmount - bill.paidAmount;
          interestBalance += (overdue * 0.21 * daysOverdue) / 365;
        }
      }
    }

    const taxBalance = 0; // GST/tax can be calculated if tariff has tax component
    const totalBalance = principalBalance + interestBalance + taxBalance;

    return {
      unitNo: member.units[0]?.unitNo || "",
      memberName: member.name,
      principalBalance: Math.round(principalBalance * 100) / 100,
      interestBalance: Math.round(interestBalance * 100) / 100,
      taxBalance: Math.round(taxBalance * 100) / 100,
      totalBalance: Math.round(totalBalance * 100) / 100,
    };
  });

  // Totals
  const totalDr = balances.reduce((s, b) => s + Math.max(b.totalBalance, 0), 0);
  const totalCr = balances.reduce((s, b) => s + Math.max(-b.totalBalance, 0), 0);

  return NextResponse.json({ balances, totalDr, totalCr });
}
