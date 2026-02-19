"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase-client";

interface AdminSidebarProps {
  userEmail: string;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◉" },
  { href: "/admin/blog", label: "Blog", icon: "◳" },
  { href: "/admin/events", label: "Events", icon: "◫" },
  { href: "/admin/content", label: "Site Content", icon: "◈" },
  { href: "/admin/gallery", label: "Gallery", icon: "◧" },
  { href: "/admin/merch", label: "Merch", icon: "◪" },
  { href: "/admin/models", label: "Model Team", icon: "◩" },
  { href: "/admin/influencers", label: "Influencers", icon: "◬" },
  { href: "/admin/intakes", label: "Intakes", icon: "◭" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "◮" },
  { href: "/admin/outreach", label: "Outreach", icon: "◯" },
  { href: "/admin/links", label: "Social Links", icon: "◰" },
  { href: "/admin/seo", label: "SEO & Social", icon: "◲" },
  { href: "/admin/theme", label: "Theme & Design", icon: "◐" },
  { href: "/admin/settings", label: "Settings", icon: "◱" },
];

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-white/10 flex flex-col z-50">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="block">
          <h1 className="font-['Giants_Inline'] text-xl tracking-wider text-white">
            FORENSIC
          </h1>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
            ADMIN CONSOLE
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                isActive
                  ? "bg-white/10 text-white border-l-2 border-white"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="text-[9px] text-white/40 uppercase tracking-widest mb-2 truncate">
          {userEmail}
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-[10px] font-bold uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors py-2"
        >
          LOGOUT →
        </button>
      </div>
    </aside>
  );
}
