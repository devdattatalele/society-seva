import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell
      userName={session.name}
      societyName={session.societyName}
      financialYear="2024-25"
    >
      {children}
    </DashboardShell>
  );
}
