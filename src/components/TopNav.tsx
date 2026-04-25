"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Home,
  FileText,
  FileSpreadsheet,
  FilePlus,
  Printer,
  User,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";

interface TopNavProps {
  userName: string;
  societyName: string;
  financialYear: string;
  onMenuToggle?: () => void;
}

export default function TopNav({ userName, societyName, financialYear, onMenuToggle }: TopNavProps) {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const navIcons = [
    { icon: <Building2 size={20} />, href: "/dashboard/building/inside-story", label: "Building" },
    { icon: <Home size={20} />, href: "/dashboard", label: "Home" },
    { icon: <FileText size={20} />, href: "/dashboard/members/all-bills", label: "Bills" },
    { icon: <FileSpreadsheet size={20} />, href: "/dashboard/members/receipt-entry", label: "Receipts", badge: "New" },
    { icon: <FilePlus size={20} />, href: "/dashboard/members/journal-voucher", label: "Voucher" },
    { icon: <Printer size={20} />, href: "/dashboard/reports/bill-register", label: "Print" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 md:px-4 py-2 flex items-center justify-between gap-2">
      {/* Left: Hamburger (mobile) + Logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-1 text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          <Menu size={20} />
        </button>
        <div className="w-8 h-8 bg-[#1e3a5f] rounded flex items-center justify-center">
          <Building2 size={16} className="text-white" />
        </div>
      </div>

      {/* Center: Nav Icons (hidden on small mobile) */}
      <div className="hidden sm:flex items-center gap-1">
        {navIcons.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="relative p-2.5 rounded-full hover:bg-slate-50 transition-colors group"
            title={item.label}
          >
            <span className="text-slate-600 group-hover:text-slate-900">
              {item.icon}
            </span>
            {item.badge && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold px-1 rounded">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Right: User info + FY */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="text-right text-xs hidden md:block">
          <div className="flex items-center gap-1 text-gray-600">
            <User size={12} />
            <span>: {userName}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Building2 size={12} />
            <span>: {societyName}</span>
          </div>
        </div>

        {/* Financial Year Badge */}
        <div className="bg-[#1e3a5f] text-white rounded-lg px-2.5 py-1 text-center hidden sm:block">
          <div className="text-[10px] leading-tight">April-March</div>
          <div className="text-sm font-bold leading-tight">{financialYear}</div>
        </div>

        {/* Profile / Logout */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
          >
            <User size={16} className="text-slate-600" />
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <div className="p-3 border-b">
                <p className="font-medium text-sm text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500">{societyName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
