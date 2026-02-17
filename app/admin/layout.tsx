import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // The middleware handles the redirect, but this is a fallback
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar userEmail={user.email || ""} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
