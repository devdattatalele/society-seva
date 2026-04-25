"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Printer, FileDown, FileSpreadsheet } from "lucide-react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";
import { generateReportPDF } from "@/lib/pdf";
import { exportToExcel } from "@/lib/excel";

interface LedgerHead { id: string; name: string; code: string | null; }
interface LedgerEntry {
  date: string; voucherNo: string; particular: string;
  debit: number; credit: number; balance: number;
}

export default function GeneralLedgerPage() {
  const [ledgerHeads, setLedgerHeads] = useState<LedgerHead[]>([]);
  const [ledgerHeadId, setLedgerHeadId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchHeads = useCallback(async () => {
    const data = await apiFetch<LedgerHead[]>("/api/ledger-heads");
    setLedgerHeads(data);
  }, []);

  useEffect(() => { fetchHeads(); }, [fetchHeads]);

  async function handleSearch() {
    if (!ledgerHeadId) return;
    setLoading(true);
    const params = new URLSearchParams({ ledgerHeadId });
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const data = await apiFetch<LedgerEntry[]>(`/api/reports/general-ledger?${params.toString()}`);
    setEntries(data);
    setLoading(false);
    setSearched(true);
  }

  const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0);
  const selectedHead = ledgerHeads.find(h => h.id === ledgerHeadId);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">General Ledger</h2>
      </div>
      <div className="p-6">
        <div className="flex gap-4 mb-6 items-end justify-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ledger Head</label>
            <select value={ledgerHeadId} onChange={(e) => setLedgerHeadId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none min-w-[200px]">
              <option value="">Select Ledger Head</option>
              {ledgerHeads.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
          </div>
          <button onClick={handleSearch} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2">
            <Search size={16} /> Search
          </button>
          <button onClick={() => window.print()} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
            <Printer size={16} /> Print
          </button>
          <button onClick={() => {
            if (entries.length === 0) return;
            const rows = entries.map(e => [formatDate(e.date), e.voucherNo, e.particular, e.debit > 0 ? formatCurrency(e.debit) : "-", e.credit > 0 ? formatCurrency(e.credit) : "-", `${formatCurrency(Math.abs(e.balance))} ${e.balance >= 0 ? "Dr" : "Cr"}`]);
            generateReportPDF("General Ledger", ["Date", "Voucher No.", "Particular", "Debit", "Credit", "Balance"], rows, { subtitle: selectedHead?.name || "", totals: ["", "", "Totals", formatCurrency(totalDebit), formatCurrency(totalCredit), `${formatCurrency(Math.abs(totalDebit - totalCredit))} ${totalDebit >= totalCredit ? "Dr" : "Cr"}`] });
          }} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
            <FileDown size={16} /> PDF
          </button>
          <button onClick={() => {
            if (entries.length === 0) return;
            const rows = entries.map(e => [formatDate(e.date), e.voucherNo, e.particular, e.debit, e.credit, e.balance]);
            exportToExcel("General Ledger", ["Date", "Voucher No.", "Particular", "Debit", "Credit", "Balance"], rows, `General_Ledger_${selectedHead?.name || ""}`);
          }} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2">
            <FileSpreadsheet size={16} /> Excel
          </button>
        </div>

        {selectedHead && searched && (
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">{selectedHead.name}</h3>
            <p className="text-sm text-gray-600">
              {fromDate && toDate ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : "All entries"}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Voucher No.</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Particular</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Debit</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Credit</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Balance</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">
                  {searched ? "No entries found for this ledger head." : "Select a ledger head to view entries."}
                </td></tr>
              ) : entries.map((e, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{formatDate(e.date)}</td>
                  <td className="px-4 py-2">{e.voucherNo}</td>
                  <td className="px-4 py-2">{e.particular}</td>
                  <td className="px-4 py-2 text-right text-green-600">{e.debit > 0 ? formatCurrency(e.debit) : "-"}</td>
                  <td className="px-4 py-2 text-right text-blue-600">{e.credit > 0 ? formatCurrency(e.credit) : "-"}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(Math.abs(e.balance))} {e.balance >= 0 ? "Dr" : "Cr"}</td>
                </tr>
              ))}
            </tbody>
            {entries.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={3} className="px-4 py-2 text-right">Totals:</td>
                  <td className="px-4 py-2 text-right text-green-600">{formatCurrency(totalDebit)}</td>
                  <td className="px-4 py-2 text-right text-blue-600">{formatCurrency(totalCredit)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(Math.abs(totalDebit - totalCredit))} {totalDebit >= totalCredit ? "Dr" : "Cr"}</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
}
