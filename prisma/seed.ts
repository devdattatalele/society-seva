import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/society_seva";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create society
  const society = await prisma.society.create({
    data: {
      name: "Viswa CHS Ltd",
      regNo: "MH/2020/12345",
      address: "Mumbai, Maharashtra",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: "9987919971",
      email: "info@viswachs.com",
      financialYear: "2024-25",
    },
  });

  // Create demo user (login: demo / 123)
  const hashedPassword = await bcrypt.hash("123", 10);
  await prisma.user.create({
    data: {
      userId: "demo",
      password: hashedPassword,
      name: "Demo",
      role: "ADMIN",
      societyId: society.id,
    },
  });

  // Create building
  const building = await prisma.building.create({
    data: {
      name: "Main Building",
      description: "Main residential building",
      address: "Mumbai, Maharashtra",
      wings: "A,B",
      totalFloors: 10,
      societyId: society.id,
    },
  });

  // Create head sub groups
  const incomeGroup = await prisma.headSubGroup.create({
    data: { name: "Income", code: "INC", societyId: society.id },
  });
  const expenseGroup = await prisma.headSubGroup.create({
    data: { name: "Expense", code: "EXP", societyId: society.id },
  });

  // Create ledger heads
  const maintenanceHead = await prisma.ledgerHead.create({
    data: { name: "Maintenance", code: "MAINT", type: "INCOME", subGroupId: incomeGroup.id, societyId: society.id },
  });
  await prisma.ledgerHead.create({
    data: { name: "Sinking Fund", code: "SINK", type: "INCOME", subGroupId: incomeGroup.id, societyId: society.id },
  });
  await prisma.ledgerHead.create({
    data: { name: "Water Charges", code: "WATER", type: "EXPENSE", subGroupId: expenseGroup.id, societyId: society.id },
  });
  await prisma.ledgerHead.create({
    data: { name: "Electricity", code: "ELEC", type: "EXPENSE", subGroupId: expenseGroup.id, societyId: society.id },
  });
  await prisma.ledgerHead.create({
    data: { name: "Repairs & Maintenance", code: "REP", type: "EXPENSE", subGroupId: expenseGroup.id, societyId: society.id },
  });

  // Create tariffs
  await prisma.tariff.createMany({
    data: [
      { name: "Maintenance Charges", amount: 1500, frequency: "MONTHLY", ledgerHeadId: maintenanceHead.id, sortOrder: 1, societyId: society.id },
      { name: "Sinking Fund", amount: 500, frequency: "MONTHLY", sortOrder: 2, societyId: society.id },
      { name: "Water Charges", amount: 200, frequency: "MONTHLY", sortOrder: 3, societyId: society.id },
      { name: "Parking Charges", amount: 300, frequency: "MONTHLY", sortOrder: 4, societyId: society.id },
    ],
  });

  // Create members and units
  const membersData = [
    { name: "Mr. AKHILESH", unitNo: "101", phone: "9876543210", email: "akhilesh@email.com" },
    { name: "Mr. ANIL KUMAR", unitNo: "102", phone: "9876543211", email: "anil@email.com" },
    { name: "Mr. SUNITA KUMAR", unitNo: "103", phone: "9876543212", email: "sunita@email.com" },
    { name: "Mr. DINESH KUMAR", unitNo: "104", phone: "9876543213", email: "dinesh@email.com" },
    { name: "Mr. Nadim", unitNo: "303", phone: "9876543214", email: "nadim@email.com" },
    { name: "Mr. sujeet kumar choudhary", unitNo: "2001", phone: "9876543215", email: "sujeet@email.com" },
    { name: "Mr. sujeet kumar", unitNo: "2001", phone: "9876543216", email: "sujeetk@email.com" },
    { name: "Mr. sujeet k kamat", unitNo: "2001", phone: "9876543217", email: "sujeetkamat@email.com" },
    { name: "swant", unitNo: "805", phone: "9876543218", email: "swant@email.com" },
    { name: "AKHILES", unitNo: "701", phone: "9876543219", email: "akhiles@email.com" },
    { name: "Raj", unitNo: "A-001", phone: "9876543220", email: "raj@email.com" },
    { name: "Mr. Digant", unitNo: "001", phone: "9876543221", email: "digant@email.com" },
    { name: "HEMNT", unitNo: "801", phone: "9876543222", email: "hemnt@email.com" },
    { name: "asha patil", unitNo: "110", phone: "9876543223", email: "asha@email.com" },
    { name: "Mr. anil", unitNo: "101", phone: "9876543224", email: "mrnil@email.com" },
    { name: "Mr. SWATI", unitNo: "102", phone: "9876543225", email: "swati@email.com" },
    { name: "Mr. AKHIL", unitNo: "103", phone: "9876543226", email: "akhil@email.com" },
    { name: "Mr. DINESH", unitNo: "103", phone: "9876543227", email: "dineshk@email.com" },
  ];

  for (const m of membersData) {
    const member = await prisma.member.create({
      data: {
        name: m.name,
        phone: m.phone,
        email: m.email,
        societyId: society.id,
      },
    });

    await prisma.unit.create({
      data: {
        unitNo: m.unitNo,
        type: "RESIDENTIAL",
        buildingId: building.id,
        societyId: society.id,
        memberId: member.id,
      },
    });
  }

  // Create bank account
  const bankAccount = await prisma.bankAccount.create({
    data: {
      bankName: "State Bank of India",
      accountNo: "12345678901",
      ifscCode: "SBIN0001234",
      branch: "Mumbai Main",
      balance: 250000,
      societyId: society.id,
    },
  });

  // Fetch all members with their units for generating transactional data
  const allMembers = await prisma.member.findMany({
    where: { societyId: society.id },
    include: { units: true },
  });

  // Fetch tariffs for bill items
  const allTariffs = await prisma.tariff.findMany({
    where: { societyId: society.id },
    orderBy: { sortOrder: "asc" },
  });

  // Fetch ledger heads
  const allLedgerHeads = await prisma.ledgerHead.findMany({
    where: { societyId: society.id },
  });
  const maintenanceLH = allLedgerHeads.find((h) => h.code === "MAINT")!;
  const waterLH = allLedgerHeads.find((h) => h.code === "WATER")!;
  const electricityLH = allLedgerHeads.find((h) => h.code === "ELEC")!;
  const repairsLH = allLedgerHeads.find((h) => h.code === "REP")!;
  const sinkingLH = allLedgerHeads.find((h) => h.code === "SINK")!;

  // ─── Generate Bills for April 2024 to March 2025 ─────────────
  console.log("Creating bills...");
  const fyMonths = [
    { label: "April 2024", year: 2024, month: 3 },
    { label: "May 2024", year: 2024, month: 4 },
    { label: "June 2024", year: 2024, month: 5 },
    { label: "July 2024", year: 2024, month: 6 },
    { label: "August 2024", year: 2024, month: 7 },
    { label: "September 2024", year: 2024, month: 8 },
    { label: "October 2024", year: 2024, month: 9 },
    { label: "November 2024", year: 2024, month: 10 },
    { label: "December 2024", year: 2024, month: 11 },
    { label: "January 2025", year: 2025, month: 0 },
    { label: "February 2025", year: 2025, month: 1 },
    { label: "March 2025", year: 2025, month: 2 },
  ];

  const tariffTotal = allTariffs.reduce((s, t) => s + t.amount, 0); // 2500

  let billCounter = 1;
  let receiptCounter = 1;
  const allBills: Array<{ id: string; memberId: string; month: string; totalAmount: number; memberName: string; unitNo: string }> = [];

  for (const fm of fyMonths) {
    for (const member of allMembers) {
      if (member.units.length === 0) continue;
      const unit = member.units[0];
      const billNo = `BILL-${String(billCounter++).padStart(4, "0")}`;
      const billDate = new Date(fm.year, fm.month, 5);
      const dueDate = new Date(fm.year, fm.month, 20);

      const bill = await prisma.bill.create({
        data: {
          billNo,
          date: billDate,
          dueDate,
          month: fm.label,
          totalAmount: tariffTotal,
          interestAmount: 0,
          taxAmount: 0,
          paidAmount: 0,
          status: "UNPAID",
          billType: "REGULAR",
          memberId: member.id,
          unitId: unit.id,
          societyId: society.id,
          items: {
            create: allTariffs.map((t) => ({
              name: t.name,
              amount: t.amount,
              tariffId: t.id,
            })),
          },
        },
      });

      allBills.push({
        id: bill.id,
        memberId: member.id,
        month: fm.label,
        totalAmount: tariffTotal,
        memberName: member.name,
        unitNo: unit.unitNo,
      });
    }
  }
  console.log(`Created ${allBills.length} bills`);

  // ─── Create Receipts (pay ~70% of bills) ─────────────────────
  console.log("Creating receipts...");
  const paymentModes: Array<"CASH" | "CHEQUE" | "BANK_TRANSFER" | "ONLINE"> = ["CASH", "CHEQUE", "BANK_TRANSFER", "ONLINE"];
  let bankBalance = 250000;
  let cashBalance = 0;

  for (const bill of allBills) {
    // 70% chance of full payment, 15% partial, 15% unpaid
    const rand = Math.random();
    if (rand > 0.70) continue; // 30% stay unpaid

    const isPaid = rand <= 0.55; // 55% full, 15% partial
    const amount = isPaid ? bill.totalAmount : Math.round(bill.totalAmount * (0.3 + Math.random() * 0.5));
    const mode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
    const receiptNo = `RCP-${String(receiptCounter++).padStart(4, "0")}`;

    // Payment date: 5-25 days into the bill month
    const monthParts = bill.month.split(" ");
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const mIdx = monthNames.indexOf(monthParts[0]);
    const yr = parseInt(monthParts[1]);
    const payDay = 5 + Math.floor(Math.random() * 20);
    const payDate = new Date(yr, mIdx, payDay);

    await prisma.receipt.create({
      data: {
        receiptNo,
        date: payDate,
        amount,
        paymentMode: mode,
        chequeNo: mode === "CHEQUE" ? `CHQ${100000 + receiptCounter}` : null,
        bankName: mode === "CHEQUE" ? "SBI" : null,
        notes: `Payment for ${bill.month}`,
        memberId: bill.memberId,
        billId: bill.id,
        societyId: society.id,
      },
    });

    // Update bill status
    const newPaid = amount;
    const newStatus = newPaid >= bill.totalAmount ? "PAID" : "PARTIAL";
    await prisma.bill.update({
      where: { id: bill.id },
      data: { paidAmount: newPaid, status: newStatus },
    });

    // Create corresponding bank entry for non-cash payments
    if (mode !== "CASH") {
      bankBalance += amount;
      await prisma.bankEntry.create({
        data: {
          date: payDate,
          particular: `Receipt ${receiptNo} - ${bill.memberName} (${bill.unitNo})`,
          receipt: amount,
          payment: 0,
          balance: bankBalance,
          chequeNo: mode === "CHEQUE" ? `CHQ${100000 + receiptCounter}` : null,
          isReconciled: Math.random() > 0.3,
          bankAccountId: bankAccount.id,
          societyId: society.id,
        },
      });
    } else {
      cashBalance += amount;
      await prisma.cashEntry.create({
        data: {
          date: payDate,
          voucherNo: receiptNo,
          type: "RECEIPT",
          particular: `Receipt from ${bill.memberName} (${bill.unitNo}) for ${bill.month}`,
          receipt: amount,
          payment: 0,
          balance: cashBalance,
          societyId: society.id,
        },
      });
    }
  }
  console.log(`Created ${receiptCounter - 1} receipts`);

  // ─── Create Payments (society expenses) ───────────────────────
  console.log("Creating payments...");
  const expenseItems = [
    { payee: "Mumbai Municipal Corp", desc: "Water tax payment", amount: 15000, month: 4 },
    { payee: "Adani Electricity", desc: "Common area electricity bill", amount: 8500, month: 4 },
    { payee: "Star Plumbing Works", desc: "Plumbing repairs - B wing", amount: 4200, month: 5 },
    { payee: "Mumbai Municipal Corp", desc: "Property tax Q1", amount: 35000, month: 5 },
    { payee: "Green Garden Services", desc: "Garden maintenance", amount: 3000, month: 6 },
    { payee: "Adani Electricity", desc: "Common area electricity bill", amount: 9200, month: 6 },
    { payee: "ABC Painting Co", desc: "Staircase painting - A wing", amount: 28000, month: 7 },
    { payee: "Mumbai Municipal Corp", desc: "Water tax payment", amount: 15000, month: 7 },
    { payee: "Safe Guard Security", desc: "Security guard salary - Q2", amount: 45000, month: 8 },
    { payee: "Adani Electricity", desc: "Common area electricity bill", amount: 7800, month: 8 },
    { payee: "Star Plumbing Works", desc: "Pipeline repair - terrace", amount: 12000, month: 9 },
    { payee: "Green Garden Services", desc: "Garden maintenance", amount: 3000, month: 9 },
    { payee: "Mumbai Municipal Corp", desc: "Property tax Q2", amount: 35000, month: 10 },
    { payee: "Adani Electricity", desc: "Common area electricity bill", amount: 8100, month: 10 },
    { payee: "Diwali Decoration Committee", desc: "Festival decoration", amount: 15000, month: 10 },
    { payee: "Safe Guard Security", desc: "Security guard salary - Q3", amount: 45000, month: 11 },
    { payee: "Adani Electricity", desc: "Common area electricity bill", amount: 6500, month: 11 },
    { payee: "ABC Elevator Services", desc: "Elevator AMC payment", amount: 22000, month: 0 },
    { payee: "Mumbai Municipal Corp", desc: "Water tax payment", amount: 15000, month: 0 },
    { payee: "Safe Guard Security", desc: "Security guard salary - Q4", amount: 45000, month: 1 },
    { payee: "Adani Electricity", desc: "Common area electricity bill", amount: 7200, month: 1 },
    { payee: "ABC Painting Co", desc: "External painting work", amount: 65000, month: 2 },
    { payee: "Star Plumbing Works", desc: "Annual plumbing maintenance", amount: 18000, month: 2 },
    { payee: "Mumbai Municipal Corp", desc: "Property tax Q3", amount: 35000, month: 2 },
  ];

  let paymentCounter = 1;
  for (const exp of expenseItems) {
    const voucherNo = `PAY-${String(paymentCounter++).padStart(4, "0")}`;
    const yr = exp.month >= 4 ? 2024 : 2025;
    const payDate = new Date(yr, exp.month, 10 + Math.floor(Math.random() * 15));
    const mode = exp.amount > 10000 ? "BANK_TRANSFER" : "CASH";

    await prisma.payment.create({
      data: {
        voucherNo,
        date: payDate,
        amount: exp.amount,
        payee: exp.payee,
        description: exp.desc,
        paymentMode: mode,
        societyId: society.id,
      },
    });

    if (mode === "BANK_TRANSFER") {
      bankBalance -= exp.amount;
      await prisma.bankEntry.create({
        data: {
          date: payDate,
          particular: `${voucherNo} - ${exp.desc} to ${exp.payee}`,
          receipt: 0,
          payment: exp.amount,
          balance: bankBalance,
          isReconciled: Math.random() > 0.2,
          bankAccountId: bankAccount.id,
          societyId: society.id,
        },
      });
    } else {
      cashBalance -= exp.amount;
      await prisma.cashEntry.create({
        data: {
          date: payDate,
          voucherNo,
          type: "PAYMENT",
          particular: `${exp.desc} to ${exp.payee}`,
          receipt: 0,
          payment: exp.amount,
          balance: cashBalance,
          societyId: society.id,
        },
      });
    }
  }
  console.log(`Created ${paymentCounter - 1} payments`);

  // ─── Create Journal Vouchers ──────────────────────────────────
  console.log("Creating journal vouchers...");
  const jvEntries = [
    { notes: "Maintenance income recognition - Q1", debitHead: maintenanceLH, creditHead: sinkingLH, amount: 50000, month: 5 },
    { notes: "Water charges adjustment", debitHead: waterLH, creditHead: maintenanceLH, amount: 8000, month: 6 },
    { notes: "Repair expense provision - Q2", debitHead: repairsLH, creditHead: electricityLH, amount: 15000, month: 8 },
    { notes: "Sinking fund transfer", debitHead: sinkingLH, creditHead: maintenanceLH, amount: 25000, month: 9 },
    { notes: "Electricity reallocation", debitHead: electricityLH, creditHead: waterLH, amount: 5000, month: 11 },
    { notes: "Year-end maintenance adjustment", debitHead: maintenanceLH, creditHead: repairsLH, amount: 12000, month: 2 },
  ];

  let jvCounter = 1;
  for (const jv of jvEntries) {
    const voucherNo = `JV-${String(jvCounter++).padStart(4, "0")}`;
    const yr = jv.month >= 4 ? 2024 : 2025;
    const jvDate = new Date(yr, jv.month, 15);

    await prisma.journalVoucher.create({
      data: {
        voucherNo,
        date: jvDate,
        notes: jv.notes,
        societyId: society.id,
        lines: {
          create: [
            { type: "DEBIT", amount: jv.amount, ledgerHeadId: jv.debitHead.id },
            { type: "CREDIT", amount: jv.amount, ledgerHeadId: jv.creditHead.id },
          ],
        },
      },
    });
  }
  console.log(`Created ${jvCounter - 1} journal vouchers`);

  // Update bank account with final balance
  await prisma.bankAccount.update({
    where: { id: bankAccount.id },
    data: { balance: bankBalance },
  });

  console.log("Seed completed successfully!");
  console.log("Login with: userId=demo, password=123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
