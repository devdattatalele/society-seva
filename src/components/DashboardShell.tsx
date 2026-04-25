"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

interface DashboardShellProps {
  userName: string;
  societyName: string;
  financialYear: string;
  children: React.ReactNode;
}

export default function DashboardShell({ userName, societyName, financialYear, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav
          userName={userName}
          societyName={societyName}
          financialYear={financialYear}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-3 md:p-4">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 px-4 py-2 text-center text-xs text-gray-500 hidden md:flex items-center justify-between">
          <span>&copy; 2026 All Rights Reserved. <strong>Society Seva</strong></span>
          <div className="flex items-center gap-4">
            <button className="hover:text-teal-600">*English</button>
            <button className="hover:text-teal-600">Hindi</button>
            <button className="hover:text-teal-600">Marathi</button>
            <button className="hover:text-teal-600">Gujarati</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
