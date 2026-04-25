"use client";

import { useState, useEffect, useCallback } from "react";
import { Printer, FileDown, FileSpreadsheet } from "lucide-react";
import { apiFetch, formatCurrency } from "@/lib/api";
import { generateReportPDF } from "@/lib/pdf";
import { exportToExcel } from "@/lib/excel";

interface TrialEntry {
  id: string; name: string; code: string | null; type: string; subGroup: string;
  openingBalance: number; totalDebit: number; totalCredit: number; closingBalance: number;
}
interface TrialData {
  entries: TrialEntry[];
  memberReceivables: number; totalPayments: number;
  totalBilled: number; totalReceived: number;
  grandTotalDebit: number; grandTotalCredit: number;
}

export default function TrialBalancePage() {
  const [data, setData] = useState<TrialData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const result = await apiFetch<TrialData>("/api/reports/trial-balance");
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  const entries = data?.entries || [];
  const totalDebit = entries.reduce((s, e) => s + e.totalDebit, 0);
  const totalCredit = entries.reduce((s, e) => s + e.totalCredit, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl flex justify-between items-center">
        <div />
        <h2 className="text-lg font-semibold text-center">Trial Balance</h2>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="text-white hover:text-purple-200" title="Print"><Printer size={18} /></button>
          <button onClick={() => {
            const rows = entries.map((e, i) => [i + 1, e.name, e.type, formatCurrency(e.openingBalance), e.totalDebit > 0 ? formatCurrency(e.totalDebit) : "-", e.totalCredit > 0 ? formatCurrency(e.totalCredit) : "-", `${formatCurrency(Math.abs(e.closingBalance))} ${e.closingBalance >= 0 ? "Dr" : "Cr"}`]);
            generateReportPDF("Trial Balance", ["#", "Ledger Head", "Type", "Opening", "Debit", "Credit", "Closing"], rows, { subtitle: `As on ${new Date().toLocaleDateString("en-IN")}`, totals: ["", "", "", "", formatCurrency(data?.grandTotalDebit || 0), formatCurrency(data?.grandTotalCredit || 0), ""] });
          }} className="text-white hover:text-purple-200" title="Download PDF"><FileDown size={18} /></button>
          <button onClick={() => {
            const rows = entries.map((e, i) => [i + 1, e.name, e.type, e.openingBalance, e.totalDebit, e.totalCredit, e.closingBalance]);
            exportToExcel("Trial Balance", ["#", "Ledger Head", "Type", "Opening Balance", "Total Debit", "Total Credit", "Closing Balance"], rows);
          }} className="text-white hover:text-purple-200" title="Download Excel"><FileSpreadsheet size={18} /></button>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold">Trial Balance</h3>
          <p className="text-sm text-gray-600">As on {new Date().toLocaleDateString("en-IN")}</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-purple-50">
              <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Ledger Head</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Type</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Opening</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Debit</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Credit</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Closing</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No ledger entries found.</td></tr>
            ) : entries.map((e, i) => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2 font-medium">{e.name}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${e.type === "INCOME" ? "bg-green-100 text-green-700" : e.type === "EXPENSE" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{e.type}</span>
                </td>
                <td className="px-4 py-2 text-right">{formatCurrency(e.openingBalance)}</td>
                <td className="px-4 py-2 text-right text-green-600">{e.totalDebit > 0 ? formatCurrency(e.totalDebit) : "-"}</td>
                <td className="px-4 py-2 text-right text-blue-600">{e.totalCredit > 0 ? formatCurrency(e.totalCredit) : "-"}</td>
                <td className="px-4 py-2 text-right font-medium">{formatCurrency(Math.abs(e.closingBalance))} {e.closingBalance >= 0 ? "Dr" : "Cr"}</td>
              </tr>
            ))}
            {/* Member receivables row */}
            <tr className="border-b bg-blue-50">
              <td className="px-4 py-2"></td>
              <td className="px-4 py-2 font-medium">Member Receivables</td>
              <td className="px-4 py-2"><span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">ASSET</span></td>
              <td className="px-4 py-2 text-right">-</td>
              <td className="px-4 py-2 text-right text-green-600">{formatCurrency(data?.totalBilled || 0)}</td>
              <td className="px-4 py-2 text-right text-blue-600">{formatCurrency(data?.totalReceived || 0)}</td>
              <td className="px-4 py-2 text-right font-medium">{formatCurrency(data?.memberReceivables || 0)} Dr</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={4} className="px-4 py-2 text-right">Grand Totals:</td>
              <td className="px-4 py-2 text-right text-green-600">{formatCurrency(data?.grandTotalDebit || 0)}</td>
              <td className="px-4 py-2 text-right text-blue-600">{formatCurrency(data?.grandTotalCredit || 0)}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(Math.abs((data?.grandTotalDebit || 0) - (data?.grandTotalCredit || 0)))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
