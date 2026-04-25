"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Eye, FileDown, FileSpreadsheet } from "lucide-react";
import { apiFetch, formatCurrency, formatDate } from "@/lib/api";
import { generateBillPDF } from "@/lib/pdf";
import { exportToExcel } from "@/lib/excel";

interface Unit { id: string; unitNo: string; }
interface Member { id: string; name: string; memberNo: string | null; units: Unit[]; }
interface BillItem { id: string; name: string; amount: number; }
interface Bill {
  id: string; billNo: string; date: string; month: string; dueDate: string | null;
  totalAmount: number; interestAmount: number; taxAmount: number; paidAmount: number;
  status: string; billType: string;
  member: { name: string };
  unit: { unitNo: string };
  items: BillItem[];
}

export default function AllBillsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const fetchMembers = useCallback(async () => {
    const m = await apiFetch<Member[]>("/api/members");
    setMembers(m);
  }, []);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (memberId) params.set("memberId", memberId);
    if (statusFilter) params.set("status", statusFilter);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    const data = await apiFetch<Bill[]>(`/api/bills?${params.toString()}`);
    setBills(data);
    setLoading(false);
  }, [memberId, statusFilter, fromDate, toDate]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);
  useEffect(() => { fetchBills(); }, [fetchBills]);

  function clearFilters() {
    setMemberId("");
    setFromDate("");
    setToDate("");
    setStatusFilter("");
    setSearch("");
    setPage(1);
  }

  const filtered = bills.filter(b =>
    !search || b.billNo.toLowerCase().includes(search.toLowerCase()) ||
    b.member.name.toLowerCase().includes(search.toLowerCase()) ||
    b.unit.unitNo.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const totalBilled = filtered.reduce((s, b) => s + b.totalAmount, 0);
  const totalPaid = filtered.reduce((s, b) => s + b.paidAmount, 0);
  const totalDue = totalBilled - totalPaid;

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none";

  const statusBadge = (status: string) => {
    const cls = status === "PAID" ? "bg-green-100 text-green-700" : status === "PARTIAL" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{status}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-purple-600 text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Generated Bills</h2>
      </div>
      <div className="p-6">
        {/* Filters */}
        <div className="grid grid-cols-5 gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
            <select value={memberId} onChange={(e) => { setMemberId(e.target.value); setPage(1); }} className={inputClass}>
              <option value="">All Members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name} - {m.units.map(u => u.unitNo).join(", ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={inputClass}>
              <option value="">All Bills</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={clearFilters} className="text-red-500 hover:text-red-700 p-2" title="Clear filters">
              <Trash2 size={18} />
            </button>
            <button onClick={() => {
              if (filtered.length === 0) return;
              const rows = filtered.map((b, i) => [i + 1, b.billNo, formatDate(b.date), b.unit.unitNo, b.member.name, b.month, b.totalAmount, b.paidAmount, b.status]);
              exportToExcel("All Bills", ["#", "Bill No.", "Date", "Unit", "Member", "Month", "Amount", "Paid", "Status"], rows);
            }} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-1 text-sm" title="Download Excel">
              <FileSpreadsheet size={16} /> Excel
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Total Billed</div>
            <div className="text-lg font-bold text-blue-700">{formatCurrency(totalBilled)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Total Received</div>
            <div className="text-lg font-bold text-green-700">{formatCurrency(totalPaid)}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Total Due</div>
            <div className="text-lg font-bold text-red-700">{formatCurrency(totalDue)}</div>
          </div>
        </div>

        {/* Search and per page */}
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

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-50">
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Bill No.</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Unit</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Member</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Month</th>
                  <th className="text-right px-4 py-2 font-semibold text-gray-700">Amount</th>
                  <th className="text-right px-4 py-2 font-semibold text-gray-700">Paid</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-8 text-gray-400">No bills found.</td></tr>
                ) : paginated.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{b.billNo}</td>
                    <td className="px-4 py-2">{formatDate(b.date)}</td>
                    <td className="px-4 py-2">{b.unit.unitNo}</td>
                    <td className="px-4 py-2">{b.member.name}</td>
                    <td className="px-4 py-2">{b.month}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(b.paidAmount)}</td>
                    <td className="px-4 py-2">{statusBadge(b.status)}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => setSelectedBill(b)} className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-xs font-medium">
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
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
          </>
        )}
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedBill(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-purple-200 px-6 py-3 rounded-t-xl flex justify-between items-center">
              <h3 className="text-base font-semibold text-gray-800">Bill Details — {selectedBill.billNo}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => generateBillPDF(selectedBill as Parameters<typeof generateBillPDF>[0], "Viswa CHS Ltd")} className="text-purple-700 hover:text-purple-900 flex items-center gap-1 text-sm font-medium" title="Download PDF">
                  <FileDown size={16} /> PDF
                </button>
                <button onClick={() => setSelectedBill(null)} className="text-gray-600 hover:text-gray-900 text-xl">&times;</button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div><span className="text-gray-500">Member:</span> <span className="font-medium">{selectedBill.member.name}</span></div>
                <div><span className="text-gray-500">Unit:</span> <span className="font-medium">{selectedBill.unit.unitNo}</span></div>
                <div><span className="text-gray-500">Month:</span> <span className="font-medium">{selectedBill.month}</span></div>
                <div><span className="text-gray-500">Date:</span> <span className="font-medium">{formatDate(selectedBill.date)}</span></div>
                <div><span className="text-gray-500">Status:</span> {statusBadge(selectedBill.status)}</div>
                <div><span className="text-gray-500">Type:</span> <span className="font-medium">{selectedBill.billType}</span></div>
              </div>

              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Item</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                  {selectedBill.interestAmount > 0 && (
                    <tr className="border-b">
                      <td className="px-3 py-2 text-red-600">Interest</td>
                      <td className="px-3 py-2 text-right text-red-600">{formatCurrency(selectedBill.interestAmount)}</td>
                    </tr>
                  )}
                  {selectedBill.taxAmount > 0 && (
                    <tr className="border-b">
                      <td className="px-3 py-2 text-orange-600">GST</td>
                      <td className="px-3 py-2 text-right text-orange-600">{formatCurrency(selectedBill.taxAmount)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(selectedBill.totalAmount)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-green-600">Paid</td>
                    <td className="px-3 py-2 text-right text-green-600">{formatCurrency(selectedBill.paidAmount)}</td>
                  </tr>
                  <tr className="font-semibold">
                    <td className="px-3 py-2 text-red-600">Balance Due</td>
                    <td className="px-3 py-2 text-right text-red-600">{formatCurrency(selectedBill.totalAmount - selectedBill.paidAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
