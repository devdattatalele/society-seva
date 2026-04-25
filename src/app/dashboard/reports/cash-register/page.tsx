"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Printer, FileDown, FileSpreadsheet } from "lucide-react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";
import { generateReportPDF } from "@/lib/pdf";
import { exportToExcel } from "@/lib/excel";

interface CashEntry {
  id: string; date: string; voucherNo: string | null; type: string | null;
  particular: string; receipt: number; payment: number; balance: number;
}

export default function CashRegisterPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [type, setType] = useState("");
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    if (type) params.set("type", type);
    const data = await apiFetch<CashEntry[]>(`/api/cash-entries?${params.toString()}`);
    setEntries(data);
    setLoading(false);
    setSearched(true);
  }, [fromDate, toDate, type]);

  // Load all on mount
  useEffect(() => { fetchData(); }, []);

  const totalReceipt = entries.reduce((s, e) => s + e.receipt, 0);
  const totalPayment = entries.reduce((s, e) => s + e.payment, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Cash Register</h2>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-4 mb-4 items-end justify-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none">
              <option value="">All</option>
              <option value="receipt">Receipt</option>
              <option value="payment">Payment</option>
              <option value="opening">Opening</option>
            </select>
          </div>
          <button onClick={fetchData} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2">
            <Search size={16} /> Search
          </button>
          <button onClick={() => window.print()} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
            <Printer size={16} /> Print
          </button>
          <button onClick={() => {
            const rows = entries.map(e => [formatDate(e.date), e.type || "-", e.voucherNo || "-", e.particular, e.receipt, e.payment, e.balance]);
            generateReportPDF("Cash Register", ["Date", "Type", "Vou. No.", "Particular", "Receipt", "Payment", "Balance"], rows.map(r => r.map(v => typeof v === "number" ? formatCurrency(v) : v)), { subtitle: fromDate && toDate ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : "All entries", totals: ["", "", "", "Totals", formatCurrency(totalReceipt), formatCurrency(totalPayment), formatCurrency(totalReceipt - totalPayment)] });
          }} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
            <FileDown size={16} /> PDF
          </button>
          <button onClick={() => {
            const rows = entries.map(e => [formatDate(e.date), e.type || "-", e.voucherNo || "-", e.particular, e.receipt, e.payment, e.balance]);
            exportToExcel("Cash Register", ["Date", "Type", "Vou. No.", "Particular", "Receipt", "Payment", "Balance"], rows);
          }} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2">
            <FileSpreadsheet size={16} /> Excel
          </button>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Cash Register</h3>
          <p className="text-sm text-gray-600">
            {fromDate && toDate ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : "All entries"}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Type</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Vou. No.</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Particular</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Receipt</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Payment</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Balance</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">
                  {searched ? "No cash entries found for selected filters." : "Loading..."}
                </td></tr>
              ) : entries.map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{formatDate(e.date)}</td>
                  <td className="px-4 py-2 capitalize">{e.type || "-"}</td>
                  <td className="px-4 py-2">{e.voucherNo || "-"}</td>
                  <td className="px-4 py-2">{e.particular}</td>
                  <td className="px-4 py-2 text-right text-green-600">{e.receipt > 0 ? formatCurrency(e.receipt) : "-"}</td>
                  <td className="px-4 py-2 text-right text-red-600">{e.payment > 0 ? formatCurrency(e.payment) : "-"}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(e.balance)}</td>
                </tr>
              ))}
            </tbody>
            {entries.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="px-4 py-2 text-right">Totals:</td>
                  <td className="px-4 py-2 text-right text-green-600">{formatCurrency(totalReceipt)}</td>
                  <td className="px-4 py-2 text-right text-red-600">{formatCurrency(totalPayment)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(totalReceipt - totalPayment)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
}
