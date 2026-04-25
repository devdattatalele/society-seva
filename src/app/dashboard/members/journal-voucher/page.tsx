"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";

interface LedgerHead { id: string; name: string; }
interface Unit { id: string; unitNo: string; }
interface Member { id: string; name: string; units: Unit[]; }
interface VoucherLine { type: string; ledgerHeadId: string; amount: string; }
interface JournalVoucher {
  id: string; voucherNo: string; date: string; notes: string | null;
  member: { name: string } | null;
  lines: { id: string; type: string; amount: number; ledgerHead: { name: string } }[];
}

export default function JournalVoucherPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [ledgerHeads, setLedgerHeads] = useState<LedgerHead[]>([]);
  const [vouchers, setVouchers] = useState<JournalVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], notes: "", memberId: "" });
  const [lines, setLines] = useState<VoucherLine[]>([
    { type: "DEBIT", ledgerHeadId: "", amount: "0" },
    { type: "CREDIT", ledgerHeadId: "", amount: "0" },
  ]);

  const fetchData = useCallback(async () => {
    const [m, lh, v] = await Promise.all([
      apiFetch<Member[]>("/api/members"),
      apiFetch<LedgerHead[]>("/api/ledger-heads"),
      apiFetch<JournalVoucher[]>("/api/vouchers"),
    ]);
    setMembers(m);
    setLedgerHeads(lh);
    setVouchers(v);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function addLine() {
    setLines([...lines, { type: "CREDIT", ledgerHeadId: "", amount: "0" }]);
  }

  function removeLine(index: number) {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  }

  function updateLine(index: number, field: keyof VoucherLine, value: string) {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  }

  async function handleSubmit() {
    const validLines = lines.filter(l => l.ledgerHeadId && parseFloat(l.amount) > 0);
    if (validLines.length === 0) { setMsg("Add at least one line with an account and amount"); return; }

    const totalDr = validLines.filter(l => l.type === "DEBIT").reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
    const totalCr = validLines.filter(l => l.type === "CREDIT").reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
    if (Math.abs(totalDr - totalCr) > 0.01) { setMsg("Debit and Credit totals must match"); return; }

    setSaving(true);
    setMsg("");
    try {
      await apiFetch("/api/vouchers", {
        method: "POST",
        body: JSON.stringify({
          date: form.date,
          notes: form.notes || null,
          memberId: form.memberId || null,
          lines: validLines.map(l => ({
            type: l.type,
            amount: parseFloat(l.amount),
            ledgerHeadId: l.ledgerHeadId,
          })),
        }),
      });
      setMsg("Journal voucher created successfully!");
      setForm({ date: new Date().toISOString().split("T")[0], notes: "", memberId: "" });
      setLines([
        { type: "DEBIT", ledgerHeadId: "", amount: "0" },
        { type: "CREDIT", ledgerHeadId: "", amount: "0" },
      ]);
      fetchData();
    } catch (e) { setMsg("Error: " + (e as Error).message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 4000); }
  }

  const totalDr = lines.reduce((s, l) => l.type === "DEBIT" ? s + (parseFloat(l.amount) || 0) : s, 0);
  const totalCr = lines.reduce((s, l) => l.type === "CREDIT" ? s + (parseFloat(l.amount) || 0) : s, 0);

  const filtered = vouchers.filter(v =>
    v.voucherNo.toLowerCase().includes(search.toLowerCase()) ||
    v.notes?.toLowerCase().includes(search.toLowerCase()) ||
    v.member?.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none";

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Journal Voucher</h2>
      </div>
      <div className="p-6">
        {msg && <div className={`text-sm rounded-lg p-3 mb-4 ${msg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{msg}</div>}

        {/* Header fields */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member (optional)</label>
            <select value={form.memberId} onChange={(e) => setForm({...form, memberId: e.target.value})} className={inputClass}>
              <option value="">No member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name} - {m.units.map(u => u.unitNo).join(", ")}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Voucher lines */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Voucher Lines</h4>
            <button onClick={addLine} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition flex items-center gap-1 text-sm">
              <Plus size={14} /> Add Line
            </button>
          </div>
          <div className="grid grid-cols-[120px_1fr_150px_40px] gap-3 bg-purple-50 px-4 py-2 rounded-t-lg">
            <div className="text-sm font-semibold text-gray-700">Type</div>
            <div className="text-sm font-semibold text-gray-700">Account (Ledger Head)</div>
            <div className="text-sm font-semibold text-gray-700">Amount</div>
            <div></div>
          </div>
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-[120px_1fr_150px_40px] gap-3 px-4 py-2 border-b items-center">
              <select value={line.type} onChange={(e) => updateLine(i, "type", e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>
              <select value={line.ledgerHeadId} onChange={(e) => updateLine(i, "ledgerHeadId", e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm">
                <option value="">Select Account</option>
                {ledgerHeads.map((lh) => <option key={lh.id} value={lh.id}>{lh.name}</option>)}
              </select>
              <input type="number" value={line.amount} onChange={(e) => updateLine(i, "amount", e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
              <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          ))}
          <div className="grid grid-cols-[120px_1fr_150px_40px] gap-3 px-4 py-2 bg-gray-50 text-sm font-semibold">
            <div></div>
            <div className="text-right">Totals:</div>
            <div className="flex justify-between">
              <span className="text-green-600">Dr: {formatCurrency(totalDr)}</span>
              <span className="text-blue-600">Cr: {formatCurrency(totalCr)}</span>
            </div>
            <div></div>
          </div>
          {Math.abs(totalDr - totalCr) > 0.01 && totalDr > 0 && (
            <div className="text-xs text-red-500 px-4 py-1">Difference: {formatCurrency(Math.abs(totalDr - totalCr))} — Dr and Cr must match</div>
          )}
        </div>

        <div className="flex justify-center mb-8">
          <button onClick={handleSubmit} disabled={saving} className="bg-purple-600 text-white px-8 py-2.5 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50">
            {saving ? "Saving..." : "Submit Voucher"}
          </button>
        </div>

        {/* Existing vouchers table */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-sm">
              Show{" "}
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1">
                <option>10</option><option>25</option><option>50</option>
              </select>{" "}entries
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-purple-50">
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Vo. No.</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Date</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Member</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Lines</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-700">Dr. Total</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-700">Cr. Total</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No vouchers found.</td></tr>
              ) : paginated.map((v) => {
                const drTotal = v.lines.filter(l => l.type === "DEBIT").reduce((s, l) => s + l.amount, 0);
                const crTotal = v.lines.filter(l => l.type === "CREDIT").reduce((s, l) => s + l.amount, 0);
                return (
                  <tr key={v.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{v.voucherNo}</td>
                    <td className="px-3 py-2">{formatDate(v.date)}</td>
                    <td className="px-3 py-2">{v.member?.name || "-"}</td>
                    <td className="px-3 py-2 text-xs">
                      {v.lines.map((l, i) => (
                        <div key={i} className={l.type === "DEBIT" ? "text-green-600" : "text-blue-600"}>
                          {l.type}: {l.ledgerHead.name} — {formatCurrency(l.amount)}
                        </div>
                      ))}
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrency(drTotal)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(crTotal)}</td>
                    <td className="px-3 py-2 text-gray-500">{v.notes || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <span>Showing {filtered.length === 0 ? 0 : ((page-1)*perPage)+1} to {Math.min(page*perPage, filtered.length)} of {filtered.length} entries</span>
            <div className="flex gap-2">
              <button disabled={page<=1} onClick={() => setPage(page-1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <span className="px-3 py-1">Page {page} of {totalPages || 1}</span>
              <button disabled={page>=totalPages} onClick={() => setPage(page+1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
