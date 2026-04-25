"use client";

import { useState, useRef } from "react";
import { Upload, Download } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface UploadResult {
  total: number; success: number; failed: number;
  results: { name: string; unitNo: string; status: string }[];
}

export default function BulkUploadPage() {
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function parseCSV(text: string) {
    const lines = text.split("\n").filter(l => l.trim());
    if (lines.length < 2) { setMsg("CSV must have header row + data rows"); return; }

    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, j) => { row[h] = values[j] || ""; });
      if (row.name || row.Name) rows.push(row);
    }

    setCsvData(rows);
    setResult(null);
    setMsg(`Parsed ${rows.length} rows from CSV`);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  }

  async function handleUpload() {
    if (csvData.length === 0) { setMsg("No data to upload"); return; }
    setUploading(true);
    setMsg("");
    try {
      // Map CSV columns to API fields (case-insensitive)
      const members = csvData.map((row) => {
        const get = (keys: string[]) => {
          for (const k of keys) {
            const found = Object.keys(row).find(rk => rk.toLowerCase() === k.toLowerCase());
            if (found && row[found]) return row[found];
          }
          return "";
        };
        return {
          name: get(["name", "member name", "memberName"]),
          email: get(["email", "email id", "emailId"]),
          phone: get(["phone", "mobile", "contact", "phone no"]),
          address: get(["address"]),
          occupation: get(["occupation"]),
          unitNo: get(["unitNo", "unit no", "flat no", "flatNo", "unit"]),
          wing: get(["wing"]),
          unitType: get(["unitType", "unit type", "type"]),
          area: get(["area", "total area"]),
          carpetArea: get(["carpetArea", "carpet area", "carpet"]),
          aadhaarNo: get(["aadhaarNo", "aadhaar", "aadhar"]),
          panNo: get(["panNo", "pan"]),
          nomineeName: get(["nomineeName", "nominee name", "nominee"]),
          nomineeRelation: get(["nomineeRelation", "nominee relation"]),
          openingPrincipal: get(["openingPrincipal", "opening principal", "principal"]),
          openingInterest: get(["openingInterest", "opening interest", "interest"]),
          openingTax: get(["openingTax", "opening tax", "tax"]),
          dateOfEntry: get(["dateOfEntry", "date of entry", "entry date"]),
        };
      });

      const data = await apiFetch<UploadResult>("/api/members/bulk-upload", {
        method: "POST",
        body: JSON.stringify({ members }),
      });
      setResult(data);
      setMsg(`Upload complete: ${data.success} succeeded, ${data.failed} failed`);
      setCsvData([]);
    } catch (e) { setMsg("Error: " + (e as Error).message); }
    finally { setUploading(false); }
  }

  function downloadTemplate() {
    const headers = "name,email,phone,address,unitNo,wing,unitType,carpetArea,area,occupation,aadhaarNo,panNo,nomineeName,nomineeRelation,openingPrincipal,openingInterest,openingTax";
    const sample = "John Doe,john@example.com,9876543210,Flat 101 Building A,101,A,RESIDENTIAL,500,600,Engineer,1234-5678-9012,ABCDE1234F,Jane Doe,Wife,0,0,0";
    const blob = new Blob([headers + "\n" + sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "member_upload_template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="bg-[#1e3a5f] text-white px-6 py-3 rounded-t-xl">
        <h2 className="text-lg font-semibold text-center">Bulk Member Upload</h2>
      </div>
      <div className="p-6">
        {msg && <div className={`text-sm rounded-lg p-3 mb-4 ${msg.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>{msg}</div>}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          <p className="font-semibold mb-1">Instructions:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Download the CSV template below</li>
            <li>Fill in member details (name and unitNo are required)</li>
            <li>Upload the filled CSV file</li>
            <li>Review the parsed data and click Upload</li>
          </ol>
        </div>

        <div className="flex gap-4 justify-center mb-6">
          <button onClick={downloadTemplate} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium">
            <Download size={16} /> Download Template
          </button>
          <button onClick={() => fileRef.current?.click()} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2 font-medium">
            <Upload size={16} /> Select CSV File
          </button>
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileChange} className="hidden" />
        </div>

        {/* Preview parsed data */}
        {csvData.length > 0 && (
          <>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview ({csvData.length} rows)</h4>
            <div className="overflow-x-auto mb-4 max-h-[300px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-3 py-1.5 font-semibold text-gray-700">#</th>
                    {Object.keys(csvData[0]).slice(0, 8).map((k) => (
                      <th key={k} className="text-left px-3 py-1.5 font-semibold text-gray-700">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-3 py-1.5">{i + 1}</td>
                      {Object.keys(row).slice(0, 8).map((k) => (
                        <td key={k} className="px-3 py-1.5">{row[k] || "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center">
              <button onClick={handleUpload} disabled={uploading} className="bg-green-600 text-white px-10 py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50">
                {uploading ? "Uploading..." : `Upload ${csvData.length} Members`}
              </button>
            </div>
          </>
        )}

        {/* Upload results */}
        {result && (
          <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-xl font-bold text-blue-700">{result.total}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Success</div>
                <div className="text-xl font-bold text-green-700">{result.success}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">Failed</div>
                <div className="text-xl font-bold text-red-700">{result.failed}</div>
              </div>
            </div>
            {result.failed > 0 && (
              <div className="text-sm">
                <h5 className="font-semibold text-red-600 mb-1">Failed rows:</h5>
                {result.results.filter(r => r.status !== "success").map((r, i) => (
                  <div key={i} className="text-red-500 text-xs">{r.name} ({r.unitNo}): {r.status}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
