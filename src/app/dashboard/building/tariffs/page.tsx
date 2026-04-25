"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch, formatCurrency } from "@/lib/api";

interface LedgerHead { id: string; name: string; }
interface Tariff { id: string; name: string; amount: number; frequency: string; ledgerHeadId: string | null; ledgerHead: LedgerHead | null; sortOrder: number; }

export default function TariffsPage() {
  const [form, setForm] = useState({ name: "", amount: "", frequency: "MONTHLY", ledgerHeadId: "" });
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [ledgerHeads, setLedgerHeads] = useState<LedgerHead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [t, lh] = await Promise.all([
      apiFetch<Tariff[]>("/api/tariffs"),
      apiFetch<LedgerHead[]>("/api/ledger-heads"),
    ]);
    setTariffs(t);
    setLedgerHeads(lh);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAdd() {
    if (!form.name || !form.amount) return;
    await apiFetch("/api/tariffs", {
      method: "POST",
      body: JSON.stringify({ ...form, ledgerHeadId: form.ledgerHeadId || null }),
    });
    setForm({ name: "", amount: "", frequency: "MONTHLY", ledgerHeadId: "" });
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tariff?")) return;
    await apiFetch("/api/tariffs", { method: "DELETE", body: JSON.stringify({ id }) });
    fetchData();
  }

  const totalMonthly = tariffs.filter(t => t.frequency === "MONTHLY").reduce((s, t) => s + t.amount, 0);
  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none";

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Add Tariffs</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tariff Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={inputClass} placeholder="e.g. Sinking Fund" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select value={form.frequency} onChange={(e) => setForm({...form, frequency: e.target.value})} className={inputClass}>
              <option value="MONTHLY">Monthly</option><option value="QUARTERLY">Quarterly</option><option value="YEARLY">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ledger Head</label>
            <select value={form.ledgerHeadId} onChange={(e) => setForm({...form, ledgerHeadId: e.target.value})} className={inputClass}>
              <option value="">-- Select --</option>
              {ledgerHeads.map((lh) => <option key={lh.id} value={lh.id}>{lh.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleAdd} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2">
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Tariff Name</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Amount</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Frequency</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Ledger Head</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {tariffs.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No tariffs defined yet.</td></tr>
            ) : tariffs.map((t, i) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{t.name}</td>
                <td className="px-4 py-2 text-right font-medium">{formatCurrency(t.amount)}</td>
                <td className="px-4 py-2">{t.frequency}</td>
                <td className="px-4 py-2">{t.ledgerHead?.name || "-"}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
          {tariffs.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={2} className="px-4 py-2 text-right">Total Monthly:</td>
                <td className="px-4 py-2 text-right">{formatCurrency(totalMonthly)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
