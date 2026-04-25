"use client";

import { useState, useEffect, useCallback } from "react";
import { Printer, FileDown, FileSpreadsheet } from "lucide-react";
import { apiFetch, formatCurrency } from "@/lib/api";
import { generateReportPDF } from "@/lib/pdf";
import { exportToExcel } from "@/lib/excel";

interface BalanceEntry {
  unitNo: string; memberName: string;
  principalBalance: number; interestBalance: number;
  taxBalance: number; totalBalance: number;
}

interface ClosingBalanceData {
  balances: BalanceEntry[];
  totalDr: number;
  totalCr: number;
}

export default function ClosingBalancePage() {
  const [data, setData] = useState<ClosingBalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const result = await apiFetch<ClosingBalanceData>("/api/reports/closing-balance");
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  const balances = data?.balances || [];
  const totalPrincipal = balances.reduce((s, b) => s + b.principalBalance, 0);
  const totalInterest = balances.reduce((s, b) => s + b.interestBalance, 0);
  const totalTax = balances.reduce((s, b) => s + b.taxBalance, 0);
  const totalBalance = balances.reduce((s, b) => s + b.totalBalance, 0);

  const fmtBal = (val: number) => {
    if (val === 0) return "0";
    return `${formatCurrency(Math.abs(val))} ${val >= 0 ? "Dr" : "Cr"}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl flex justify-between items-center">
        <div />
        <h2 className="text-lg font-semibold text-center">Member Closing Balance</h2>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="text-white hover:text-purple-200 transition" title="Print"><Printer size={18} /></button>
          <button onClick={() => {
            const rows = balances.map((b, i) => [i + 1, b.unitNo || "-", b.memberName, fmtBal(b.principalBalance), fmtBal(b.interestBalance), fmtBal(b.taxBalance), fmtBal(b.totalBalance)]);
            generateReportPDF("Member Closing Balance", ["#", "Unit No.", "Member Name", "Principal", "Interest", "Tax", "Total Balance"], rows, { subtitle: `As on ${new Date().toLocaleDateString("en-IN")}`, totals: ["", "", "Totals", fmtBal(totalPrincipal), fmtBal(totalInterest), fmtBal(totalTax), fmtBal(totalBalance)] });
          }} className="text-white hover:text-purple-200 transition" title="Download PDF"><FileDown size={18} /></button>
          <button onClick={() => {
            const rows = balances.map((b, i) => [i + 1, b.unitNo || "-", b.memberName, b.principalBalance, b.interestBalance, b.taxBalance, b.totalBalance]);
            exportToExcel("Member Closing Balance", ["#", "Unit No.", "Member Name", "Principal Balance", "Interest Balance", "Tax Balance", "Total Balance"], rows);
          }} className="text-white hover:text-purple-200 transition" title="Download Excel"><FileSpreadsheet size={18} /></button>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold">Member Closing Balance</h3>
          <p className="text-sm text-gray-600">As on {new Date().toLocaleDateString("en-IN")}</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-purple-50">
              <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Unit No.</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Member Name</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Principal Balance</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Interest Balance</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Tax Balance</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Total Balance</th>
            </tr>
          </thead>
          <tbody>
            {balances.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No members found.</td></tr>
            ) : balances.map((row, i) => (
              <tr key={i} className={`border-b hover:bg-gray-50 ${row.totalBalance > 0 ? "" : ""}`}>
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2 font-medium">{row.unitNo || "-"}</td>
                <td className="px-4 py-2">{row.memberName}</td>
                <td className={`px-4 py-2 text-right ${row.principalBalance > 0 ? "text-red-600" : ""}`}>{fmtBal(row.principalBalance)}</td>
                <td className={`px-4 py-2 text-right ${row.interestBalance > 0 ? "text-orange-600" : ""}`}>{fmtBal(row.interestBalance)}</td>
                <td className="px-4 py-2 text-right">{fmtBal(row.taxBalance)}</td>
                <td className={`px-4 py-2 text-right font-medium ${row.totalBalance > 0 ? "text-red-600" : "text-green-600"}`}>{fmtBal(row.totalBalance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={3} className="px-4 py-2 text-right">Totals:</td>
              <td className="px-4 py-2 text-right">{fmtBal(totalPrincipal)}</td>
              <td className="px-4 py-2 text-right">{fmtBal(totalInterest)}</td>
              <td className="px-4 py-2 text-right">{fmtBal(totalTax)}</td>
              <td className="px-4 py-2 text-right">{fmtBal(totalBalance)}</td>
            </tr>
            <tr className="bg-gray-50 text-sm">
              <td colSpan={6} className="px-4 py-2 text-right font-medium">Total Dr / Cr:</td>
              <td className="px-4 py-2 text-right">
                <span className="text-red-600">{formatCurrency(data?.totalDr || 0)} Dr</span> / <span className="text-green-600">{formatCurrency(data?.totalCr || 0)} Cr</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
