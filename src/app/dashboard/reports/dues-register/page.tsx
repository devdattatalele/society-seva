"use client";

import { useState } from "react";
import { Search, Printer, FileDown, FileSpreadsheet } from "lucide-react";
import { apiFetch, formatCurrency } from "@/lib/api";
import { generateReportPDF } from "@/lib/pdf";
import { exportToExcel } from "@/lib/excel";

interface DuesEntry {
  id: string; unitNo: string; memberName: string;
  billAmount: number; paidAmount: number; dueAmount: number;
  status: string; month: string;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function DuesRegisterPage() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [entries, setEntries] = useState<DuesEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!month) return;
    setLoading(true);
    const monthStr = `${month} ${year}`;
    const data = await apiFetch<DuesEntry[]>(`/api/reports/dues?month=${encodeURIComponent(monthStr)}`);
    setEntries(data);
    setLoading(false);
    setSearched(true);
  }

  const totalBilled = entries.reduce((s, e) => s + e.billAmount, 0);
  const totalPaid = entries.reduce((s, e) => s + e.paidAmount, 0);
  const totalDue = entries.reduce((s, e) => s + e.dueAmount, 0);

  const statusBadge = (status: string) => {
    const cls = status === "PAID" ? "bg-green-100 text-green-700" : status === "PARTIAL" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{status}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Dues Register</h2>
      </div>
      <div className="p-6">
        <div className="flex gap-4 mb-6 items-end justify-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
              <option value="">Select Month</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
              {["2022","2023","2024","2025","2026","2027"].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={handleSearch} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
            <Search size={16} /> Search
          </button>
          <button onClick={() => window.print()} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
            <Printer size={16} /> Print
          </button>
          <button onClick={() => {
            if (entries.length === 0) return;
            const rows = entries.map((e, i) => [i + 1, e.unitNo, e.memberName, formatCurrency(e.billAmount), formatCurrency(e.paidAmount), formatCurrency(e.dueAmount), e.status]);
            generateReportPDF("Dues Register", ["#", "Unit No.", "Member Name", "Bill Amount", "Paid Amount", "Due Amount", "Status"], rows, { subtitle: `${month} ${year}`, totals: ["", "", "Totals", formatCurrency(totalBilled), formatCurrency(totalPaid), formatCurrency(totalDue), ""] });
          }} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
            <FileDown size={16} /> PDF
          </button>
          <button onClick={() => {
            if (entries.length === 0) return;
            const rows = entries.map((e, i) => [i + 1, e.unitNo, e.memberName, e.billAmount, e.paidAmount, e.dueAmount, e.status]);
            exportToExcel("Dues Register", ["#", "Unit No.", "Member Name", "Bill Amount", "Paid Amount", "Due Amount", "Status"], rows, `Dues_Register_${month}_${year}`);
          }} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2">
            <FileSpreadsheet size={16} /> Excel
          </button>
        </div>

        {/* Summary cards */}
        {searched && entries.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500">Total Billed</div>
              <div className="text-lg font-bold text-blue-700">{formatCurrency(totalBilled)}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500">Total Paid</div>
              <div className="text-lg font-bold text-green-700">{formatCurrency(totalPaid)}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500">Total Due</div>
              <div className="text-lg font-bold text-red-700">{formatCurrency(totalDue)}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-purple-50">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Unit No.</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Member Name</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Bill Amount</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Paid Amount</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Due Amount</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">
                  {searched ? "No bills found for selected month." : "Select month and year to view dues."}
                </td></tr>
              ) : entries.map((e, i) => (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2 font-medium">{e.unitNo}</td>
                  <td className="px-4 py-2">{e.memberName}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(e.billAmount)}</td>
                  <td className="px-4 py-2 text-right text-green-600">{formatCurrency(e.paidAmount)}</td>
                  <td className="px-4 py-2 text-right text-red-600 font-medium">{formatCurrency(e.dueAmount)}</td>
                  <td className="px-4 py-2">{statusBadge(e.status)}</td>
                </tr>
              ))}
            </tbody>
            {entries.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={3} className="px-4 py-2 text-right">Totals:</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(totalBilled)}</td>
                  <td className="px-4 py-2 text-right text-green-600">{formatCurrency(totalPaid)}</td>
                  <td className="px-4 py-2 text-right text-red-600">{formatCurrency(totalDue)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
}
