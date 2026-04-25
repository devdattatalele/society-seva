"use client";

import { useState, useEffect, useCallback } from "react";
import { Printer, FileDown, FileSpreadsheet } from "lucide-react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";
import { generateReportPDF } from "@/lib/pdf";
import { exportToExcel } from "@/lib/excel";

interface BSData {
  assets: { name: string; amount: number }[];
  totalAssets: number;
  liabilities: { name: string; amount: number }[];
  totalLiabilities: number;
  asOnDate: string;
}

export default function BalanceSheetPage() {
  const [data, setData] = useState<BSData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const result = await apiFetch<BSData>("/api/reports/balance-sheet");
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl flex justify-between items-center">
        <div />
        <h2 className="text-lg font-semibold text-center">Balance Sheet</h2>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="text-white hover:text-purple-200" title="Print"><Printer size={18} /></button>
          <button onClick={() => {
            const liabRows = (data?.liabilities || []).map(i => ["LIABILITY", i.name, formatCurrency(i.amount)]);
            const assetRows = (data?.assets || []).map(i => ["ASSET", i.name, formatCurrency(i.amount)]);
            const rows = [...liabRows, ...assetRows];
            generateReportPDF("Balance Sheet", ["Type", "Particular", "Amount"], rows, { subtitle: `As on ${data?.asOnDate ? formatDate(data.asOnDate) : new Date().toLocaleDateString("en-IN")}`, totals: ["", "Total Assets / Liabilities", `${formatCurrency(data?.totalAssets || 0)} / ${formatCurrency(data?.totalLiabilities || 0)}`] });
          }} className="text-white hover:text-purple-200" title="Download PDF"><FileDown size={18} /></button>
          <button onClick={() => {
            const liabRows = (data?.liabilities || []).map(i => ["LIABILITY", i.name, i.amount]);
            const assetRows = (data?.assets || []).map(i => ["ASSET", i.name, i.amount]);
            const rows = [...liabRows, ...assetRows];
            exportToExcel("Balance Sheet", ["Type", "Particular", "Amount"], rows);
          }} className="text-white hover:text-purple-200" title="Download Excel"><FileSpreadsheet size={18} /></button>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold">Balance Sheet</h3>
          <p className="text-sm text-gray-600">As on {data?.asOnDate ? formatDate(data.asOnDate) : new Date().toLocaleDateString("en-IN")}</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Liabilities side */}
          <div>
            <h4 className="text-sm font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded-t-lg">LIABILITIES & CAPITAL</h4>
            <table className="w-full text-sm">
              <tbody>
                {(data?.liabilities || []).map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50 font-semibold">
                  <td className="px-4 py-2">Total Liabilities</td>
                  <td className="px-4 py-2 text-right text-blue-700">{formatCurrency(data?.totalLiabilities || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Assets side */}
          <div>
            <h4 className="text-sm font-semibold text-green-700 bg-green-50 px-4 py-2 rounded-t-lg">ASSETS</h4>
            <table className="w-full text-sm">
              <tbody>
                {(data?.assets || []).map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-50 font-semibold">
                  <td className="px-4 py-2">Total Assets</td>
                  <td className="px-4 py-2 text-right text-green-700">{formatCurrency(data?.totalAssets || 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Balance check */}
        <div className={`mt-6 p-4 rounded-lg text-center ${Math.abs((data?.totalAssets || 0) - (data?.totalLiabilities || 0)) < 1 ? "bg-green-50" : "bg-yellow-50"}`}>
          {Math.abs((data?.totalAssets || 0) - (data?.totalLiabilities || 0)) < 1 ? (
            <div className="text-green-700 font-semibold">Balance Sheet is balanced</div>
          ) : (
            <div className="text-yellow-700 font-semibold">
              Difference: {formatCurrency(Math.abs((data?.totalAssets || 0) - (data?.totalLiabilities || 0)))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
