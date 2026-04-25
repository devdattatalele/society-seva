"use client";

import { useState, useEffect, useCallback } from "react";
import { Printer, FileDown, FileSpreadsheet } from "lucide-react";
import { apiFetch, formatCurrency } from "@/lib/api";
import { generateReportPDF } from "@/lib/pdf";
import { exportToExcel } from "@/lib/excel";

interface IEData {
  incomeItems: { name: string; amount: number }[];
  totalIncome: number;
  expenseItems: { name: string; amount: number }[];
  totalExpense: number;
  generalReceipts: number;
  surplus: number;
}

export default function IncomeExpenditurePage() {
  const [data, setData] = useState<IEData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const result = await apiFetch<IEData>("/api/reports/income-expenditure");
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl flex justify-between items-center">
        <div />
        <h2 className="text-lg font-semibold text-center">Income & Expenditure Statement</h2>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="text-white hover:text-purple-200" title="Print"><Printer size={18} /></button>
          <button onClick={() => {
            const incomeRows = (data?.incomeItems || []).map(i => ["INCOME", i.name, formatCurrency(i.amount)]);
            const expenseRows = (data?.expenseItems || []).map(i => ["EXPENSE", i.name, formatCurrency(i.amount)]);
            const rows = [...incomeRows, ...expenseRows];
            generateReportPDF("Income & Expenditure Statement", ["Type", "Particular", "Amount"], rows, { subtitle: `For the period ending ${new Date().toLocaleDateString("en-IN")}`, totals: ["", "Surplus / Deficit", formatCurrency(data?.surplus || 0)] });
          }} className="text-white hover:text-purple-200" title="Download PDF"><FileDown size={18} /></button>
          <button onClick={() => {
            const incomeRows = (data?.incomeItems || []).map(i => ["INCOME", i.name, i.amount]);
            const expenseRows = (data?.expenseItems || []).map(i => ["EXPENSE", i.name, i.amount]);
            const rows = [...incomeRows, ...expenseRows];
            exportToExcel("Income & Expenditure", ["Type", "Particular", "Amount"], rows);
          }} className="text-white hover:text-purple-200" title="Download Excel"><FileSpreadsheet size={18} /></button>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold">Income & Expenditure Statement</h3>
          <p className="text-sm text-gray-600">For the period ending {new Date().toLocaleDateString("en-IN")}</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Income side */}
          <div>
            <h4 className="text-sm font-semibold text-green-700 bg-green-50 px-4 py-2 rounded-t-lg">INCOME</h4>
            <table className="w-full text-sm">
              <tbody>
                {(data?.incomeItems || []).map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
                {(data?.generalReceipts || 0) > 0 && (
                  <tr className="border-b">
                    <td className="px-4 py-2">General Receipts</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(data?.generalReceipts || 0)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-green-50 font-semibold">
                  <td className="px-4 py-2">Total Income</td>
                  <td className="px-4 py-2 text-right text-green-700">{formatCurrency((data?.totalIncome || 0) + (data?.generalReceipts || 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Expenditure side */}
          <div>
            <h4 className="text-sm font-semibold text-red-700 bg-red-50 px-4 py-2 rounded-t-lg">EXPENDITURE</h4>
            <table className="w-full text-sm">
              <tbody>
                {(data?.expenseItems || []).map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
                {(data?.expenseItems || []).length === 0 && (
                  <tr><td colSpan={2} className="text-center py-4 text-gray-400">No expenses recorded.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-red-50 font-semibold">
                  <td className="px-4 py-2">Total Expenditure</td>
                  <td className="px-4 py-2 text-right text-red-700">{formatCurrency(data?.totalExpense || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Surplus / Deficit */}
        <div className={`mt-6 p-4 rounded-lg text-center ${(data?.surplus || 0) >= 0 ? "bg-green-50" : "bg-red-50"}`}>
          <div className="text-sm text-gray-600">{(data?.surplus || 0) >= 0 ? "Surplus (Excess of Income over Expenditure)" : "Deficit (Excess of Expenditure over Income)"}</div>
          <div className={`text-2xl font-bold ${(data?.surplus || 0) >= 0 ? "text-green-700" : "text-red-700"}`}>
            {formatCurrency(Math.abs(data?.surplus || 0))}
          </div>
        </div>
      </div>
    </div>
  );
}
