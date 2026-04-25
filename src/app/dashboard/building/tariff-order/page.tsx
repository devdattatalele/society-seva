"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";

export default function TariffOrderPage() {
  const [tariffs, setTariffs] = useState([
    { id: "1", name: "Maintenance Charges", order: 1 },
    { id: "2", name: "Sinking Fund", order: 2 },
    { id: "3", name: "Water Charges", order: 3 },
    { id: "4", name: "Parking Charges", order: 4 },
  ]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newTariffs = [...tariffs];
    [newTariffs[index - 1], newTariffs[index]] = [newTariffs[index], newTariffs[index - 1]];
    setTariffs(newTariffs);
  };

  const moveDown = (index: number) => {
    if (index === tariffs.length - 1) return;
    const newTariffs = [...tariffs];
    [newTariffs[index], newTariffs[index + 1]] = [newTariffs[index + 1], newTariffs[index]];
    setTariffs(newTariffs);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Change Tariff Order</h2>
      </div>
      <div className="p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-4 py-2 font-semibold text-gray-700 w-12"></th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Order</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Tariff Name</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tariffs.map((t, i) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-400"><GripVertical size={16} /></td>
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{t.name}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => moveUp(i)} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">↑ Up</button>
                  <button onClick={() => moveDown(i)} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">↓ Down</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-center">
          <button className="bg-teal-600 text-white px-8 py-2 rounded-lg hover:bg-teal-700 transition font-medium">
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
}
