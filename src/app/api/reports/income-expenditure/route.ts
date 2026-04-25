import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const societyId = session.societyId;

  // Income: receipts from members + general receipts
  const totalReceipts = await prisma.receipt.aggregate({
    where: { societyId },
    _sum: { amount: true },
  });

  const cashReceipts = await prisma.cashEntry.aggregate({
    where: { societyId, type: "receipt" },
    _sum: { receipt: true },
  });

  // Income from tariff heads
  const tariffs = await prisma.tariff.findMany({
    where: { societyId },
    include: { ledgerHead: true },
  });

  const bills = await prisma.bill.findMany({
    where: { societyId },
    include: { items: true },
  });

  // Aggregate income by tariff name
  const incomeByHead: Record<string, number> = {};
  for (const bill of bills) {
    for (const item of bill.items) {
      const key = item.name;
      incomeByHead[key] = (incomeByHead[key] || 0) + item.amount;
    }
  }

  const incomeItems = Object.entries(incomeByHead).map(([name, amount]) => ({ name, amount }));
  const totalIncome = incomeItems.reduce((s, i) => s + i.amount, 0);

  // Expenses: payments
  const payments = await prisma.payment.findMany({
    where: { societyId },
  });

  // Aggregate expenses by payee/description
  const expenseByHead: Record<string, number> = {};
  for (const payment of payments) {
    const key = payment.description || payment.payee;
    expenseByHead[key] = (expenseByHead[key] || 0) + payment.amount;
  }

  const expenseItems = Object.entries(expenseByHead).map(([name, amount]) => ({ name, amount }));
  const totalExpense = expenseItems.reduce((s, i) => s + i.amount, 0);

  // General receipts (non-member)
  const generalReceipts = cashReceipts._sum.receipt || 0;

  return NextResponse.json({
    incomeItems,
    totalIncome,
    expenseItems,
    totalExpense,
    generalReceipts,
    surplus: totalIncome + generalReceipts - totalExpense,
  });
}
