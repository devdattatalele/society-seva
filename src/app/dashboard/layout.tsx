import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

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
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav
          userName={session.name}
          societyName={session.societyName}
          financialYear="2024-25"
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 py-2 text-center text-xs text-gray-500 flex items-center justify-between">
          <span>&copy; 2026 All Rights Reserved. <strong>Society Seva</strong></span>
          <div className="flex items-center gap-4">
            <button className="hover:text-purple-600">*English</button>
            <button className="hover:text-purple-600">हिंदी</button>
            <button className="hover:text-purple-600">मराठी</button>
            <button className="hover:text-purple-600">ગુજરાતી</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
