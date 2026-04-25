"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Printer, FileDown, FileSpreadsheet } from "lucide-react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";
import { generateReportPDF } from "@/lib/pdf";
import { exportToExcel } from "@/lib/excel";

interface Unit { id: string; unitNo: string; }
interface Member { id: string; name: string; memberNo: string | null; units: Unit[]; openingPrincipal: number; openingInterest: number; openingTax: number; }
interface LedgerEntry {
  date: string; particular: string; billAmount: number; receipt: number; balance: number;
}

export default function MemberLedgerPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchMembers = useCallback(async () => {
    const data = await apiFetch<Member[]>("/api/members");
    setMembers(data);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function handleSearch() {
    if (!memberId) return;
    setLoading(true);
    const params = new URLSearchParams({ memberId });
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const data = await apiFetch<LedgerEntry[]>(`/api/reports/member-ledger?${params.toString()}`);
    setEntries(data);
    setLoading(false);
    setSearched(true);
  }

  const selectedMember = members.find(m => m.id === memberId);
  const totalBills = entries.reduce((s, e) => s + e.billAmount, 0);
  const totalReceipts = entries.reduce((s, e) => s + e.receipt, 0);
  const closingBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Member Ledger Register</h2>
      </div>
      <div className="p-6">
        <div className="flex gap-4 mb-6 items-end justify-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none min-w-[250px]">
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name} - {m.units.map(u => u.unitNo).join(", ") || "No unit"}</option>
              ))}
            </select>
          </div>
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
            if (entries.length === 0) return;
            const rows = entries.map(e => [formatDate(e.date), e.particular, e.billAmount > 0 ? formatCurrency(e.billAmount) : "-", e.receipt > 0 ? formatCurrency(e.receipt) : "-", `${formatCurrency(Math.abs(e.balance))} ${e.balance >= 0 ? "Dr" : "Cr"}`]);
            generateReportPDF("Member Ledger", ["Date", "Particular", "Dr. Amount", "Cr. Amount", "Balance"], rows, { subtitle: selectedMember?.name || "", totals: ["", "Totals", formatCurrency(totalBills), formatCurrency(totalReceipts), `${formatCurrency(Math.abs(closingBalance))} ${closingBalance >= 0 ? "Dr" : "Cr"}`] });
          }} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2">
            <FileDown size={16} /> PDF
          </button>
          <button onClick={() => {
            if (entries.length === 0) return;
            const rows = entries.map(e => [formatDate(e.date), e.particular, e.billAmount, e.receipt, e.balance]);
            exportToExcel("Member Ledger", ["Date", "Particular", "Dr. Amount", "Cr. Amount", "Balance"], rows, `Member_Ledger_${selectedMember?.name || ""}`);
          }} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2">
            <FileSpreadsheet size={16} /> Excel
          </button>
        </div>

        {selectedMember && searched && (
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
            <p className="text-sm text-gray-600">
              Unit: {selectedMember.units.map(u => u.unitNo).join(", ") || "-"} | Member No: {selectedMember.memberNo || "-"}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-purple-50">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Particular</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Dr. Amount</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Cr. Amount</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Balance</th>
              </tr>
            </thead>
            <tbody>
              {/* Opening balance row */}
              {selectedMember && searched && selectedMember.openingPrincipal > 0 && (
                <tr className="border-b bg-blue-50">
                  <td className="px-4 py-2">-</td>
                  <td className="px-4 py-2 text-blue-600 font-medium">Opening Balance</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(selectedMember.openingPrincipal + selectedMember.openingInterest + selectedMember.openingTax)}</td>
                  <td className="px-4 py-2 text-right">-</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(selectedMember.openingPrincipal + selectedMember.openingInterest + selectedMember.openingTax)} Dr</td>
                </tr>
              )}
              {entries.length === 0 && !searched ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Select a member to view ledger.</td></tr>
              ) : entries.length === 0 && searched ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No transactions found.</td></tr>
              ) : entries.map((e, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{formatDate(e.date)}</td>
                  <td className="px-4 py-2">{e.particular}</td>
                  <td className="px-4 py-2 text-right">{e.billAmount > 0 ? formatCurrency(e.billAmount) : "-"}</td>
                  <td className="px-4 py-2 text-right">{e.receipt > 0 ? formatCurrency(e.receipt) : "-"}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(Math.abs(e.balance))} {e.balance >= 0 ? "Dr" : "Cr"}</td>
                </tr>
              ))}
            </tbody>
            {entries.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={2} className="px-4 py-2 text-right">Totals:</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(totalBills)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(totalReceipts)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(Math.abs(closingBalance))} {closingBalance >= 0 ? "Dr" : "Cr"}</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
}
