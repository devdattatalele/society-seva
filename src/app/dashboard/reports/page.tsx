"use client";

import Link from "next/link";

const reportCards = [
  { label: "Bank Register", href: "/dashboard/reports/bank-register" },
  { label: "Cash Register", href: "/dashboard/reports/cash-register" },
  { label: "'I' Register", href: "/dashboard/reports/closing-balance" },
  { label: "'J' Register", href: "/dashboard/reports/trial-balance" },
  { label: "Dues Register", href: "/dashboard/reports/dues-register" },
  { label: "Dues-Advanced Register", href: "/dashboard/reports/dues-register" },
  { label: "General Ledger Register", href: "/dashboard/reports/general-ledger" },
  { label: "Income Expenditure Register", href: "/dashboard/reports/income-expenditure" },
  { label: "Balance Sheet Register", href: "/dashboard/reports/balance-sheet" },
  { label: "Petty Cash Register", href: "/dashboard/reports/cash-register" },
  { label: "Payment Register", href: "/dashboard/building/payments" },
  { label: "Member Contribution Register", href: "/dashboard/reports/member-ledger" },
  { label: "Member Ledger Register(I)", href: "/dashboard/reports/member-ledger" },
  { label: "Member Ledger Register(II)", href: "/dashboard/reports/member-ledger" },
  { label: "Member Ledger Details Register", href: "/dashboard/reports/closing-balance" },
  { label: "Bill Half Register", href: "/dashboard/reports/bill-register" },
];

function BookCard({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="group block">
      <div className="relative w-[170px] h-[210px] mx-auto cursor-pointer transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-1">

        {/* Shadow / back page offset */}
        <div
          className="absolute rounded-2xl bg-purple-200/60"
          style={{ top: 6, left: 6, right: -2, bottom: -2 }}
        />

        {/* Main book body */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden flex shadow-lg">
          {/* Left section - light page */}
          <div className="flex-1 bg-gradient-to-br from-purple-50 to-purple-100" />

          {/* Spine center stripe */}
          <div className="w-[10px] bg-purple-400" />
          <div className="w-[2px] bg-purple-300" />

          {/* Right cover section */}
          <div className="w-[55px] bg-gradient-to-b from-purple-400 to-purple-500 relative">
            {/* Small circle decoration on cover */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-purple-300/60" />
          </div>
        </div>

        {/* Title tab - positioned at top overlapping the book */}
        <div className="absolute -top-1 left-2 right-[50px] z-10">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[11px] font-bold px-2.5 py-2 rounded-lg shadow-md text-center leading-tight">
            {label}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ReportsPage() {
  return (
    <div className="py-6 px-4">
      <div className="grid grid-cols-4 gap-y-12 gap-x-6 justify-items-center">
        {reportCards.map((report) => (
          <BookCard key={report.label} label={report.label} href={report.href} />
        ))}
      </div>
    </div>
  );
}
