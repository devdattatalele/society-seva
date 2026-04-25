"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";

interface CashEntry {
  id: string; date: string; voucherNo: string | null; particular: string;
  receipt: number; payment: number; type: string | null;
}

export default function GeneralReceiptPage() {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    receivedFrom: "", amount: "", description: "", paymentMode: "CASH",
  });
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const data = await apiFetch<CashEntry[]>("/api/cash-entries?type=receipt");
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSubmit() {
    if (!form.receivedFrom || !form.amount) { setMsg("Received From and Amount are required"); return; }
    setSaving(true);
    setMsg("");
    try {
      await apiFetch("/api/cash-entries", {
        method: "POST",
        body: JSON.stringify({
          date: form.date,
          particular: `General Receipt - ${form.receivedFrom}${form.description ? ` (${form.description})` : ""}`,
          type: "receipt",
          receipt: form.amount,
          payment: "0",
        }),
      });
      setMsg("Receipt recorded successfully!");
      setForm({ date: new Date().toISOString().split("T")[0], receivedFrom: "", amount: "", description: "", paymentMode: "CASH" });
      fetchData();
    } catch (e) { setMsg("Error: " + (e as Error).message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 4000); }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none";

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">General Receipt</h2>
      </div>
      <div className="p-6">
        {msg && <div className={`text-sm rounded-lg p-3 mb-4 ${msg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{msg}</div>}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Received From *</label>
            <input type="text" value={form.receivedFrom} onChange={(e) => setForm({...form, receivedFrom: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <select value={form.paymentMode} onChange={(e) => setForm({...form, paymentMode: e.target.value})} className={inputClass}>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className={inputClass} />
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button onClick={handleSubmit} disabled={saving} className="bg-purple-600 text-white px-8 py-2.5 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50">
            {saving ? "Saving..." : "Submit"}
          </button>
        </div>

        {/* Recent receipts */}
        {entries.length > 0 && (
          <div className="mt-8 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent General Receipts</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-50">
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Particular</th>
                  <th className="text-right px-4 py-2 font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.filter(e => e.receipt > 0).map((e) => (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{formatDate(e.date)}</td>
                    <td className="px-4 py-2">{e.particular}</td>
                    <td className="px-4 py-2 text-right font-medium text-green-600">{formatCurrency(e.receipt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
