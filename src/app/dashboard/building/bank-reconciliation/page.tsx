"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";

interface BankAccount { id: string; bankName: string; accountNo: string; balance: number; }
interface BankEntry {
  id: string; date: string; particular: string; receipt: number; payment: number;
  balance: number; chequeNo: string | null; isReconciled: boolean;
}

export default function BankReconciliationPage() {
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

  async function handleSearch() {
    if (!bankAccountId) return;
    setLoading(true);
    const params = new URLSearchParams({ bankAccountId });
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const data = await apiFetch<BankEntry[]>(`/api/bank-entries?${params.toString()}`);
    setEntries(data);
    setLoading(false);
    setSearched(true);
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none";

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Bank Reconciliation</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
            <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} className={inputClass}>
              <option value="">Select Bank Account</option>
              {bankAccounts.map((b) => (
                <option key={b.id} value={b.id}>{b.bankName} - {b.accountNo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
          </div>
          <div className="flex items-end">
            <button onClick={handleSearch} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">Search</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-purple-50">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Particular</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Chq No.</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Receipt</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Payment</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Balance</th>
                <th className="text-center px-4 py-2 font-semibold text-gray-700">Reconciled</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">
                  {searched ? "No entries found for selected bank." : "Select a bank account and date range to view reconciliation."}
                </td></tr>
              ) : entries.map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{formatDate(e.date)}</td>
                  <td className="px-4 py-2">{e.particular}</td>
                  <td className="px-4 py-2">{e.chequeNo || "-"}</td>
                  <td className="px-4 py-2 text-right text-green-600">{e.receipt > 0 ? formatCurrency(e.receipt) : "-"}</td>
                  <td className="px-4 py-2 text-right text-red-600">{e.payment > 0 ? formatCurrency(e.payment) : "-"}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(e.balance)}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${e.isReconciled ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {e.isReconciled ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {entries.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={3} className="px-4 py-2 text-right">Totals:</td>
                  <td className="px-4 py-2 text-right text-green-600">{formatCurrency(entries.reduce((s, e) => s + e.receipt, 0))}</td>
                  <td className="px-4 py-2 text-right text-red-600">{formatCurrency(entries.reduce((s, e) => s + e.payment, 0))}</td>
                  <td className="px-4 py-2 text-right">{entries.length > 0 ? formatCurrency(entries[entries.length - 1].balance) : "-"}</td>
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
