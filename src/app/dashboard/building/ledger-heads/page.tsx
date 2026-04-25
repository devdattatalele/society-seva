"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface SubGroup { id: string; name: string; }
interface LedgerHead {
  id: string; name: string; code: string | null; type: string;
  openingBalance: number; subGroupId: string | null; subGroup: SubGroup | null;
}

export default function LedgerHeadsPage() {
  const [form, setForm] = useState({ name: "", code: "", type: "INCOME", subGroupId: "", openingBalance: "0" });
  const [heads, setHeads] = useState<LedgerHead[]>([]);
  const [subGroups, setSubGroups] = useState<SubGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", code: "", type: "", subGroupId: "", openingBalance: "" });

  const fetchData = useCallback(async () => {
    const [h, sg] = await Promise.all([
      apiFetch<LedgerHead[]>("/api/ledger-heads"),
      apiFetch<SubGroup[]>("/api/head-sub-groups"),
    ]);
    setHeads(h);
    setSubGroups(sg);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAdd() {
    if (!form.name) return;
    await apiFetch("/api/ledger-heads", {
      method: "POST",
      body: JSON.stringify({ ...form, openingBalance: parseFloat(form.openingBalance) || 0 }),
    });
    setForm({ name: "", code: "", type: "INCOME", subGroupId: "", openingBalance: "0" });
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this ledger head?")) return;
    await apiFetch("/api/ledger-heads", { method: "DELETE", body: JSON.stringify({ id }) });
    fetchData();
  }

  async function handleUpdate(id: string) {
    await apiFetch("/api/ledger-heads", {
      method: "PUT",
      body: JSON.stringify({ id, ...editForm, openingBalance: parseFloat(editForm.openingBalance) || 0 }),
    });
    setEditingId(null);
    fetchData();
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none";

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Ledger Heads</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-6 gap-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ledger Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input type="text" value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className={inputClass}>
              <option value="INCOME">Income</option><option value="EXPENSE">Expense</option>
              <option value="ASSET">Asset</option><option value="LIABILITY">Liability</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Group</label>
            <select value={form.subGroupId} onChange={(e) => setForm({...form, subGroupId: e.target.value})} className={inputClass}>
              <option value="">-- None --</option>
              {subGroups.map((sg) => <option key={sg.id} value={sg.id}>{sg.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
            <input type="number" value={form.openingBalance} onChange={(e) => setForm({...form, openingBalance: e.target.value})} className={inputClass} />
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
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Name</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Code</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Type</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Sub Group</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Opening Bal.</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {heads.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No ledger heads yet.</td></tr>
            ) : heads.map((h, i) => (
              <tr key={h.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">
                  {editingId === h.id ? <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="border rounded px-2 py-1 text-sm w-full" /> : h.name}
                </td>
                <td className="px-4 py-2">
                  {editingId === h.id ? <input value={editForm.code} onChange={(e) => setEditForm({...editForm, code: e.target.value})} className="border rounded px-2 py-1 text-sm w-20" /> : h.code || "-"}
                </td>
                <td className="px-4 py-2">
                  {editingId === h.id ? (
                    <select value={editForm.type} onChange={(e) => setEditForm({...editForm, type: e.target.value})} className="border rounded px-2 py-1 text-sm">
                      <option value="INCOME">Income</option><option value="EXPENSE">Expense</option>
                      <option value="ASSET">Asset</option><option value="LIABILITY">Liability</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${h.type === "INCOME" ? "bg-green-100 text-green-700" : h.type === "EXPENSE" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{h.type}</span>
                  )}
                </td>
                <td className="px-4 py-2">{h.subGroup?.name || "-"}</td>
                <td className="px-4 py-2 text-right">
                  {editingId === h.id ? <input type="number" value={editForm.openingBalance} onChange={(e) => setEditForm({...editForm, openingBalance: e.target.value})} className="border rounded px-2 py-1 text-sm w-24 text-right" /> : `₹${(h.openingBalance ?? 0).toFixed(2)}`}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  {editingId === h.id ? (
                    <>
                      <button onClick={() => handleUpdate(h.id)} className="text-green-500 hover:text-green-700"><Save size={14} /></button>
                      <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700"><X size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(h.id); setEditForm({ name: h.name, code: h.code || "", type: h.type, subGroupId: h.subGroupId || "", openingBalance: String(h.openingBalance ?? 0) }); }} className="text-blue-500 hover:text-blue-700"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(h.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
