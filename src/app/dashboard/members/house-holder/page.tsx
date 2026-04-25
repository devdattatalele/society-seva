"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Eye, X } from "lucide-react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";

interface Unit { id: string; unitNo: string; type: string; area: number | null; carpetArea: number | null; floor: number | null; }
interface Member {
  id: string; memberNo: string | null; name: string; email: string | null; phone: string | null;
  openingPrincipal: number; openingInterest: number; openingTax: number; units: Unit[];
  dateOfEntry: string;
}
interface LedgerEntry { date: string; particular: string; billAmount: number; receipt: number; balance: number; }

export default function HouseHolderPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  // Flat Details modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);

  const fetchData = useCallback(async () => {
    const data = await apiFetch<Member[]>("/api/members");
    setMembers(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function openFlatDetails(member: Member) {
    setSelectedMember(member);
    setLoadingLedger(true);
    try {
      const entries = await apiFetch<LedgerEntry[]>(`/api/reports/member-ledger?memberId=${member.id}`);
      setLedgerEntries(entries);
    } catch { setLedgerEntries([]); }
    finally { setLoadingLedger(false); }
  }

  const filtered = members.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) ||
           m.units.some(u => u.unitNo.toLowerCase().includes(search.toLowerCase())) ||
           m.memberNo?.includes(search)
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">House Holder</h2>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-sm">
            Show{" "}
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1">
              <option>10</option><option>25</option><option>50</option>
            </select>{" "}entries
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-4 py-2 font-semibold text-gray-700">#</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Unit No.</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Member Name</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Phone</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Email</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Member No.</th>
              <th className="text-left px-4 py-2 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No members found.</td></tr>
            ) : paginated.map((m, i) => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{(page - 1) * perPage + i + 1}</td>
                <td className="px-4 py-2 font-medium">{m.units.map(u => u.unitNo).join(", ") || "-"}</td>
                <td className="px-4 py-2">{m.name}</td>
                <td className="px-4 py-2">{m.phone || "-"}</td>
                <td className="px-4 py-2">{m.email || "-"}</td>
                <td className="px-4 py-2">{m.memberNo || "-"}</td>
                <td className="px-4 py-2">
                  <button onClick={() => openFlatDetails(m)} className="text-teal-600 hover:text-teal-700 flex items-center gap-1 text-xs font-medium">
                    <Eye size={14} /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <span>Showing {((page-1)*perPage)+1} to {Math.min(page*perPage, filtered.length)} of {filtered.length} entries</span>
          <div className="flex gap-2">
            <button disabled={page<=1} onClick={() => setPage(page-1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <span className="px-3 py-1">Page {page} of {totalPages || 1}</span>
            <button disabled={page>=totalPages} onClick={() => setPage(page+1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Flat Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedMember(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-200 px-6 py-3 rounded-t-xl flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-800">Flat Details</h3>
              <button onClick={() => setSelectedMember(null)} className="text-gray-600 hover:text-gray-900"><X size={20} /></button>
            </div>
            <div className="p-6">
              {/* Member info card */}
              <div className="flex gap-6 mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-teal-600">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <p className="mt-2 font-semibold text-sm">{selectedMember.name}</p>
                  <div className="mt-1 bg-slate-500 text-white rounded-full px-4 py-1 text-xs font-medium">
                    {selectedMember.units[0]?.unitNo || "-"}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Information</h4>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div><span className="text-gray-500 block">Area</span><span className="font-medium">{selectedMember.units[0]?.area || 0}</span></div>
                    <div><span className="text-gray-500 block">Commercial</span><span className="font-medium">{selectedMember.units[0]?.type === "COMMERCIAL" ? 1 : 0}</span></div>
                    <div><span className="text-gray-500 block">Carpet</span><span className="font-medium">{selectedMember.units[0]?.carpetArea || 0}</span></div>
                    <div><span className="text-gray-500 block">Floor</span><span className="font-medium">{selectedMember.units[0]?.floor || 0}</span></div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-xs mt-3">
                    <div><span className="text-gray-500 block">Op.Principal</span><span className="font-medium">{selectedMember.openingPrincipal.toFixed(2)}</span></div>
                    <div><span className="text-gray-500 block">Interest</span><span className="font-medium">{selectedMember.openingInterest.toFixed(2)}</span></div>
                    <div><span className="text-gray-500 block">Tax</span><span className="font-medium">{selectedMember.openingTax.toFixed(2)}</span></div>
                    <div><span className="text-gray-500 block">Member No</span><span className="font-medium">{selectedMember.memberNo || "-"}</span></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                    <div><span className="text-gray-500 block">Unit Type</span><span className="font-medium">{selectedMember.units[0]?.type || "Residential"}</span></div>
                    <div><span className="text-gray-500 block">Contact No</span><span className="font-medium">{selectedMember.phone || "-"}</span></div>
                    <div><span className="text-gray-500 block">Email Id</span><span className="font-medium">{selectedMember.email || "-"}</span></div>
                  </div>
                </div>
              </div>

              {/* Member ledger */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Date</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Particular</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-700">Dr. Amount</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-700">Cr. Amount</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-700">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Show opening balance row if any */}
                  {(selectedMember.openingPrincipal > 0) && (
                    <tr className="border-b">
                      <td className="px-3 py-2">{formatDate(selectedMember.dateOfEntry)}</td>
                      <td className="px-3 py-2 text-blue-600">Opening Balance</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(selectedMember.openingPrincipal + selectedMember.openingInterest + selectedMember.openingTax)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(0)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(selectedMember.openingPrincipal + selectedMember.openingInterest + selectedMember.openingTax)} Dr</td>
                    </tr>
                  )}
                  {loadingLedger ? (
                    <tr><td colSpan={5} className="text-center py-4 text-gray-400">Loading...</td></tr>
                  ) : ledgerEntries.length === 0 && selectedMember.openingPrincipal === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-gray-400">No transactions yet.</td></tr>
                  ) : ledgerEntries.map((e, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{formatDate(e.date)}</td>
                      <td className="px-3 py-2">{e.particular}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(e.billAmount)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(e.receipt)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(Math.abs(e.balance))} {e.balance >= 0 ? "Dr" : "Cr"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
