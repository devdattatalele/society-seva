import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SheetData {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute column widths based on header and cell content lengths.
 * Returns an array of `wch` (width in characters) objects for XLSX.
 */
function computeColumnWidths(
  headers: string[],
  rows: (string | number)[][]
): XLSX.ColInfo[] {
  const widths = headers.map((h) => Math.min(h.length + 2, 40));

  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      const cellLen = String(row[i] ?? "").length + 2;
      if (widths[i] === undefined) {
        widths[i] = cellLen;
      } else {
        widths[i] = Math.min(Math.max(widths[i], cellLen), 50);
      }
    }
  }

  return widths.map((w) => ({ wch: w }));
}

/**
 * Build a worksheet from headers + rows with a title row on top.
 */
function buildSheet(
  title: string,
  headers: string[],
  rows: (string | number)[][]
): XLSX.WorkSheet {
  // Row 0 = title, Row 1 = headers, Row 2+ = data
  const sheetData: (string | number)[][] = [
    [title, ...Array<string>(Math.max(headers.length - 1, 0)).fill("")],
    headers,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Merge title across all header columns
  if (headers.length > 1) {
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push({
      s: { r: 0, c: 0 },
      e: { r: 0, c: headers.length - 1 },
    });
  }

  // Auto-column widths (computed from headers + data, ignoring title row)
  ws["!cols"] = computeColumnWidths(headers, rows);

  return ws;
}

/**
 * Trigger a browser download of the workbook.
 */
function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void {
  const safeName = filename.replace(/[^a-zA-Z0-9_\- ]/g, "").trim() || "Export";
  const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbOut], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}.xlsx`;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Export a single sheet to an Excel file and trigger download.
 *
 * @param title    - Sheet name and title row text
 * @param headers  - Column headers
 * @param rows     - Data rows
 * @param filename - Download filename (without extension). Defaults to `title`.
 */
export function exportToExcel(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename?: string
): void {
  const wb = XLSX.utils.book_new();
  const sheetName = title.substring(0, 31); // Excel sheet names max 31 chars
  const ws = buildSheet(title, headers, rows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  downloadWorkbook(wb, filename ?? title);
}

/**
 * Export multiple sheets to a single Excel file and trigger download.
 *
 * @param sheets   - Array of sheet definitions
 * @param filename - Download filename (without extension)
 */
export function exportMultiSheetExcel(
  sheets: SheetData[],
  filename: string
): void {
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const sheetName = sheet.name.substring(0, 31);
    const ws = buildSheet(sheet.name, sheet.headers, sheet.rows);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  downloadWorkbook(wb, filename);
}
