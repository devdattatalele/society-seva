"use client";

import { useState, useEffect, useCallback } from "react";
import { FileDown, Mail } from "lucide-react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";
import { generateReceiptPDF } from "@/lib/pdf";

interface Unit { id: string; unitNo: string; }
interface Member { id: string; name: string; memberNo: string | null; units: Unit[]; }
interface Bill { id: string; billNo: string; month: string; totalAmount: number; paidAmount: number; status: string; }
interface Receipt {
  id: string; receiptNo: string; date: string; amount: number;
  paymentMode: string; chequeNo: string | null; bankName: string | null; notes: string | null;
  member: { name: string; units?: Unit[] };
  bill: { billNo: string; month: string } | null;
}

export default function ReceiptEntryPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    memberId: "", billId: "", amount: "",
    paymentMode: "CASH", chequeNo: "", bankName: "", notes: "",
  });

  const fetchData = useCallback(async () => {
    const [m, r] = await Promise.all([
      apiFetch<Member[]>("/api/members"),
      apiFetch<Receipt[]>("/api/receipts"),
    ]);
    setMembers(m);
    setReceipts(r);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // When member changes, fetch their unpaid bills
  async function onMemberChange(memberId: string) {
    setForm({ ...form, memberId, billId: "", amount: "" });
    setUnpaidBills([]);
    if (!memberId) return;
    try {
      const bills = await apiFetch<Bill[]>(`/api/bills?memberId=${memberId}`);
      setUnpaidBills(bills.filter(b => b.status !== "PAID"));
    } catch { setUnpaidBills([]); }
  }

  // When bill changes, auto-fill remaining amount
  function onBillChange(billId: string) {
    const bill = unpaidBills.find(b => b.id === billId);
    const remaining = bill ? (bill.totalAmount - bill.paidAmount) : "";
    setForm({ ...form, billId, amount: remaining ? String(remaining) : "" });
  }

  async function handleSubmit() {
    if (!form.memberId || !form.amount) { setMsg("Member and amount are required"); return; }
    setSaving(true);
    setMsg("");
    try {
      await apiFetch("/api/receipts", {
        method: "POST",
        body: JSON.stringify({
          memberId: form.memberId,
          billId: form.billId || null,
          amount: form.amount,
          paymentMode: form.paymentMode,
          chequeNo: form.chequeNo || null,
          bankName: form.bankName || null,
          notes: form.notes || null,
          date: form.date,
        }),
      });
      setMsg("Receipt created successfully!");
      setForm({ date: new Date().toISOString().split("T")[0], memberId: "", billId: "", amount: "", paymentMode: "CASH", chequeNo: "", bankName: "", notes: "" });
      setUnpaidBills([]);
      fetchData();
    } catch (e) { setMsg("Error: " + (e as Error).message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 4000); }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none";

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Receipt Entry</h2>
      </div>
      <div className="p-6">
        {msg && <div className={`text-sm rounded-lg p-3 mb-4 ${msg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{msg}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member *</label>
            <select value={form.memberId} onChange={(e) => onMemberChange(e.target.value)} className={inputClass}>
              <option value="">Choose Member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name} - {m.units.map(u => u.unitNo).join(", ") || "No unit"}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Against Bill</label>
            <select value={form.billId} onChange={(e) => onBillChange(e.target.value)} className={inputClass}>
              <option value="">General Receipt (no bill)</option>
              {unpaidBills.map((b) => (
                <option key={b.id} value={b.id}>{b.billNo} - {b.month} (Due: {formatCurrency(b.totalAmount - b.paidAmount)})</option>
              ))}
            </select>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cheque No.</label>
            <input type="text" value={form.chequeNo} onChange={(e) => setForm({...form, chequeNo: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input type="text" value={form.bankName} onChange={(e) => setForm({...form, bankName: e.target.value})} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className={inputClass} />
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button onClick={handleSubmit} disabled={saving} className="bg-teal-600 text-white px-8 py-2.5 rounded-lg hover:bg-teal-700 transition font-medium disabled:opacity-50">
            {saving ? "Saving..." : "Submit Receipt"}
          </button>
        </div>

        {/* Receipts History */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Receipts</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Receipt No.</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Member</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Bill</th>
                <th className="text-right px-4 py-2 font-semibold text-gray-700">Amount</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Mode</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No receipts recorded yet.</td></tr>
              ) : receipts.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{r.receiptNo}</td>
                  <td className="px-4 py-2">{formatDate(r.date)}</td>
                  <td className="px-4 py-2">{r.member.name}</td>
                  <td className="px-4 py-2">{r.bill ? `${r.bill.billNo} (${r.bill.month})` : "-"}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(r.amount)}</td>
                  <td className="px-4 py-2"><span className="px-2 py-0.5 rounded text-xs bg-gray-100">{r.paymentMode}</span></td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button onClick={() => generateReceiptPDF({ ...r, chequeNo: r.chequeNo || undefined, bankName: r.bankName || undefined, notes: r.notes || undefined, bill: r.bill || undefined }, "Viswa CHS Ltd")} className="text-teal-600 hover:text-teal-700" title="Download PDF"><FileDown size={14} /></button>
                      <button onClick={async () => {
                        try {
                          await apiFetch("/api/email/send", { method: "POST", body: JSON.stringify({ type: "receipt", data: { member: { name: r.member.name, email: "" }, receipt: { receiptNo: r.receiptNo, date: r.date, amount: r.amount, paymentMode: r.paymentMode, billMonth: r.bill?.month || "" }, societyName: "Viswa CHS Ltd" } }) });
                          alert("Email sent!");
                        } catch (e) { alert("Email failed: " + (e as Error).message); }
                      }} className="text-blue-600 hover:text-blue-800" title="Email Receipt"><Mail size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {receipts.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="px-4 py-2 text-right">Total:</td>

                  <td className="px-4 py-2 text-right">{formatCurrency(receipts.reduce((s, r) => s + r.amount, 0))}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
