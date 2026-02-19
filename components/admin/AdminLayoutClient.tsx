"use client";

import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import { AdminThemeProvider, useAdminTheme } from "./AdminThemeProvider";

function AdminContent({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  const theme = useAdminTheme();

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: theme.admin_bg_color }}
    >
      <AdminSidebar userEmail={userEmail} />
      <main
        className="flex-1 ml-64 p-8"
        style={{ color: theme.admin_text_color }}
      >
        {children}
      </main>
    </div>
  );
}

export default function AdminLayoutClient({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  return (
    <AdminThemeProvider>
      <AdminContent userEmail={userEmail}>{children}</AdminContent>
    </AdminThemeProvider>
  );
}
