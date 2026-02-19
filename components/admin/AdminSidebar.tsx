"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase-client";
import { useAdminTheme } from "./AdminThemeProvider";

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
  const theme = useAdminTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50"
      style={{
        backgroundColor: theme.admin_sidebar_color,
        borderRight: `1px solid ${theme.admin_border_color}`,
      }}
    >
      {/* Header */}
      <div
        className="p-6"
        style={{ borderBottom: `1px solid ${theme.admin_border_color}` }}
      >
        <Link href="/" className="block">
          <h1
            className="font-['Giants_Inline'] text-xl tracking-wider"
            style={{ color: theme.admin_text_color }}
          >
            FORENSIC
          </h1>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.3em]"
            style={{ color: theme.admin_text_muted_color }}
          >
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
              className="flex items-center gap-3 px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all"
              style={{
                backgroundColor: isActive ? `${theme.admin_accent_color}15` : "transparent",
                color: isActive ? theme.admin_text_color : theme.admin_text_muted_color,
                borderLeft: isActive ? `2px solid ${theme.admin_accent_color}` : "2px solid transparent",
              }}
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div
        className="p-4"
        style={{ borderTop: `1px solid ${theme.admin_border_color}` }}
      >
        <div
          className="text-[9px] uppercase tracking-widest mb-2 truncate"
          style={{ color: theme.admin_text_muted_color }}
        >
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
