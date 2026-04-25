"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AddMemberPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", occupation: "",
    aadhaarNo: "", panNo: "", nomineeName: "", nomineeRelation: "",
    unitNo: "", wing: "", unitType: "RESIDENTIAL", carpetArea: "", area: "",
    dateOfEntry: new Date().toISOString().split("T")[0],
    openingPrincipal: "0", openingInterest: "0", openingTax: "0",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  async function handleSubmit() {
    if (!form.name || !form.unitNo) { setMsg("Name and Unit No. are required"); return; }
    setSaving(true);
    setMsg("");
    try {
      await apiFetch("/api/members", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          openingPrincipal: parseFloat(form.openingPrincipal) || 0,
          openingInterest: parseFloat(form.openingInterest) || 0,
          openingTax: parseFloat(form.openingTax) || 0,
          area: parseFloat(form.area) || 0,
          carpetArea: parseFloat(form.carpetArea) || 0,
        }),
      });
      setMsg("Member added successfully!");
      setForm({
        name: "", email: "", phone: "", address: "", occupation: "",
        aadhaarNo: "", panNo: "", nomineeName: "", nomineeRelation: "",
        unitNo: "", wing: "", unitType: "RESIDENTIAL", carpetArea: "", area: "",
        dateOfEntry: new Date().toISOString().split("T")[0],
        openingPrincipal: "0", openingInterest: "0", openingTax: "0",
      });
    } catch (e) { setMsg("Error: " + (e as Error).message); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 4000); }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none";

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Add Member</h2>
      </div>
      <div className="p-6 space-y-5">
        {msg && <div className={`text-sm rounded-lg p-3 ${msg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{msg}</div>}

        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-purple-700 px-2">Personal Details</legend>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Name *</label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Entry</label>
              <input type="date" value={form.dateOfEntry} onChange={(e) => update("dateOfEntry", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input type="text" value={form.occupation} onChange={(e) => update("occupation", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar No.</label>
              <input type="text" value={form.aadhaarNo} onChange={(e) => update("aadhaarNo", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN No.</label>
              <input type="text" value={form.panNo} onChange={(e) => update("panNo", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Name</label>
              <input type="text" value={form.nomineeName} onChange={(e) => update("nomineeName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Relation</label>
              <input type="text" value={form.nomineeRelation} onChange={(e) => update("nomineeRelation", e.target.value)} className={inputClass} />
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-purple-700 px-2">Unit / Flat Details</legend>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flat / Unit No. *</label>
              <input type="text" value={form.unitNo} onChange={(e) => update("unitNo", e.target.value)} className={inputClass} placeholder="e.g. 101" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wing</label>
              <input type="text" value={form.wing} onChange={(e) => update("wing", e.target.value)} className={inputClass} placeholder="e.g. A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
              <select value={form.unitType} onChange={(e) => update("unitType", e.target.value)} className={inputClass}>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carpet Area (sq ft)</label>
              <input type="number" value={form.carpetArea} onChange={(e) => update("carpetArea", e.target.value)} className={inputClass} />
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-gray-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-purple-700 px-2">Opening Balances</legend>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Op. Principal (₹)</label>
              <input type="number" value={form.openingPrincipal} onChange={(e) => update("openingPrincipal", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest (₹)</label>
              <input type="number" value={form.openingInterest} onChange={(e) => update("openingInterest", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax (₹)</label>
              <input type="number" value={form.openingTax} onChange={(e) => update("openingTax", e.target.value)} className={inputClass} />
            </div>
          </div>
        </fieldset>

        <div className="flex justify-center">
          <button onClick={handleSubmit} disabled={saving} className="bg-purple-600 text-white px-10 py-2.5 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50">
            {saving ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
