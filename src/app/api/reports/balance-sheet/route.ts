import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const societyId = session.societyId;

  // Assets
  // 1. Cash in hand
  const cashEntries = await prisma.cashEntry.findMany({ where: { societyId } });
  const cashBalance = cashEntries.reduce((s, e) => s + e.receipt - e.payment, 0);

  // 2. Bank balances
  const bankAccounts = await prisma.bankAccount.findMany({
    where: { societyId },
    include: { bankEntries: true },
  });
  const bankBalances = bankAccounts.map((ba) => {
    const balance = ba.bankEntries.reduce((s, e) => s + e.receipt - e.payment, 0) + ba.balance;
    return { name: `${ba.bankName} (${ba.accountNo})`, amount: balance };
  });
  const totalBankBalance = bankBalances.reduce((s, b) => s + b.amount, 0);

  // 3. Member receivables (outstanding dues)
  const totalBilled = await prisma.bill.aggregate({ where: { societyId }, _sum: { totalAmount: true } });
  const totalReceived = await prisma.receipt.aggregate({ where: { societyId }, _sum: { amount: true } });
  const memberReceivables = (totalBilled._sum.totalAmount || 0) - (totalReceived._sum.amount || 0);

  // Liabilities
  // 1. Member deposits / opening balances
  const members = await prisma.member.findMany({ where: { societyId } });
  const totalOpeningBalance = members.reduce((s, m) => s + m.openingPrincipal + m.openingInterest + m.openingTax, 0);

  // 2. Income & Expenditure surplus
  const bills = await prisma.bill.findMany({ where: { societyId }, include: { items: true } });
  const totalIncome = bills.reduce((s, b) => s + b.totalAmount, 0);
  const totalPayments = await prisma.payment.aggregate({ where: { societyId }, _sum: { amount: true } });
  const surplus = totalIncome - (totalPayments._sum.amount || 0);

  const assets = [
    { name: "Cash in Hand", amount: Math.max(cashBalance, 0) },
    ...bankBalances,
    { name: "Member Receivables (Outstanding Dues)", amount: Math.max(memberReceivables, 0) },
  ];
  const totalAssets = assets.reduce((s, a) => s + a.amount, 0);

  const liabilities = [
    { name: "Member Opening Balances", amount: totalOpeningBalance },
    { name: "Surplus / (Deficit) from I&E", amount: surplus },
  ];
  const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0);

  return NextResponse.json({
    assets,
    totalAssets,
    liabilities,
    totalLiabilities,
    asOnDate: new Date().toISOString(),
  });
}
