"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Printer, FileDown, FileSpreadsheet } from "lucide-react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";
import { generateReportPDF } from "@/lib/pdf";
import { exportToExcel } from "@/lib/excel";

interface BankAccount { id: string; bankName: string; accountNo: string; balance: number; }
interface BankEntry {
  id: string; date: string; particular: string; receipt: number; payment: number;
  balance: number; chequeNo: string | null; isReconciled: boolean;
  bankAccount: { bankName: string };
}

export default function BankRegisterPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchAccounts = useCallback(async () => {
    const data = await apiFetch<BankAccount[]>("/api/bank-accounts");
    setBankAccounts(data);
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    if (bankAccountId) params.set("bankAccountId", bankAccountId);
    const data = await apiFetch<BankEntry[]>(`/api/bank-entries?${params.toString()}`);
    setEntries(data);
    setLoading(false);
    setSearched(true);
  }

  // Load all on mount
  useEffect(() => { fetchData(); }, []);

  const totalReceipt = entries.reduce((s, e) => s + e.receipt, 0);
  const totalPayment = entries.reduce((s, e) => s + e.payment, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Bank Register</h2>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-4 mb-4 items-end justify-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
            <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
              <option value="">All Banks</option>
              {bankAccounts.map((b) => (
                <option key={b.id} value={b.id}>{b.bankName} - {b.accountNo}</option>
              ))}
            </select>
          </div>
          <button onClick={fetchData} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
            <Search size={16} /> Search
          </button>
          <button onClick={() => window.print()} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
            <Printer size={16} /> Print
          </button>
          <button onClick={() => {
            const rows = entries.map(e => [formatDate(e.date), e.bankAccount.bankName, e.chequeNo || "-", e.particular, e.receipt, e.payment, e.balance]);
            generateReportPDF("Bank Register", ["Date", "Bank", "Chq. No.", "Particular", "Receipt", "Payment", "Balance"], rows.map(r => r.map(v => typeof v === "number" ? formatCurrency(v) : v)), { subtitle: fromDate && toDate ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : "All entries", totals: ["", "", "", "Totals", formatCurrency(totalReceipt), formatCurrency(totalPayment), formatCurrency(totalReceipt - totalPayment)] });
          }} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
            <FileDown size={16} /> PDF
          </button>
          <button onClick={() => {
            const rows = entries.map(e => [formatDate(e.date), e.bankAccount.bankName, e.chequeNo || "-", e.particular, e.receipt, e.payment, e.balance]);
            exportToExcel("Bank Register", ["Date", "Bank", "Chq. No.", "Particular", "Receipt", "Payment", "Balance"], rows);
          }} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2">
            <FileSpreadsheet size={16} /> Excel
          </button>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Bank Register</h3>
          <p className="text-sm text-gray-600">
            {fromDate && toDate ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : "All entries"}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-purple-50">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Bank</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Chq. No.</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Particular</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Receipt</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Payment</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Balance</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">
                  {searched ? "No bank entries found for selected filters." : "Loading..."}
                </td></tr>
              ) : entries.map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{formatDate(e.date)}</td>
                  <td className="px-4 py-2">{e.bankAccount.bankName}</td>
                  <td className="px-4 py-2">{e.chequeNo || "-"}</td>
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
