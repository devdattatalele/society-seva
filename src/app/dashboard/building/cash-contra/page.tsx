"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch, formatCurrency } from "@/lib/api";

interface BankAccount { id: string; bankName: string; accountNo: string; }

export default function CashContraPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    from: "CASH", to: "BANK", bankAccountId: "", amount: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchAccounts = useCallback(async () => {
    const data = await apiFetch<BankAccount[]>("/api/bank-accounts");
    setBankAccounts(data);
    if (data.length > 0) setForm(f => ({ ...f, bankAccountId: data[0].id }));
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  async function handleSubmit() {
    if (!form.amount || parseFloat(form.amount) <= 0) { setMsg("Amount is required"); return; }
    if (form.from === form.to) { setMsg("From and To must be different"); return; }
    setSaving(true);
    setMsg("");
    try {
      const amt = parseFloat(form.amount);
      const particular = `Cash Contra: ${form.from} → ${form.to}${form.notes ? ` (${form.notes})` : ""}`;

      // Create cash entry (payment if cash→bank, receipt if bank→cash)
      await apiFetch("/api/cash-entries", {
        method: "POST",
        body: JSON.stringify({
          date: form.date,
          particular,
          type: "contra",
          receipt: form.from === "BANK" ? String(amt) : "0",
          payment: form.from === "CASH" ? String(amt) : "0",
        }),
      });

      setMsg(`Cash contra of ${formatCurrency(amt)} recorded: ${form.from} → ${form.to}`);
      setForm(f => ({ ...f, amount: "", notes: "" }));
    } catch (e) { setMsg("Error: " + (e as Error).message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 4000); }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none";

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Cash Contra</h2>
      </div>
      <div className="p-6">
        {msg && <div className={`text-sm rounded-lg p-3 mb-4 ${msg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{msg}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <select value={form.from} onChange={(e) => setForm({...form, from: e.target.value})} className={inputClass}>
              <option value="CASH">Cash</option>
              <option value="BANK">Bank</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <select value={form.to} onChange={(e) => setForm({...form, to: e.target.value})} className={inputClass}>
              <option value="BANK">Bank</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          {(form.from === "BANK" || form.to === "BANK") && bankAccounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
              <select value={form.bankAccountId} onChange={(e) => setForm({...form, bankAccountId: e.target.value})} className={inputClass}>
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>{b.bankName} - {b.accountNo}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className={inputClass} />
          </div>
          <div className={bankAccounts.length > 0 ? "" : "col-span-2"}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className={inputClass} />
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button onClick={handleSubmit} disabled={saving} className="bg-teal-600 text-white px-8 py-2.5 rounded-lg hover:bg-teal-700 transition font-medium disabled:opacity-50">
            {saving ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
