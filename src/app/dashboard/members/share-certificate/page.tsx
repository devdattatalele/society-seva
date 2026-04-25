"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";

interface Unit { id: string; unitNo: string; }
interface Member { id: string; name: string; memberNo: string | null; units: Unit[]; }
interface ShareCert {
  id: string; serialNo: string; certificateNo: string | null; date: string;
  numberOfShares: number; valueOfShare: number; regNoOfTransferor: string | null;
  dateOfPaymentEntrance: string | null; membershipCessationDate: string | null;
  cessationReason: string | null; remark: string | null;
  member: { name: string };
}

export default function ShareCertificatePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [certs, setCerts] = useState<ShareCert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    memberId: "", serialNo: "", remark: "",
    date: new Date().toISOString().split("T")[0],
    certificateNo: "", numberOfShares: "1", regNoOfTransferor: "",
    valueOfShare: "", dateOfPaymentEntrance: "", membershipCessationDate: "", cessationReason: "",
  });

  const fetchData = useCallback(async () => {
    const [m, c] = await Promise.all([
      apiFetch<Member[]>("/api/members"),
      apiFetch<ShareCert[]>("/api/share-certificates"),
    ]);
    setMembers(m);
    setCerts(c);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSubmit() {
    if (!form.memberId || !form.serialNo) { setMsg("Member and Serial No. are required"); return; }
    setSaving(true);
    setMsg("");
    try {
      await apiFetch("/api/share-certificates", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          numberOfShares: parseInt(form.numberOfShares) || 1,
          valueOfShare: parseFloat(form.valueOfShare) || 0,
        }),
      });
      setMsg("Share certificate issued successfully!");
      setForm({
        memberId: "", serialNo: "", remark: "",
        date: new Date().toISOString().split("T")[0],
        certificateNo: "", numberOfShares: "1", regNoOfTransferor: "",
        valueOfShare: "", dateOfPaymentEntrance: "", membershipCessationDate: "", cessationReason: "",
      });
      fetchData();
    } catch (e) { setMsg("Error: " + (e as Error).message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 4000); }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none";

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Share Certificate</h2>
      </div>
      <div className="p-6">
        {msg && <div className={`text-sm rounded-lg p-3 mb-4 ${msg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{msg}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Name *</label>
            <select value={form.memberId} onChange={(e) => setForm({...form, memberId: e.target.value})} className={inputClass}>
              <option value="">Choose Member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name} - {m.units.map(u => u.unitNo).join(", ") || "No unit"}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serial No. *</label>
            <input type="text" value={form.serialNo} onChange={(e) => setForm({...form, serialNo: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
            <select value={form.remark} onChange={(e) => setForm({...form, remark: e.target.value})} className={inputClass}>
              <option value="">Select Remark</option>
              <option value="New Issue">New Issue</option>
              <option value="Transfer">Transfer</option>
              <option value="Duplicate">Duplicate</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Share Certificate No.</label>
            <input type="text" value={form.certificateNo} onChange={(e) => setForm({...form, certificateNo: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number Of Shares</label>
            <input type="number" value={form.numberOfShares} onChange={(e) => setForm({...form, numberOfShares: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reg No Of Transferor</label>
            <input type="text" value={form.regNoOfTransferor} onChange={(e) => setForm({...form, regNoOfTransferor: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value Of Share (₹)</label>
            <input type="number" value={form.valueOfShare} onChange={(e) => setForm({...form, valueOfShare: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Of Payment Entrance Fee</label>
            <input type="date" value={form.dateOfPaymentEntrance} onChange={(e) => setForm({...form, dateOfPaymentEntrance: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Membership Cessation Date</label>
            <input type="date" value={form.membershipCessationDate} onChange={(e) => setForm({...form, membershipCessationDate: e.target.value})} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason For Membership Cessation</label>
            <input type="text" value={form.cessationReason} onChange={(e) => setForm({...form, cessationReason: e.target.value})} className={inputClass} />
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button onClick={handleSubmit} disabled={saving} className="bg-teal-600 text-white px-8 py-2.5 rounded-lg hover:bg-teal-700 transition font-medium disabled:opacity-50">
            {saving ? "Saving..." : "Submit"}
          </button>
        </div>

        {/* Certificates Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-3 py-2 font-semibold text-gray-700">#</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Member</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Serial No</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Date</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Cert. No</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-700">Shares</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-700">Value</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Remark</th>
              </tr>
            </thead>
            <tbody>
              {certs.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No share certificates issued yet.</td></tr>
              ) : certs.map((c, i) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{c.member.name}</td>
                  <td className="px-3 py-2">{c.serialNo}</td>
                  <td className="px-3 py-2">{formatDate(c.date)}</td>
                  <td className="px-3 py-2">{c.certificateNo || "-"}</td>
                  <td className="px-3 py-2 text-right">{c.numberOfShares}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(c.valueOfShare)}</td>
                  <td className="px-3 py-2">{c.remark || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
