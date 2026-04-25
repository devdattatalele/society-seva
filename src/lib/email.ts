import * as nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EmailMember {
  name: string;
  email: string;
}

interface BillItem {
  name: string;
  amount: number;
}

interface BillData {
  billNo: string;
  month: string;
  totalAmount: number;
  dueDate: string;
  items: BillItem[];
}

interface ReceiptData {
  receiptNo: string;
  date: string;
  amount: number;
  paymentMode: string;
  billMonth: string;
}

interface OutstandingBill {
  billNo: string;
  month: string;
  totalAmount: number;
  paidAmount: number;
}

// ---------------------------------------------------------------------------
// Transporter
// ---------------------------------------------------------------------------

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "Society Seva <noreply@societyseva.in>";

// ---------------------------------------------------------------------------
// Core send helper
// ---------------------------------------------------------------------------

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      "SMTP credentials are not configured. Set SMTP_USER and SMTP_PASS environment variables."
    );
  }

  const info = await transporter.sendMail({
    from: FROM,
    to,
    subject,
    html,
  });

  return info;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function formatINR(amount: number): string {
  return `\u20B9${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function layout(societyName: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1e3a5f;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">${societyName}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#faf5ff;padding:20px 32px;border-top:1px solid #ede9fe;">
              <p style="margin:0;color:#6b7280;font-size:13px;text-align:center;">
                This is an automated message from ${societyName} via Society Seva.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ---------------------------------------------------------------------------
// Template: Bill Notification
// ---------------------------------------------------------------------------

export async function sendBillNotification(
  member: EmailMember,
  bill: BillData,
  societyName: string
) {
  const itemRows = bill.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;">${item.name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;text-align:right;">${formatINR(item.amount)}</td>
        </tr>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 16px;color:#374151;font-size:15px;">Dear ${member.name},</p>
    <p style="margin:0 0 24px;color:#374151;font-size:15px;">
      Your maintenance bill for <strong>${bill.month}</strong> has been generated.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Bill No:</td>
        <td style="padding:8px 0;color:#374151;font-size:13px;text-align:right;font-weight:600;">${bill.billNo}</td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:20px;">
      <tr style="background-color:#f9fafb;">
        <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Description</th>
        <th style="padding:10px 12px;text-align:right;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Amount</th>
      </tr>
      ${itemRows}
      <tr style="background-color:#f3f0ff;">
        <td style="padding:12px;color:#1e3a5f;font-size:15px;font-weight:700;">Total</td>
        <td style="padding:12px;color:#1e3a5f;font-size:15px;font-weight:700;text-align:right;">${formatINR(bill.totalAmount)}</td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef3c7;border-radius:6px;padding:0;margin-bottom:24px;">
      <tr>
        <td style="padding:12px 16px;">
          <p style="margin:0;color:#92400e;font-size:14px;">
            <strong>Due Date:</strong> ${bill.dueDate}
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#374151;font-size:14px;">
      Please pay before the due date to avoid interest charges.
    </p>`;

  const subject = `Maintenance Bill for ${bill.month} - ${societyName}`;

  return sendEmail(member.email, subject, layout(societyName, body));
}

// ---------------------------------------------------------------------------
// Template: Receipt Confirmation
// ---------------------------------------------------------------------------

export async function sendReceiptConfirmation(
  member: EmailMember,
  receipt: ReceiptData,
  societyName: string
) {
  const rows = [
    ["Receipt No", receipt.receiptNo],
    ["Date", receipt.date],
    ["Amount", formatINR(receipt.amount)],
    ["Payment Mode", receipt.paymentMode],
    ["Bill Month", receipt.billMonth],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:40%;">${label}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;font-weight:600;">${value}</td>
        </tr>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 16px;color:#374151;font-size:15px;">Dear ${member.name},</p>
    <p style="margin:0 0 24px;color:#374151;font-size:15px;">
      We have received your payment. Details below:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:24px;">
      ${rows}
    </table>

    <div style="background-color:#ecfdf5;border-radius:6px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0;color:#065f46;font-size:14px;text-align:center;">
        Thank you for your timely payment.
      </p>
    </div>`;

  const subject = `Payment Receipt ${receipt.receiptNo} - ${societyName}`;

  return sendEmail(member.email, subject, layout(societyName, body));
}

// ---------------------------------------------------------------------------
// Template: Payment Reminder
// ---------------------------------------------------------------------------

export async function sendPaymentReminder(
  member: EmailMember,
  bills: OutstandingBill[],
  societyName: string
) {
  const billRows = bills
    .map((b) => {
      const outstanding = b.totalAmount - b.paidAmount;
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;">${b.billNo}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;">${b.month}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;text-align:right;">${formatINR(b.totalAmount)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;text-align:right;">${formatINR(b.paidAmount)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#dc2626;font-size:14px;font-weight:600;text-align:right;">${formatINR(outstanding)}</td>
        </tr>`;
    })
    .join("");

  const totalOutstanding = bills.reduce(
    (sum, b) => sum + (b.totalAmount - b.paidAmount),
    0
  );

  const body = `
    <p style="margin:0 0 16px;color:#374151;font-size:15px;">Dear ${member.name},</p>
    <p style="margin:0 0 24px;color:#374151;font-size:15px;">
      This is a friendly reminder that you have outstanding maintenance dues. Please find the details below:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:16px;">
      <tr style="background-color:#f9fafb;">
        <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Bill No</th>
        <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Month</th>
        <th style="padding:10px 12px;text-align:right;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Total</th>
        <th style="padding:10px 12px;text-align:right;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Paid</th>
        <th style="padding:10px 12px;text-align:right;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Outstanding</th>
      </tr>
      ${billRows}
      <tr style="background-color:#fef2f2;">
        <td colspan="4" style="padding:12px;color:#dc2626;font-size:15px;font-weight:700;">Total Outstanding</td>
        <td style="padding:12px;color:#dc2626;font-size:15px;font-weight:700;text-align:right;">${formatINR(totalOutstanding)}</td>
      </tr>
    </table>

    <p style="margin:0;color:#374151;font-size:14px;">
      Please clear your dues at the earliest.
    </p>`;

  const subject = `Payment Reminder - ${societyName}`;

  return sendEmail(member.email, subject, layout(societyName, body));
}
