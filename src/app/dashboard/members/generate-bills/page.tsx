"use client";

import { useState } from "react";
import { apiFetch, formatCurrency } from "@/lib/api";

interface TariffItem { name: string; amount: number; }
interface PreviewEntry {
  memberId: string; memberName: string; unitNo: string;
  tariffTotal: number; interestAmount: number; taxAmount: number;
  totalAmount: number; alreadyBilled: boolean;
}
interface PreviewData {
  tariffs: TariffItem[];
  tariffTotal: number;
  gstRate: number;
  interestRate: number;
  interestType: string;
  preview: PreviewEntry[];
}
interface GenerateResult {
  generated: number;
  skipped: number;
  bills: { memberName: string; unitNo: string; billNo: string; totalAmount: number }[];
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function GenerateBillsPage() {
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState("");

  async function handlePreview() {
    if (!month || !year) return;
    setLoading(true);
    setResult(null);
    setMsg("");
    try {
      const monthStr = `${month} ${year}`;
      const data = await apiFetch<PreviewData>(`/api/bills/generate?month=${encodeURIComponent(monthStr)}`);
      setPreview(data);
    } catch (e) { setMsg("Error: " + (e as Error).message); }
    finally { setLoading(false); }
  }

  async function handleGenerate() {
    if (!month || !year) return;
    setGenerating(true);
    setMsg("");
    try {
      const monthStr = `${month} ${year}`;
      const data = await apiFetch<GenerateResult>("/api/bills/generate", {
        method: "POST",
        body: JSON.stringify({ month: monthStr, billType: "REGULAR" }),
      });
      setResult(data);
      setPreview(null);
      setMsg(`Successfully generated ${data.generated} bills!${data.skipped > 0 ? ` (${data.skipped} already existed)` : ""}`);
    } catch (e) { setMsg("Error: " + (e as Error).message); }
    finally { setGenerating(false); }
  }

  const newBills = preview?.preview.filter(p => !p.alreadyBilled) || [];
  const skippedBills = preview?.preview.filter(p => p.alreadyBilled) || [];
  const totalGenAmount = newBills.reduce((s, p) => s + p.totalAmount, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Generate Bills</h2>
      </div>
      <div className="p-6">
        {msg && <div className={`text-sm rounded-lg p-3 mb-4 ${msg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{msg}</div>}

        {/* Month/Year selection */}
        <div className="flex gap-4 items-end justify-center mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select value={month} onChange={(e) => { setMonth(e.target.value); setPreview(null); setResult(null); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none min-w-[150px]">
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select value={year} onChange={(e) => { setYear(e.target.value); setPreview(null); setResult(null); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
              {["2023","2024","2025","2026","2027"].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={handlePreview} disabled={loading} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50">
            {loading ? "Loading..." : "Preview Bills"}
          </button>
        </div>

        {/* Preview Section */}
        {preview && (
          <>
            {/* Tariff breakdown */}
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Tariff Breakdown per Member</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {preview.tariffs.map((t, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-600">{t.name}</span>
                    <span className="font-medium">{formatCurrency(t.amount)}</span>
                  </div>
                ))}
                <div className="col-span-2 border-t pt-2 flex justify-between font-semibold">
                  <span>Tariff Sub-total</span>
                  <span>{formatCurrency(preview.tariffTotal)}</span>
                </div>
                {preview.gstRate > 0 && (
                  <div className="col-span-2 flex justify-between text-orange-600">
                    <span>GST @ {preview.gstRate}%</span>
                    <span>{formatCurrency(preview.tariffTotal * preview.gstRate / 100)}</span>
                  </div>
                )}
                {preview.interestRate > 0 && (
                  <div className="col-span-2 text-xs text-gray-500">
                    Interest: {preview.interestRate}% p.a. ({preview.interestType.toLowerCase()}) on overdue amounts
                  </div>
                )}
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Bills to Generate</div>
                <div className="text-2xl font-bold text-green-700">{newBills.length}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Already Generated</div>
                <div className="text-2xl font-bold text-yellow-700">{skippedBills.length}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Total Amount</div>
                <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalGenAmount)}</div>
              </div>
            </div>

            {/* Preview table */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-50">
                    <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-700">Unit</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-700">Member</th>
                    <th className="text-right px-4 py-2 font-semibold text-gray-700">Tariff</th>
                    <th className="text-right px-4 py-2 font-semibold text-gray-700">Interest</th>
                    <th className="text-right px-4 py-2 font-semibold text-gray-700">Tax</th>
                    <th className="text-right px-4 py-2 font-semibold text-gray-700">Total</th>
                    <th className="text-center px-4 py-2 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((p, i) => (
                    <tr key={p.memberId} className={`border-b ${p.alreadyBilled ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"}`}>
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2 font-medium">{p.unitNo}</td>
                      <td className="px-4 py-2">{p.memberName}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(p.tariffTotal)}</td>
                      <td className="px-4 py-2 text-right text-orange-600">{p.interestAmount > 0 ? formatCurrency(p.interestAmount) : "-"}</td>
                      <td className="px-4 py-2 text-right">{p.taxAmount > 0 ? formatCurrency(p.taxAmount) : "-"}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(p.totalAmount)}</td>
                      <td className="px-4 py-2 text-center">
                        {p.alreadyBilled ? (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">Exists</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">New</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {newBills.length > 0 && (
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={6} className="px-4 py-2 text-right">New Bills Total:</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(totalGenAmount)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Generate button */}
            {newBills.length > 0 && (
              <div className="flex justify-center">
                <button onClick={handleGenerate} disabled={generating} className="bg-green-600 text-white px-10 py-3 rounded-lg hover:bg-green-700 transition font-semibold text-base disabled:opacity-50">
                  {generating ? "Generating..." : `Generate ${newBills.length} Bills for ${month} ${year}`}
                </button>
              </div>
            )}

            {newBills.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                All members already have bills for {month} {year}.
              </div>
            )}
          </>
        )}

        {/* Generation Result */}
        {result && result.bills.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Generated Bills</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-50">
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Bill No.</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Unit</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Member</th>
                  <th className="text-right px-4 py-2 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {result.bills.map((b, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{b.billNo}</td>
                    <td className="px-4 py-2">{b.unitNo}</td>
                    <td className="px-4 py-2">{b.memberName}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(b.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(result.bills.reduce((s, b) => s + b.totalAmount, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
