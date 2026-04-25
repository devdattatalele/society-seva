"use client";

import { useState } from "react";

export default function ParametersPage() {
  const [params, setParams] = useState({
    interestRate: "",
    interestType: "Simple",
    gracePeriod: "",
    billPrefix: "",
    receiptPrefix: "",
    paymentPrefix: "",
  });

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Parameters</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
            <input type="number" value={params.interestRate} onChange={(e) => setParams({...params, interestRate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Type</label>
            <select value={params.interestType} onChange={(e) => setParams({...params, interestType: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none">
              <option>Simple</option>
              <option>Compound</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (days)</label>
            <input type="number" value={params.gracePeriod} onChange={(e) => setParams({...params, gracePeriod: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bill Prefix</label>
            <input type="text" value={params.billPrefix} onChange={(e) => setParams({...params, billPrefix: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" placeholder="e.g. BILL-" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Prefix</label>
            <input type="text" value={params.receiptPrefix} onChange={(e) => setParams({...params, receiptPrefix: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" placeholder="e.g. RCP-" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Prefix</label>
            <input type="text" value={params.paymentPrefix} onChange={(e) => setParams({...params, paymentPrefix: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" placeholder="e.g. PAY-" />
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button className="bg-teal-600 text-white px-8 py-2 rounded-lg hover:bg-teal-700 transition font-medium">
            Save Parameters
          </button>
        </div>
      </div>
    </div>
  );
}
