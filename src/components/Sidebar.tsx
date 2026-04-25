"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Home,
  Receipt,
  Award,
  BookOpen,
  FileSpreadsheet,
  Layers,
  BookOpenCheck,
  DollarSign,
  Landmark,
  ArrowLeftRight,
  FileInput,
  ClipboardList,
  Wallet,
  BarChart3,
  CreditCard,
  FileBarChart,
  Send,
  ArrowRightLeft,
  Upload,
  BarChart,
  PieChart,
} from "lucide-react";

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Building Record",
    icon: <Building2 size={18} />,
    children: [
      { label: "Inside Story", href: "/dashboard/building/inside-story", icon: <Home size={16} /> },
      { label: "Parameters", href: "/dashboard/building/parameters", icon: <Layers size={16} /> },
      { label: "Head Sub Group", href: "/dashboard/building/head-sub-group", icon: <Layers size={16} /> },
      { label: "Ledger Heads", href: "/dashboard/building/ledger-heads", icon: <BookOpenCheck size={16} /> },
      { label: "Add Tariffs", href: "/dashboard/building/tariffs", icon: <DollarSign size={16} /> },
      { label: "Change Tariff Order", href: "/dashboard/building/tariff-order", icon: <ClipboardList size={16} /> },
      { label: "Payments", href: "/dashboard/building/payments", icon: <Wallet size={16} /> },
      { label: "Bank Reconciliation", href: "/dashboard/building/bank-reconciliation", icon: <Landmark size={16} /> },
      { label: "Cash Contra", href: "/dashboard/building/cash-contra", icon: <ArrowLeftRight size={16} /> },
      { label: "General Receipt", href: "/dashboard/building/general-receipt", icon: <FileInput size={16} /> },
    ],
  },
  {
    label: "Member Record",
    icon: <Users size={18} />,
    children: [
      { label: "Add Member", href: "/dashboard/members/add", icon: <UserPlus size={16} /> },
      { label: "House Holder", href: "/dashboard/members/house-holder", icon: <Home size={16} /> },
      { label: "Receipt Entry", href: "/dashboard/members/receipt-entry", icon: <Receipt size={16} /> },
      { label: "Share Certificate", href: "/dashboard/members/share-certificate", icon: <Award size={16} /> },
      { label: "Journal Voucher", href: "/dashboard/members/journal-voucher", icon: <BookOpen size={16} /> },
      { label: "All Bills", href: "/dashboard/members/all-bills", icon: <FileSpreadsheet size={16} /> },
      { label: "Generate Bills", href: "/dashboard/members/generate-bills", icon: <Send size={16} /> },
      { label: "Member Transfer", href: "/dashboard/members/member-transfer", icon: <ArrowRightLeft size={16} /> },
      { label: "Bulk Upload", href: "/dashboard/members/bulk-upload", icon: <Upload size={16} /> },
    ],
  },
  {
    label: "Reports Record",
    href: "/dashboard/reports",
    icon: <FileText size={18} />,
    children: [
      { label: "Bank Register", href: "/dashboard/reports/bank-register", icon: <Landmark size={16} /> },
      { label: "Cash Register", href: "/dashboard/reports/cash-register", icon: <CreditCard size={16} /> },
      { label: "Dues Register", href: "/dashboard/reports/dues-register", icon: <ClipboardList size={16} /> },
      { label: "General Ledger", href: "/dashboard/reports/general-ledger", icon: <BookOpenCheck size={16} /> },
      { label: "Member Ledger Register", href: "/dashboard/reports/member-ledger", icon: <Users size={16} /> },
      { label: "Bill Register", href: "/dashboard/reports/bill-register", icon: <FileBarChart size={16} /> },
      { label: "Member Closing Balance", href: "/dashboard/reports/closing-balance", icon: <BarChart3 size={16} /> },
      { label: "Trial Balance", href: "/dashboard/reports/trial-balance", icon: <BarChart size={16} /> },
      { label: "Income & Expenditure", href: "/dashboard/reports/income-expenditure", icon: <PieChart size={16} /> },
      { label: "Balance Sheet", href: "/dashboard/reports/balance-sheet", icon: <FileBarChart size={16} /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    "Building Record": false,
    "Member Record": true,
    "Reports Record": false,
  });

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-[200px] min-h-screen bg-gradient-to-b from-purple-600 to-purple-800 text-white flex flex-col overflow-y-auto flex-shrink-0">
      <nav className="flex-1 py-2">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <button
                onClick={() => toggleMenu(item.label)}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium hover:bg-purple-700 transition-colors border-l-4 ${
                  item.href && isActive(item.href) ? "border-white bg-purple-900" : "border-transparent"
                }`}
              >
                {item.href ? (
                  <Link href={item.href} className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {item.icon}
                    {item.label}
                  </Link>
                ) : (
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                )}
                {openMenus[item.label] ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            ) : item.href ? (
              <Link
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-purple-900 border-l-4 border-white"
                    : "hover:bg-purple-700 border-l-4 border-transparent"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ) : null}

            {/* Children */}
            {item.children && openMenus[item.label] && (
              <div className="bg-purple-900/40">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center gap-2 pl-8 pr-4 py-2 text-xs transition-colors ${
                      isActive(child.href)
                        ? "bg-purple-900 text-white font-semibold"
                        : "text-purple-200 hover:text-white hover:bg-purple-800"
                    }`}
                  >
                    {child.icon}
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
