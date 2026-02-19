"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SiteThemeProvider } from "@/components/SiteThemeProvider";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't show Nav/Footer on admin pages or login page
  const isAdminRoute = pathname?.startsWith("/admin");
  const isLoginRoute = pathname === "/login";
  const hideNavFooter = isAdminRoute || isLoginRoute;

  // Wrap public pages with SiteThemeProvider for real-time theme updates
  if (hideNavFooter) {
    return <main>{children}</main>;
  }

  return (
    <SiteThemeProvider>
      <Nav />
      <main>{children}</main>
      <Footer />
    </SiteThemeProvider>
  );
}
