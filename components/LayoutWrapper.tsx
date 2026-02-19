"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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

  return (
    <>
      {!hideNavFooter && <Nav />}
      <main>{children}</main>
      {!hideNavFooter && <Footer />}
    </>
  );
}
