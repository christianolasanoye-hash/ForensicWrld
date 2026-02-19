import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Configuration Required</h1>
          <p className="text-white/60 mb-4">
            Supabase environment variables are not configured. Please add the following to your Vercel environment:
          </p>
          <ul className="text-left text-sm text-white/40 space-y-2 bg-white/5 p-4 border border-white/10">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>ADMIN_EMAILS</li>
          </ul>
        </div>
      </div>
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
      redirect("/login");
    }

    return (
      <AdminLayoutClient userEmail={user.email || ""}>
        {children}
      </AdminLayoutClient>
    );
  } catch (error) {
    console.error("Admin layout error:", error);
    redirect("/login");
  }
}
