"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface SocietyData {
  name: string;
  regNo: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  financialYear: string;
  secretaryName: string;
  chairmanName: string;
  panNo: string;
  gstNo: string;
  billingFrequency: string;
  interestType: string;
  interestRate: number;
  interestMethod: string;
  applyGST: boolean;
  gstRate: number;
  gracePeriodDays: number;
  billNote: string;
  billPrefix: string;
  receiptPrefix: string;
  paymentPrefix: string;
}

const defaults: SocietyData = {
  name: "", regNo: "", address: "", city: "", state: "", pincode: "", phone: "", email: "",
  financialYear: "2024-25", secretaryName: "", chairmanName: "", panNo: "", gstNo: "",
  billingFrequency: "MONTHLY", interestType: "SIMPLE", interestRate: 21, interestMethod: "PER_DAY",
  applyGST: false, gstRate: 18, gracePeriodDays: 0, billNote: "", billPrefix: "BILL",
  receiptPrefix: "RCP", paymentPrefix: "PAY",
};

export default function InsideStoryPage() {
  const [form, setForm] = useState<SocietyData>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    apiFetch<SocietyData>("/api/society")
      .then((data) => setForm({ ...defaults, ...data }))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof SocietyData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSave() {
    setSaving(true);
    setMsg("");
    try {
      await apiFetch("/api/society", { method: "PUT", body: JSON.stringify(form) });
      setMsg("Saved successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg("Error: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none";

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Inside Story - Society Configuration</h2>
      </div>
      <div className="p-6 space-y-6">
        {msg && (
          <div className={`text-sm rounded-lg p-3 ${msg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
            {msg}
          </div>
        )}

        {/* Basic Info */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-teal-700 px-2">Society Information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Society Name *</label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration No.</label>
              <input type="text" value={form.regNo || ""} onChange={(e) => update("regNo", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
              <select value={form.financialYear} onChange={(e) => update("financialYear", e.target.value)} className={inputClass}>
                <option>2021-22</option><option>2022-23</option><option>2023-24</option><option>2024-25</option><option>2025-26</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={form.address || ""} onChange={(e) => update("address", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email || ""} onChange={(e) => update("email", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.city || ""} onChange={(e) => update("city", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input type="text" value={form.state || ""} onChange={(e) => update("state", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input type="text" value={form.pincode || ""} onChange={(e) => update("pincode", e.target.value)} className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* Officers & Tax */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-teal-700 px-2">Officers & Tax</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secretary Name</label>
              <input type="text" value={form.secretaryName || ""} onChange={(e) => update("secretaryName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chairman Name</label>
              <input type="text" value={form.chairmanName || ""} onChange={(e) => update("chairmanName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN No.</label>
              <input type="text" value={form.panNo || ""} onChange={(e) => update("panNo", e.target.value)} className={inputClass} placeholder="e.g. AAACT1234A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST No.</label>
              <input type="text" value={form.gstNo || ""} onChange={(e) => update("gstNo", e.target.value)} className={inputClass} placeholder="e.g. 27AAACT1234A1Z5" />
            </div>
          </div>
        </fieldset>

        {/* Billing & Interest */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-teal-700 px-2">Billing & Interest Configuration</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Frequency</label>
              <select value={form.billingFrequency} onChange={(e) => update("billingFrequency", e.target.value)} className={inputClass}>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="HALF_YEARLY">Half-Yearly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Type</label>
              <select value={form.interestType} onChange={(e) => update("interestType", e.target.value)} className={inputClass}>
                <option value="SIMPLE">Simple Interest</option>
                <option value="COMPOUND">Compound Interest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (% p.a.)</label>
              <input type="number" step="0.5" value={form.interestRate} onChange={(e) => update("interestRate", parseFloat(e.target.value) || 0)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Method</label>
              <select value={form.interestMethod} onChange={(e) => update("interestMethod", e.target.value)} className={inputClass}>
                <option value="PER_DAY">Per Day</option>
                <option value="PER_MONTH">Per Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (days)</label>
              <input type="number" value={form.gracePeriodDays} onChange={(e) => update("gracePeriodDays", parseInt(e.target.value) || 0)} className={inputClass} />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.applyGST} onChange={(e) => update("applyGST", e.target.checked)} className="rounded" />
                Apply GST on Interest
              </label>
              {form.applyGST && (
                <input type="number" step="0.5" value={form.gstRate} onChange={(e) => update("gstRate", parseFloat(e.target.value) || 0)} className={inputClass + " w-20"} placeholder="%" />
              )}
            </div>
          </div>
        </fieldset>

        {/* Bill Customization */}
        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-teal-700 px-2">Bill Customization</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Prefix</label>
              <input type="text" value={form.billPrefix} onChange={(e) => update("billPrefix", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Prefix</label>
              <input type="text" value={form.receiptPrefix} onChange={(e) => update("receiptPrefix", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Prefix</label>
              <input type="text" value={form.paymentPrefix} onChange={(e) => update("paymentPrefix", e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Note on Bills (festival greetings, messages, etc.)</label>
              <textarea value={form.billNote || ""} onChange={(e) => update("billNote", e.target.value)} rows={2} className={inputClass} placeholder="e.g. Happy Diwali! Wishing you prosperity." />
            </div>
          </div>
        </fieldset>

        <div className="flex justify-center">
          <button onClick={handleSave} disabled={saving} className="bg-teal-600 text-white px-10 py-2.5 rounded-lg hover:bg-teal-700 transition font-medium disabled:opacity-50">
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
