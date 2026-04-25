"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, Landmark, CreditCard, ClipboardList,
  BookOpenCheck, Users, FileBarChart, BarChart3,
} from "lucide-react";
import { apiFetch, formatCurrency } from "@/lib/api";

interface DashboardData {
  totalMembers: number;
  totalBills: number;
  unpaidBills: number;
  cashCollection: number;
  bankCollection: number;
  previousCash: number;
  previousBank: number;
  residentialPct: number;
  commercialPct: number;
  trialBalanceData: { month: string; income: number; expense: number; balance: number }[];
  dueMembers: { unitNo: string; memberName: string; dueAmount: number; month: string }[];
}

const topReports = [
  { label: "Bank Register", href: "/dashboard/reports/bank-register", color: "bg-purple-600", icon: <Landmark size={20} /> },
  { label: "Cash Register", href: "/dashboard/reports/cash-register", color: "bg-red-500", icon: <CreditCard size={20} /> },
  { label: "Dues Register", href: "/dashboard/reports/dues-register", color: "bg-yellow-500", icon: <ClipboardList size={20} /> },
  { label: "General Ledger", href: "/dashboard/reports/general-ledger", color: "bg-green-500", icon: <BookOpenCheck size={20} /> },
  { label: "Member Ledger", href: "/dashboard/reports/member-ledger", color: "bg-teal-500", icon: <Users size={20} /> },
  { label: "Bill Register", href: "/dashboard/reports/bill-register", color: "bg-pink-500", icon: <FileBarChart size={20} /> },
  { label: "Closing Balance", href: "/dashboard/reports/closing-balance", color: "bg-purple-400", icon: <BarChart3 size={20} /> },
  { label: "All Bills", href: "/dashboard/members/all-bills", color: "bg-teal-400", icon: <BarChart3 size={20} /> },
];

export default function DashboardClient({ societyName }: { societyName: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const result = await apiFetch<DashboardData>("/api/dashboard");
      setData(result);
    } catch { /* fallback to empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading dashboard...</div>;

  const pieData = [
    { name: "Residential", value: data?.residentialPct || 0, color: "#a78bfa" },
    { name: "Commercial", value: data?.commercialPct || 0, color: "#34d399" },
  ].filter(d => d.value > 0);

  // If no pie data, show placeholder
  if (pieData.length === 0) pieData.push({ name: "No Units", value: 100, color: "#e5e7eb" });

  const trialBalanceData = data?.trialBalanceData || [];

  return (
    <div className="space-y-4">
      {/* Top Row: Pie + Collection Cards + Trial Balance */}
      <div className="grid grid-cols-12 gap-4">
        {/* Pie Chart */}
        <div className="col-span-3 bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Unit Type Distribution</h3>
          <div className="flex justify-center">
            <PieChart width={200} height={200}>
              <Pie data={pieData} cx={100} cy={100} innerRadius={0} outerRadius={80} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-sm bg-purple-400" />
              {data?.residentialPct || 0}% Residential
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-sm bg-emerald-400" />
              {data?.commercialPct || 0}% Commercial
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-sm bg-yellow-400" />
              {data?.totalMembers || 0} Total Members
            </div>
          </div>
        </div>

        {/* Collection Cards */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 text-center uppercase tracking-wide">Cash Collection</h3>
            <p className="text-3xl font-bold text-teal-500 text-center my-2">{formatCurrency(data?.cashCollection || 0)}</p>
            <div className="border-t pt-2 flex justify-between text-xs text-gray-500">
              <div>
                <span className="block text-gray-400">Previous</span>
                <span className="font-semibold text-gray-700">{formatCurrency(data?.previousCash || 0)}</span>
              </div>
              <div className="flex items-center gap-1 text-purple-500">
                <span>Trend</span>
                <TrendingUp size={14} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 text-center uppercase tracking-wide">Bank Collection</h3>
            <p className="text-3xl font-bold text-teal-500 text-center my-2">{formatCurrency(data?.bankCollection || 0)}</p>
            <div className="border-t pt-2 flex justify-between text-xs text-gray-500">
              <div>
                <span className="block text-gray-400">Previous</span>
                <span className="font-semibold text-gray-700">{formatCurrency(data?.previousBank || 0)}</span>
              </div>
              <div className="flex items-center gap-1 text-purple-500">
                <span>Trend</span>
                <TrendingUp size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Trial Balance Chart */}
        <div className="col-span-6 bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Monthly Income vs Expense</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trialBalanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="income" stroke="#f472b6" strokeWidth={2} dot={{ r: 3 }} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} name="Expense" />
              <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Balance" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-8 mt-2 text-xs text-gray-500">
            <div>
              <span className="block text-gray-400">Total Bills</span>
              <span className="text-lg font-bold text-gray-800">{data?.totalBills || 0}</span>
            </div>
            <div>
              <span className="block text-gray-400">Unpaid Bills</span>
              <span className="text-lg font-bold text-red-600">{data?.unpaidBills || 0}</span>
            </div>
            <div>
              <span className="block text-gray-400">Total Collection</span>
              <span className="text-lg font-bold text-gray-800">{formatCurrency((data?.cashCollection || 0) + (data?.bankCollection || 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Due Members + Top Reports */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6 bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Due Members</h3>
          {(!data?.dueMembers || data.dueMembers.length === 0) ? (
            <div className="text-center text-gray-400 text-sm py-8">
              No due members for current period
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[200px]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-1.5 font-semibold text-gray-600">Unit</th>
                    <th className="text-left px-3 py-1.5 font-semibold text-gray-600">Member</th>
                    <th className="text-left px-3 py-1.5 font-semibold text-gray-600">Month</th>
                    <th className="text-right px-3 py-1.5 font-semibold text-gray-600">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dueMembers.map((m, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-3 py-1.5 font-medium">{m.unitNo}</td>
                      <td className="px-3 py-1.5">{m.memberName}</td>
                      <td className="px-3 py-1.5">{m.month}</td>
                      <td className="px-3 py-1.5 text-right text-red-600 font-medium">{formatCurrency(m.dueAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="col-span-6 bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Reports</h3>
          <div className="grid grid-cols-3 gap-3">
            {topReports.map((report) => (
              <Link
                key={report.label}
                href={report.href}
                className={`${report.color} text-white rounded-xl p-3 flex flex-col items-center justify-center gap-1 hover:opacity-90 transition text-center min-h-[72px]`}
              >
                {report.icon}
                <span className="text-xs font-medium leading-tight">{report.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
