"use client";

import { useState } from "react";
import { Search, Printer, FileDown, FileSpreadsheet } from "lucide-react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";
import { generateReportPDF } from "@/lib/pdf";
import { exportToExcel } from "@/lib/excel";

interface Bill {
  id: string; billNo: string; date: string; month: string;
  totalAmount: number; paidAmount: number; status: string;
  member: { name: string };
  unit: { unitNo: string };
}

export default function BillRegisterPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    setLoading(true);
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const data = await apiFetch<Bill[]>(`/api/bills?${params.toString()}`);
    setBills(data);
    setLoading(false);
    setSearched(true);
  }

  const totalAmount = bills.reduce((s, b) => s + b.totalAmount, 0);
  const totalPaid = bills.reduce((s, b) => s + b.paidAmount, 0);

  const statusBadge = (status: string) => {
    const cls = status === "PAID" ? "bg-green-100 text-green-700" : status === "PARTIAL" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{status}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Bill Register</h2>
      </div>
      <div className="p-6">
        <div className="flex gap-4 mb-6 items-end justify-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
          </div>
          <button onClick={handleSearch} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
            <Search size={16} /> Search
          </button>
          <button onClick={() => window.print()} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
            <Printer size={16} /> Print
          </button>
          <button onClick={() => {
            if (bills.length === 0) return;
            const rows = bills.map((b, i) => [i + 1, b.billNo, formatDate(b.date), b.unit.unitNo, b.member.name, b.month, formatCurrency(b.totalAmount), formatCurrency(b.paidAmount), b.status]);
            generateReportPDF("Bill Register", ["#", "Bill No.", "Date", "Unit", "Member", "Month", "Amount", "Paid", "Status"], rows, { subtitle: fromDate && toDate ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : "All bills", totals: ["", "", "", "", "", "Totals", formatCurrency(totalAmount), formatCurrency(totalPaid), ""], landscape: true });
          }} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
            <FileDown size={16} /> PDF
          </button>
          <button onClick={() => {
            if (bills.length === 0) return;
            const rows = bills.map((b, i) => [i + 1, b.billNo, formatDate(b.date), b.unit.unitNo, b.member.name, b.month, b.totalAmount, b.paidAmount, b.status]);
            exportToExcel("Bill Register", ["#", "Bill No.", "Date", "Unit", "Member", "Month", "Amount", "Paid", "Status"], rows);
          }} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2">
            <FileSpreadsheet size={16} /> Excel
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-purple-50">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Bill No.</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Unit No.</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Member Name</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Month</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Amount</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Paid</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">
                  {searched ? "No bills found for selected date range." : "Select date range and click Search."}
                </td></tr>
              ) : bills.map((b, i) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2 font-medium">{b.billNo}</td>
                  <td className="px-4 py-2">{formatDate(b.date)}</td>
                  <td className="px-4 py-2">{b.unit.unitNo}</td>
                  <td className="px-4 py-2">{b.member.name}</td>
                  <td className="px-4 py-2">{b.month}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(b.paidAmount)}</td>
                  <td className="px-4 py-2">{statusBadge(b.status)}</td>
                </tr>
              ))}
            </tbody>
            {bills.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={6} className="px-4 py-2 text-right">Totals:</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(totalAmount)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(totalPaid)}</td>
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
