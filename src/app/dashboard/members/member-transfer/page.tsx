"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch, formatDate } from "@/lib/api";

interface Unit { id: string; unitNo: string; }
interface Member { id: string; name: string; memberNo: string | null; units: Unit[]; }
interface Transfer {
  id: string; transferDate: string; unitId: string; notes: string | null;
  fromMember: { name: string }; toMember: { name: string };
}

export default function MemberTransferPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [form, setForm] = useState({ fromMemberId: "", toMemberId: "", unitId: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [m, t] = await Promise.all([
      apiFetch<Member[]>("/api/members"),
      apiFetch<Transfer[]>("/api/members/transfer"),
    ]);
    setMembers(m);
    setTransfers(t);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fromMember = members.find(m => m.id === form.fromMemberId);
  const availableUnits = fromMember?.units || [];

  async function handleSubmit() {
    if (!form.fromMemberId || !form.toMemberId || !form.unitId) {
      setMsg("All fields are required"); return;
    }
    if (form.fromMemberId === form.toMemberId) {
      setMsg("From and To members must be different"); return;
    }
    setSaving(true); setMsg("");
    try {
      await apiFetch("/api/members/transfer", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMsg("Transfer completed successfully!");
      setForm({ fromMemberId: "", toMemberId: "", unitId: "", notes: "" });
      fetchData();
    } catch (e) { setMsg("Error: " + (e as Error).message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 4000); }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none";

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Member Transfer</h2>
      </div>
      <div className="p-6">
        {msg && <div className={`text-sm rounded-lg p-3 mb-4 ${msg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{msg}</div>}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
          Transfer a flat/unit from one member to another. All future billing will go to the new owner. Past billing history remains with the original member.
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Member (Current Owner) *</label>
            <select value={form.fromMemberId} onChange={(e) => setForm({...form, fromMemberId: e.target.value, unitId: ""})} className={inputClass}>
              <option value="">Select current owner</option>
              {members.filter(m => m.units.length > 0).map((m) => (
                <option key={m.id} value={m.id}>{m.name} - {m.units.map(u => u.unitNo).join(", ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Member (New Owner) *</label>
            <select value={form.toMemberId} onChange={(e) => setForm({...form, toMemberId: e.target.value})} className={inputClass}>
              <option value="">Select new owner</option>
              {members.filter(m => m.id !== form.fromMemberId).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit to Transfer *</label>
            <select value={form.unitId} onChange={(e) => setForm({...form, unitId: e.target.value})} className={inputClass}>
              <option value="">Select unit</option>
              {availableUnits.map((u) => (
                <option key={u.id} value={u.id}>{u.unitNo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className={inputClass} placeholder="e.g. Sale deed #..." />
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <button onClick={handleSubmit} disabled={saving} className="bg-teal-600 text-white px-8 py-2.5 rounded-lg hover:bg-teal-700 transition font-medium disabled:opacity-50">
            {saving ? "Processing..." : "Transfer Unit"}
          </button>
        </div>

        {/* Transfer history */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Transfer History</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">From</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">To</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No transfers recorded.</td></tr>
              ) : transfers.map((t) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{formatDate(t.transferDate)}</td>
                  <td className="px-4 py-2">{t.fromMember.name}</td>
                  <td className="px-4 py-2">{t.toMember.name}</td>
                  <td className="px-4 py-2 text-gray-500">{t.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
