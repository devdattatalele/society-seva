"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface SubGroup {
  id: string;
  name: string;
  code: string | null;
  groupType: string;
  _count?: { heads: number };
}

export default function HeadSubGroupPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [groupType, setGroupType] = useState("INCOME");
  const [subGroups, setSubGroups] = useState<SubGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editType, setEditType] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const data = await apiFetch<SubGroup[]>("/api/head-sub-groups");
      setSubGroups(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAdd() {
    if (!name) return;
    await apiFetch("/api/head-sub-groups", {
      method: "POST",
      body: JSON.stringify({ name, code, groupType }),
    });
    setName("");
    setCode("");
    setGroupType("INCOME");
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This will also delete linked ledger heads.")) return;
    await apiFetch("/api/head-sub-groups", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    fetchData();
  }

  async function handleUpdate(id: string) {
    await apiFetch("/api/head-sub-groups", {
      method: "PUT",
      body: JSON.stringify({ id, name: editName, code: editCode, groupType: editType }),
    });
    setEditingId(null);
    fetchData();
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none";

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Head Sub Group</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Group Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Water Charges" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} placeholder="e.g. WATER" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={groupType} onChange={(e) => setGroupType(e.target.value)} className={inputClass}>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
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
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Sub Group Name</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Code</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Type</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Ledger Heads</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {subGroups.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No sub groups yet. Add one above.</td></tr>
            ) : subGroups.map((sg, i) => (
              <tr key={sg.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">
                  {editingId === sg.id ? (
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" />
                  ) : sg.name}
                </td>
                <td className="px-4 py-2">
                  {editingId === sg.id ? (
                    <input value={editCode} onChange={(e) => setEditCode(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" />
                  ) : sg.code || "-"}
                </td>
                <td className="px-4 py-2">
                  {editingId === sg.id ? (
                    <select value={editType} onChange={(e) => setEditType(e.target.value)} className="border rounded px-2 py-1 text-sm">
                      <option value="INCOME">Income</option>
                      <option value="EXPENSE">Expense</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${sg.groupType === "INCOME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {sg.groupType}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{sg._count?.heads || 0}</td>
                <td className="px-4 py-2 flex gap-2">
                  {editingId === sg.id ? (
                    <>
                      <button onClick={() => handleUpdate(sg.id)} className="text-green-500 hover:text-green-700"><Save size={14} /></button>
                      <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700"><X size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(sg.id); setEditName(sg.name); setEditCode(sg.code || ""); setEditType(sg.groupType); }} className="text-blue-500 hover:text-blue-700"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(sg.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
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
