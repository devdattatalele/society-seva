import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  sendBillNotification,
  sendReceiptConfirmation,
  sendPaymentReminder,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, data } = await req.json();

  if (!type || !data) {
    return NextResponse.json(
      { error: "Missing required fields: type, data" },
      { status: 400 }
    );
  }

  try {
    switch (type) {
      case "bill": {
        const { member, bill, societyName } = data;
        if (!member || !bill || !societyName) {
          return NextResponse.json(
            { error: "Missing required fields: member, bill, societyName" },
            { status: 400 }
          );
        }
        await sendBillNotification(member, bill, societyName);
        return NextResponse.json({ success: true, message: "Bill notification sent" });
      }

      case "receipt": {
        const { member, receipt, societyName } = data;
        if (!member || !receipt || !societyName) {
          return NextResponse.json(
            { error: "Missing required fields: member, receipt, societyName" },
            { status: 400 }
          );
        }
        await sendReceiptConfirmation(member, receipt, societyName);
        return NextResponse.json({ success: true, message: "Receipt confirmation sent" });
      }

      case "reminder": {
        const { member, bills, societyName } = data;
        if (!member || !bills || !societyName) {
          return NextResponse.json(
            { error: "Missing required fields: member, bills, societyName" },
            { status: 400 }
          );
        }
        await sendPaymentReminder(member, bills, societyName);
        return NextResponse.json({ success: true, message: "Payment reminder sent" });
      }

      default:
        return NextResponse.json(
          { error: `Invalid email type: ${type}. Must be "bill", "receipt", or "reminder".` },
          { status: 400 }
        );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send email";

    // Surface a clear message when SMTP is not configured
    if (message.includes("SMTP credentials are not configured")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    console.error("Email send error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
