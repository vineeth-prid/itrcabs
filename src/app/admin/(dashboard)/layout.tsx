import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · ITR Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return <AdminShell adminName={session?.name ?? "Admin"}>{children}</AdminShell>;
}
