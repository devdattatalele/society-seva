"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";

interface Payment {
  id: string; voucherNo: string; date: string; amount: number;
  payee: string; description: string | null; paymentMode: string; chequeNo: string | null;
}

export default function PaymentsPage() {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0], voucherNo: "", payee: "",
    amount: "", description: "", paymentMode: "CASH", chequeNo: "",
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchData = useCallback(async () => {
    const data = await apiFetch<Payment[]>("/api/payments");
    setPayments(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSubmit() {
    if (!form.payee || !form.amount) { setMsg("Payee and amount required"); return; }
    setSaving(true);
    try {
      await apiFetch("/api/payments", { method: "POST", body: JSON.stringify(form) });
      setForm({ date: new Date().toISOString().split("T")[0], voucherNo: "", payee: "", amount: "", description: "", paymentMode: "CASH", chequeNo: "" });
      setMsg("Payment recorded successfully!");
      fetchData();
    } catch (e) { setMsg("Error: " + (e as Error).message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  }

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none";

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Payments</h2>
      </div>
      <div className="p-6">
        {msg && <div className={`text-sm rounded-lg p-3 mb-4 ${msg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{msg}</div>}

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voucher No.</label>
            <input type="text" value={form.voucherNo} onChange={(e) => setForm({...form, voucherNo: e.target.value})} className={inputClass} placeholder="Auto-generated if empty" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payee *</label>
            <input type="text" value={form.payee} onChange={(e) => setForm({...form, payee: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <select value={form.paymentMode} onChange={(e) => setForm({...form, paymentMode: e.target.value})} className={inputClass}>
              <option value="CASH">Cash</option><option value="CHEQUE">Cheque</option>
              <option value="BANK_TRANSFER">Bank Transfer</option><option value="ONLINE">Online</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cheque No.</label>
            <input type="text" value={form.chequeNo} onChange={(e) => setForm({...form, chequeNo: e.target.value})} className={inputClass} />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={2} className={inputClass} />
          </div>
        </div>
        <div className="flex justify-center mb-6">
          <button onClick={handleSubmit} disabled={saving} className="bg-purple-600 text-white px-8 py-2 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50">
            {saving ? "Saving..." : "Submit Payment"}
          </button>
        </div>

        {/* Payments Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-purple-50">
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Voucher No.</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Payee</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Description</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-700">Amount</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Mode</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No payments recorded yet.</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{formatDate(p.date)}</td>
                <td className="px-4 py-2">{p.voucherNo}</td>
                <td className="px-4 py-2">{p.payee}</td>
                <td className="px-4 py-2">{p.description || "-"}</td>
                <td className="px-4 py-2 text-right font-medium">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-2"><span className="px-2 py-0.5 rounded text-xs bg-gray-100">{p.paymentMode}</span></td>
              </tr>
            ))}
          </tbody>
          {payments.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
                <td className="px-4 py-2 text-right">{formatCurrency(totalPaid)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
