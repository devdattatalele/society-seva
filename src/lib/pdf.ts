import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BillItem {
  name: string;
  amount: number;
}

interface BillMember {
  name: string;
}

interface BillUnit {
  unitNo: string;
}

export interface Bill {
  billNo: string;
  date: string | Date;
  dueDate: string | Date;
  month: string;
  member: BillMember;
  unit: BillUnit;
  items: BillItem[];
  interestAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
}

interface ReceiptBill {
  billNo: string;
  month: string;
}

export interface Receipt {
  receiptNo: string;
  date: string | Date;
  amount: number;
  paymentMode: string;
  chequeNo?: string;
  bankName?: string;
  notes?: string;
  member: { name: string };
  bill?: ReceiptBill;
}

export interface ReportOptions {
  subtitle?: string;
  totals?: (string | number)[];
  landscape?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRIMARY_COLOR: [number, number, number] = [30, 58, 138]; // indigo-900
const HEADER_BG: [number, number, number] = [239, 246, 255]; // blue-50
const BORDER_COLOR: [number, number, number] = [209, 213, 219]; // gray-300
const TEXT_DARK: [number, number, number] = [17, 24, 39]; // gray-900
const TEXT_MUTED: [number, number, number] = [107, 114, 128]; // gray-500
const CURRENCY_FORMAT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtCurrency(amount: number): string {
  return CURRENCY_FORMAT.format(amount);
}

function fmtDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}

// ---------------------------------------------------------------------------
// numberToWords  (Indian English, up to 99,99,99,999 i.e. ~100 crores)
// ---------------------------------------------------------------------------

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigitWords(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return TENS[t] + (o ? " " + ONES[o] : "");
}

function threeDigitWords(n: number): string {
  if (n === 0) return "";
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let result = "";
  if (h > 0) result += ONES[h] + " Hundred";
  if (rest > 0) result += (h > 0 ? " and " : "") + twoDigitWords(rest);
  return result;
}

export function numberToWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";

  const isNegative = num < 0;
  num = Math.abs(num);

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let words = "";

  if (rupees === 0) {
    words = "Zero";
  } else {
    // Indian grouping: last 3 digits, then groups of 2
    const crores = Math.floor(rupees / 10000000);
    const lakhs = Math.floor((rupees % 10000000) / 100000);
    const thousands = Math.floor((rupees % 100000) / 1000);
    const hundreds = rupees % 1000;

    const parts: string[] = [];
    if (crores > 0) parts.push(twoDigitWords(crores) + " Crore");
    if (lakhs > 0) parts.push(twoDigitWords(lakhs) + " Lakh");
    if (thousands > 0) parts.push(twoDigitWords(thousands) + " Thousand");
    if (hundreds > 0) parts.push(threeDigitWords(hundreds));
    words = parts.join(" ");
  }

  let result = (isNegative ? "Minus " : "") + words + " Rupees";

  if (paise > 0) {
    result += " and " + twoDigitWords(paise) + " Paise";
  }

  return result + " Only";
}

// ---------------------------------------------------------------------------
// generateBillPDF
// ---------------------------------------------------------------------------

export function generateBillPDF(bill: Bill, societyName: string): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = 20;

  // --- Header ---
  doc.setFontSize(18);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFont("helvetica", "bold");
  doc.text(societyName, pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(...TEXT_MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Maintenance Bill", pageWidth / 2, y, { align: "center" });
  y += 4;

  // Divider
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // --- Bill Details ---
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_DARK);

  const leftX = 16;
  const rightX = pageWidth - 16;
  const lineHeight = 6;

  const details: [string, string, string, string][] = [
    ["Bill No:", bill.billNo, "Date:", fmtDate(bill.date)],
    ["Member:", bill.member.name, "Due Date:", fmtDate(bill.dueDate)],
    ["Unit:", bill.unit.unitNo, "Month:", bill.month],
  ];

  for (const [lLabel, lVal, rLabel, rVal] of details) {
    doc.setFont("helvetica", "bold");
    doc.text(lLabel, leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(lVal, leftX + 24, y);

    doc.setFont("helvetica", "bold");
    doc.text(rLabel, rightX - 60, y);
    doc.setFont("helvetica", "normal");
    doc.text(rVal, rightX - 32, y);

    y += lineHeight;
  }

  y += 4;

  // --- Items Table ---
  const tableBody: (string | number)[][] = bill.items.map((item, idx) => [
    idx + 1,
    item.name,
    fmtCurrency(item.amount),
  ]);

  if (bill.interestAmount > 0) {
    tableBody.push(["", "Interest", fmtCurrency(bill.interestAmount)]);
  }
  if (bill.taxAmount > 0) {
    tableBody.push(["", "Tax", fmtCurrency(bill.taxAmount)]);
  }

  autoTable(doc, {
    startY: y,
    head: [["#", "Description", "Amount"]],
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: TEXT_DARK,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 40, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;

  // --- Summary ---
  const summaryX = pageWidth - 14;
  const balanceDue = bill.totalAmount - bill.paidAmount;

  const summaryLines: [string, string][] = [
    ["Total Amount:", fmtCurrency(bill.totalAmount)],
    ["Paid Amount:", fmtCurrency(bill.paidAmount)],
    ["Balance Due:", fmtCurrency(balanceDue)],
  ];

  for (const [label, value] of summaryLines) {
    const isBold = label === "Balance Due:";
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(isBold ? 11 : 10);
    doc.setTextColor(...(isBold ? PRIMARY_COLOR : TEXT_DARK));
    doc.text(label, summaryX - 55, y);
    doc.text(value, summaryX, y, { align: "right" });
    y += lineHeight;
  }

  y += 4;

  // --- Status Badge ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const statusUpper = bill.status.toUpperCase();
  const statusColor: [number, number, number] =
    statusUpper === "PAID"
      ? [22, 163, 74]
      : statusUpper === "OVERDUE"
        ? [220, 38, 38]
        : [234, 179, 8];
  doc.setTextColor(...statusColor);
  doc.text(`Status: ${statusUpper}`, leftX, y);

  y += 10;

  // --- Footer Note ---
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This is a computer-generated document. No signature is required.",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  downloadPDF(doc, `Bill-${bill.billNo}.pdf`);
}

// ---------------------------------------------------------------------------
// generateReceiptPDF
// ---------------------------------------------------------------------------

export function generateReceiptPDF(
  receipt: Receipt,
  societyName: string
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = 20;

  // --- Header ---
  doc.setFontSize(18);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFont("helvetica", "bold");
  doc.text(societyName, pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(...TEXT_MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Payment Receipt", pageWidth / 2, y, { align: "center" });
  y += 4;

  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // --- Receipt Details ---
  const leftX = 16;
  const lineHeight = 7;

  doc.setFontSize(10);
  doc.setTextColor(...TEXT_DARK);

  const addField = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, leftX, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, leftX + 40, y);
    y += lineHeight;
  };

  addField("Receipt No:", receipt.receiptNo);
  addField("Date:", fmtDate(receipt.date));
  addField("Received From:", receipt.member.name);
  y += 2;

  // --- Amount Box ---
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setFillColor(...HEADER_BG);
  doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, "FD");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text("Amount: " + fmtCurrency(receipt.amount), leftX + 4, y + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...TEXT_MUTED);
  const amountWords = numberToWords(receipt.amount);
  // Wrap long text
  const wrappedWords = doc.splitTextToSize(amountWords, pageWidth - 42);
  doc.text(wrappedWords, leftX + 4, y + 14);
  y += 26;

  // --- Payment Details ---
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_DARK);

  addField("Payment Mode:", receipt.paymentMode);

  if (
    receipt.chequeNo &&
    receipt.paymentMode.toLowerCase().includes("cheque")
  ) {
    addField("Cheque No:", receipt.chequeNo);
  }
  if (
    receipt.bankName &&
    receipt.paymentMode.toLowerCase().includes("cheque")
  ) {
    addField("Bank Name:", receipt.bankName);
  }

  if (receipt.bill) {
    y += 2;
    addField("Against Bill:", receipt.bill.billNo);
    addField("Bill Month:", receipt.bill.month);
  }

  if (receipt.notes) {
    y += 2;
    addField("Notes:", receipt.notes);
  }

  y += 10;

  // --- Footer ---
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.3);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This is a computer-generated receipt. No signature is required.",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  downloadPDF(doc, `Receipt-${receipt.receiptNo}.pdf`);
}

// ---------------------------------------------------------------------------
// generateReportPDF
// ---------------------------------------------------------------------------

export function generateReportPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  options?: ReportOptions
): void {
  const orientation = options?.landscape ? "landscape" : "portrait";
  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: orientation as "portrait" | "landscape",
  });
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = 18;

  // --- Title ---
  doc.setFontSize(16);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, y, { align: "center" });
  y += 7;

  // --- Subtitle ---
  if (options?.subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_MUTED);
    doc.setFont("helvetica", "normal");
    doc.text(options.subtitle, pageWidth / 2, y, { align: "center" });
    y += 6;
  }

  y += 2;

  // --- Build table body, including totals row ---
  const tableBody: (string | number)[][] = rows.length > 0 ? rows : [[]];

  autoTable(doc, {
    startY: y,
    head: [headers],
    body: tableBody,
    foot: options?.totals ? [options.totals] : undefined,
    theme: "striped",
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: TEXT_DARK,
    },
    footStyles: {
      fillColor: [229, 231, 235], // gray-200
      textColor: TEXT_DARK,
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    margin: { left: 14, right: 14 },
    styles: {
      cellPadding: 3,
      lineColor: BORDER_COLOR,
      lineWidth: 0.2,
    },
    didDrawPage: (data) => {
      // Page numbers in footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(...TEXT_MUTED);
      doc.setFont("helvetica", "normal");
      const pageNum = doc.getCurrentPageInfo().pageNumber;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalPages = (doc as any).getNumberOfPages();
      doc.text(
        `Page ${pageNum} of ${totalPages}`,
        data.settings.margin.left,
        pageHeight - 10
      );
      doc.text(
        `Generated on ${fmtDate(new Date())}`,
        pageWidth - data.settings.margin.right,
        pageHeight - 10,
        { align: "right" }
      );
    },
  });

  // Sanitize filename
  const safeTitle = title.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
  downloadPDF(doc, `${safeTitle || "Report"}.pdf`);
}
